import uuid

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.todo import Priority, Todo, TodoStatus
from app.schemas.todo import TodoCreate, TodoStats, TodoUpdate


class TodoRepository:
    """Persistence layer for todos."""

    def __init__(self, session: Session):
        self.session = session

    async def create_todo(self, *, user_id: uuid.UUID, todo_in: TodoCreate) -> Todo:
        todo = Todo(
            **todo_in.model_dump(),
            user_id=user_id,
        )
        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def get_todo(self, todo_id: uuid.UUID) -> Todo | None:
        return await self.session.get(Todo, todo_id)

    async def list_todos(
        self,
        *,
        page: int,
        page_size: int,
        priority: Priority | None = None,
        completed: bool | None = None,
        search: str | None = None,
    ) -> list[Todo]:
        statement = select(Todo)
        if priority is not None:
            statement = statement.where(Todo.priority == priority)
        if completed is True:
            statement = statement.where(Todo.status == TodoStatus.COMPLETED)
        elif completed is False:
            statement = statement.where(Todo.status != TodoStatus.COMPLETED)
        if search:
            statement = statement.where(Todo.title.ilike(f"%{search}%"))

        statement = statement.order_by(Todo.created_at.desc())
        statement = statement.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.exec(statement)
        return result.all()

    async def update_todo(
        self, *, todo_id: uuid.UUID, todo_in: TodoUpdate
    ) -> Todo | None:
        todo = await self.get_todo(todo_id)
        if not todo:
            return None

        update_data = todo_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(todo, key, value)

        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def delete_todo(self, *, todo_id: uuid.UUID) -> bool:
        todo = await self.get_todo(todo_id)
        if not todo:
            return False

        self.session.delete(todo)
        await self.session.commit()
        return True

    async def toggle_complete(self, *, todo_id: uuid.UUID) -> Todo | None:
        todo = await self.get_todo(todo_id)
        if not todo:
            return None

        todo.status = (
            TodoStatus.COMPLETED
            if todo.status != TodoStatus.COMPLETED
            else TodoStatus.NOT_STARTED
        )

        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def get_stats(self, *, user_id: uuid.UUID) -> TodoStats:
        total_stmt = select(func.count()).where(Todo.user_id == user_id)
        completed_stmt = select(func.count()).where(
            Todo.user_id == user_id, Todo.status == TodoStatus.COMPLETED
        )

        by_priority_stmt = (
            select(Todo.priority, func.count())
            .where(Todo.user_id == user_id, Todo.priority.is_not(None))
            .group_by(Todo.priority)
        )

        total = (await self.session.exec(total_stmt)).one()
        completed = (await self.session.exec(completed_stmt)).one()
        pending = total - completed

        # Initialize with zeros; missing priorities become 0.
        by_priority_counts: dict[str, int] = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
        rows = (await self.session.exec(by_priority_stmt)).all()
        for priority, count in rows:
            if priority is None:
                continue
            key = priority.value if isinstance(priority, Priority) else str(priority)
            by_priority_counts[key] = int(count)

        from app.schemas.todo import TodoStatsByPriority

        return TodoStats(
            total=int(total),
            completed=int(completed),
            pending=int(pending),
            by_priority=TodoStatsByPriority(**by_priority_counts),
        )
