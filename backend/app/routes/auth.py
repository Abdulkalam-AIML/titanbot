from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import httpx
from passlib.context import CryptContext
from app.database.database import get_db
from app.database.models import User

router = APIRouter()

# Config
SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

import bcrypt

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class GoogleLoginRequest(BaseModel):
    token: str

class AppleLoginRequest(BaseModel):
    identityToken: str
    user: Optional[str] = None # JSON string details

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Replaced passlib with direct bcrypt to avoid 72 byte limit error
def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@router.post("/register", response_model=Token)
async def register(request: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(request.password)
    user = User(
        email=request.email, 
        full_name=request.full_name,
        hashed_password=hashed_pw,
        role="user" 
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(request: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    
    if not user or not verify_password(request.password, user.hashed_password):
         raise HTTPException(status_code=400, detail="Incorrect email or password")
         
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def verify_google_token(token: str):
    # DEVELOPMENT: Allow mock token
    if token == "mock_google_token_123":
        return {
            "email": "test@example.com",
            "name": "Test User",
            "picture": "https://via.placeholder.com/150",
            "aud": GOOGLE_CLIENT_ID or "mock_client_id"
        }

    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google Token")
        data = response.json()
        if data["aud"] != GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID is not None:
             pass
        return data

@router.post("/google", response_model=Token)
async def google_login(request: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. Verify Google Token
    google_data = await verify_google_token(request.token)
    
    email = google_data.get("email")
    name = google_data.get("name")
    picture = google_data.get("picture")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in Google Token")

    # 2. Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    # 3. Create if not exists
    if not user:
        user = User(email=email, full_name=name, avatar_url=picture, role="user")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # 4. Create JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/apple", response_model=Token)
async def apple_login(request: AppleLoginRequest, db: AsyncSession = Depends(get_db)):
    # Mock Apple Login for development
    # In production, verify identityToken with Apple Keys
    
    email = "apple_user@example.com"
    name = "Apple User"
    
    # 2. Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    # 3. Create if not exists
    if not user:
        user = User(email=email, full_name=name, role="user")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # 4. Create JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
