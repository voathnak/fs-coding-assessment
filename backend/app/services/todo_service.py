import uuid

from fastapi import HTTPException, status

from app.models.todo import Todo
from app.models.todo import Priority as PriorityEnum
from app.repositories.todo_repository import TodoRepository
from app.schemas.todo import TodoCreate, TodoRead, TodoStats, TodoUpdate


class TodoService:
    """Business logic for todo operations."""

    def __init__(self, todo_repository: TodoRepository):
        self.todo_repository = todo_repository

    async def create_todo(
        self, *, current_user_id: uuid.UUID, todo_in: TodoCreate
    ) -> TodoRead:
        """Create a todo owned by the authenticated user."""
        todo = await self.todo_repository.create_todo(
            user_id=current_user_id, todo_in=todo_in
        )
        return self._to_todo_read(todo, owned=True)

    async def list_todos(
        self,
        *,
        current_user_id: uuid.UUID,
        page: int,
        page_size: int,
        priority: PriorityEnum | None,
        completed: bool | None,
        search: str | None,
    ) -> list[TodoRead]:
        """List todos from all users; description is hidden for non-owners."""

        todos = await self.todo_repository.list_todos(
            page=page,
            page_size=page_size,
            priority=priority,
            completed=completed,
            search=search,
        )
        return [
            self._to_todo_read(t, owned=(t.user_id == current_user_id)) for t in todos
        ]

    async def get_todo(
        self, *, current_user_id: uuid.UUID, todo_id: uuid.UUID
    ) -> TodoRead:
        """Get a single todo; only the owner can see full details."""
        todo = await self.todo_repository.get_todo(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
            )
        if todo.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        return self._to_todo_read(todo, owned=True)

    async def update_todo(
        self,
        *,
        current_user_id: uuid.UUID,
        todo_id: uuid.UUID,
        todo_in: TodoUpdate,
    ) -> TodoRead:
        """Update a todo; only the owner can update."""
        todo = await self.todo_repository.get_todo(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
            )
        if todo.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )

        update_data = todo_in.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update",
            )

        updated = await self.todo_repository.update_todo(todo_id=todo_id, todo_in=todo_in)
        assert updated is not None
        return self._to_todo_read(updated, owned=True)

    async def delete_todo(
        self, *, current_user_id: uuid.UUID, todo_id: uuid.UUID
    ) -> None:
        """Delete a todo; only the owner can delete."""
        todo = await self.todo_repository.get_todo(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
            )
        if todo.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )

        await self.todo_repository.delete_todo(todo_id=todo_id)

    async def complete_todo(
        self, *, current_user_id: uuid.UUID, todo_id: uuid.UUID
    ) -> TodoRead:
        """Toggle a todo's completed status; only the owner can perform this action."""
        todo = await self.todo_repository.get_todo(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
            )
        if todo.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )

        updated = await self.todo_repository.toggle_complete(todo_id=todo_id)
        assert updated is not None
        return self._to_todo_read(updated, owned=True)

    async def get_stats(self, *, current_user_id: uuid.UUID) -> TodoStats:
        """Get statistics for the authenticated user's todos."""
        return await self.todo_repository.get_stats(user_id=current_user_id)

    @staticmethod
    def _to_todo_read(todo: Todo, *, owned: bool) -> TodoRead:
        """Map a Todo model to the API response schema."""
        description = todo.description if owned else None
        return TodoRead(
            id=todo.id,
            user_id=todo.user_id,
            title=todo.title,
            description=description,
            status=todo.status,
            priority=todo.priority,
            due_date=todo.due_date,
            created_at=todo.created_at,
            updated_at=todo.updated_at,
        )
