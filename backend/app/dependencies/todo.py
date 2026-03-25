from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.db.session import get_async_session
from app.repositories.todo_repository import TodoRepository
from app.services.todo_service import TodoService


def get_todo_service(session: Session = Depends(get_async_session)) -> TodoService:
    """Create TodoService wired to the request-scoped DB session."""
    todo_repository = TodoRepository(session)
    return TodoService(todo_repository)

TodoServiceDep = Annotated[TodoService, Depends(get_todo_service)]

