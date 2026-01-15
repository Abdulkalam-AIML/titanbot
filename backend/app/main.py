from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from app.routes import auth, chat, users
from app.database.database import database

app = FastAPI(
    title="TitanBot API",
    description="Backend API for TitanBot SaaS",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Change this to specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database startup event
@app.on_event("startup")
async def startup():
    await database.connect()
    # Create tables
    from app.database.database import engine, Base
    from app.database import models # Ensure models are imported
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "TitanBot API is running"}
