from datetime import datetime
import uuid

from sqlmodel import Field, SQLModel

from app.models.todo import Priority, TodoStatus
from app.schemas.mixin import TimeStampMixin


class TodoCreate(SQLModel):
    """Payload for creating a new todo."""

    title: str = Field(max_length=200)
    description: str
    priority: Priority | None = Field(default=None)
    due_date: datetime | None = Field(default=None)


class TodoUpdate(SQLModel):
    """Payload for updating a todo (supports PATCH/partial updates)."""

    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None)
    priority: Priority | None = Field(default=None)
    due_date: datetime | None = Field(default=None)


class TodoRead(TimeStampMixin, SQLModel):
    """Todo returned from the API."""

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    # For list endpoints, the description may be omitted via `response_model_exclude_none=True`.
    description: str | None = None
    status: TodoStatus
    priority: Priority | None = None
    due_date: datetime | None = None


class TodoStatsByPriority(SQLModel):
    """Aggregated counts by priority."""

    LOW: int = 0
    MEDIUM: int = 0
    HIGH: int = 0


class TodoStats(SQLModel):
    """Todo statistics response."""

    total: int
    completed: int
    pending: int
    by_priority: TodoStatsByPriority

