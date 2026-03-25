"""Add user_id relationship to todo.

Revision ID: 9f2b3a4c5d6e
Revises: 645dcb8d91e0
Create Date: 2026-03-23
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9f2b3a4c5d6e"
down_revision: Union[str, Sequence[str], None] = "645dcb8d91e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply schema changes."""
    op.add_column("todo", sa.Column("user_id", sa.Uuid(), nullable=False))
    op.create_index(op.f("ix_todo_user_id"), "todo", ["user_id"], unique=False)
    op.create_foreign_key(
        "fk_todo_user_id_user",
        "todo",
        "user",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Revert schema changes."""
    op.drop_constraint("fk_todo_user_id_user", "todo", type_="foreignkey")
    op.drop_index(op.f("ix_todo_user_id"), table_name="todo")
    op.drop_column("todo", "user_id")

