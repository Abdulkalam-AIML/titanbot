from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from databases import Database
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./titanbot.db")

# Vercel Read-Only Fix: Use /tmp for SQLite if on Vercel and no Postgres URL provided
if os.getenv("VERCEL") and "sqlite" in DATABASE_URL:
     DATABASE_URL = "sqlite:///T:/tmp/titanbot.db" if os.name == 'nt' else "sqlite:////tmp/titanbot.db"

# For Databases (async)
database = Database(DATABASE_URL)

# For SQLAlchemy (async)
# Note: SQLite requires acls for async usually, or use a specific driver.
# But for simplicity in this artifact, we will use standard async setup.
# If using SQLite with async, URL should be sqlite+aiosqlite:///...
if "sqlite" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://")

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session
