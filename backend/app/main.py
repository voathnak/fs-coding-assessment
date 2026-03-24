"""Main FastAPI application module."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, todos, users


settings = get_settings()


def get_allowed_origins() -> list[str]:
    """
    Build CORS allow list from env and sensible local defaults.
    Supports comma-separated FRONTEND_URL values.
    """
    configured = [
        origin.strip()
        for origin in settings.FRONTEND_URL.split(",")
        if origin.strip()
    ]
    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    unique: list[str] = []
    for origin in [*configured, *defaults]:
        if origin not in unique:
            unique.append(origin)
    return unique


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    yield
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Todo management API with authentication",
    version="1.0.0",
    lifespan=lifespan,
    openapi_url="/openapi.json",
)


# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(todos.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Todo API is running!", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
