"""Pytest configuration and shared fixtures."""

import os
import sys
from pathlib import Path

import pytest
from sqlmodel import SQLModel

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


# Provide defaults for local/CI environments that don't ship a `.env` file.
# These env vars must exist before `app.core.config` is imported (it uses caching).
_db_path = Path(__file__).parent / "test_todo_api.db"
os.environ.setdefault("DATABASE_URL", f"sqlite+aiosqlite:///{_db_path}")
os.environ.setdefault(
    "SECRET_KEY", "test-secret-key-please-change-1234567890abcd"
)
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")


@pytest.fixture(scope="session", autouse=True)
async def _prepare_test_db():
    """Create tables in the test database before any tests run."""
    # Import models so SQLModel metadata is fully registered.
    import app.models.todo as _  # noqa: F401
    import app.models.user as _  # noqa: F401

    from app.db.session import engine

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    yield
