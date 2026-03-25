import uuid
from datetime import datetime
from enum import Enum

from sqlmodel import Field, SQLModel

from app.schemas.mixin import TimeStampMixin


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TodoStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class TodoBase(SQLModel):
    title: str = Field(max_length=200, nullable=False)
    description: str = Field(nullable=False)
    status: TodoStatus = Field(default=TodoStatus.NOT_STARTED, nullable=False)
    priority: Priority | None = Field(default=None, nullable=True)
    due_date: datetime | None = Field(default=None, nullable=True)


class Todo(TodoBase, TimeStampMixin, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, primary_key=True, index=True, nullable=False
    )
    # Owner of the todo. Required for access control and statistics.
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, nullable=False)
