import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import text
from app.core.config import get_settings

async def verify_db():
    settings = get_settings()
    print(f"Connecting to {settings.DATABASE_URL}")
    engine = create_async_engine(settings.DATABASE_URL)
    
    async with AsyncSession(engine) as session:
        try:
            # Check if user table exists
            result = await session.execute(text("SELECT count(*) FROM \"user\""))
            count = result.scalar()
            print(f"Success! 'user' table exists and has {count} rows.")
        except Exception as e:
            print(f"Error: {e}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_db())
