from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession
)
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = "postgresql://neondb_owner:npg_NSRVG2WCrXH1@ep-icy-grass-apkov37s.c-7.us-east-1.aws.neon.tech/neondb?ssl=require"

DATABASE_URL = DATABASE_URL.replace(
    "postgresql://",
    "postgresql+asyncpg://"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=True
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()



async def get_db():
    async with AsyncSessionLocal() as session:
        yield session