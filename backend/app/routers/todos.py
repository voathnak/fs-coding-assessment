import uuid
from fastapi import APIRouter, Query, status

from app.dependencies.auth import CurrentUserDep
from app.dependencies.todo import TodoServiceDep
from app.models.todo import Priority
from app.schemas.todo import TodoCreate, TodoRead, TodoStats, TodoUpdate


router = APIRouter(prefix="/todos", tags=["todos"])


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_in: TodoCreate,
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
) -> TodoRead:
    """Create a new todo for the authenticated user."""
    return await todo_service.create_todo(
        current_user_id=current_user.id, todo_in=todo_in
    )


@router.get("", response_model=list[TodoRead], response_model_exclude_none=True)
async def get_todos(
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    priority: Priority | None = None,
    completed: bool | None = None,
    search: str | None = None,
) -> list[TodoRead]:
    """List todos from all users (description hidden for non-owners)."""
    return await todo_service.list_todos(
        current_user_id=current_user.id,
        page=page,
        page_size=page_size,
        priority=priority,
        completed=completed,
        search=search,
    )








@router.get("/{todo_id:uuid}", response_model=TodoRead)
async def get_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
) -> TodoRead:
    """Get a single todo (owner only)."""
    return await todo_service.get_todo(
        current_user_id=current_user.id, todo_id=todo_id
    )


@router.patch("/{todo_id:uuid}", response_model=TodoRead)
async def update_todo(
    todo_id: uuid.UUID,
    todo_in: TodoUpdate,
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
) -> TodoRead:
    """Partially update a todo (owner only)."""
    return await todo_service.update_todo(
        current_user_id=current_user.id, todo_id=todo_id, todo_in=todo_in
    )


@router.put("/{todo_id:uuid}", response_model=TodoRead)
async def put_todo(
    todo_id: uuid.UUID,
    todo_in: TodoUpdate,
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
) -> TodoRead:
    """Replace a todo (uses the same payload as PATCH)."""
    return await todo_service.update_todo(
        current_user_id=current_user.id, todo_id=todo_id, todo_in=todo_in
    )


@router.delete("/{todo_id:uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
) -> None:
    """Delete a todo (owner only)."""
    await todo_service.delete_todo(
        current_user_id=current_user.id, todo_id=todo_id
    )


@router.patch("/{todo_id:uuid}/complete", response_model=TodoRead)
async def complete_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
) -> TodoRead:
    """Toggle a todo's completion status (owner only)."""
    return await todo_service.complete_todo(
        current_user_id=current_user.id, todo_id=todo_id
    )


@router.get("/stats", response_model=TodoStats)
async def get_stats(
    todo_service: TodoServiceDep,
    current_user: CurrentUserDep,
) -> TodoStats:
    """Get statistics for the authenticated user's todos."""
    return await todo_service.get_stats(current_user_id=current_user.id)
