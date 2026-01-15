import os
import ollama
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional
from app.database.database import get_db
from app.database.models import User, ChatSession, Message
from app.routes.users import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None
    model: str = "llama3.2" 

class CreateSessionRequest(BaseModel):
    title: str

@router.post("/sessions")
async def create_session(
    request: CreateSessionRequest, 
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session = ChatSession(user_id=user.id, title=request.title)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/sessions")
async def get_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ChatSession).where(ChatSession.user_id == user.id).order_by(ChatSession.updated_at.desc()))
    return result.scalars().all()

@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: int, 
    user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user.id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    result = await db.execute(select(Message).where(Message.session_id == session_id).order_by(Message.created_at.asc()))
    return result.scalars().all()

@router.post("/send")
async def send_message(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Get or Create Session
    if request.session_id:
        result = await db.execute(select(ChatSession).where(ChatSession.id == request.session_id, ChatSession.user_id == user.id))
        session = result.scalars().first()
        if not session:
             raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = ChatSession(user_id=user.id, title=request.message[:30])
        db.add(session)
        await db.commit()
        await db.refresh(session)
    
    # Capture Session ID to avoid 'MissingGreenlet' on access after subsequent commits
    current_session_id = session.id

    # 2. Save User Message
    user_msg = Message(session_id=current_session_id, role="user", content=request.message)
    db.add(user_msg)
    await db.commit()

    # Fetch history
    history_result = await db.execute(select(Message.role, Message.content).where(Message.session_id == current_session_id).order_by(Message.created_at.asc()))
    history_rows = history_result.all()
    
    # Format history for Ollama
    history_msgs = [{"role": row.role, "content": row.content} for row in history_rows]

    # Prepend System Prompt if not already present implicitly by model behavior
    # (Ollama models often have their own system prompts, but we can enforce one)
    SYSTEM_PROMPT = """You are TitanBot, a helpful and intelligent AI assistant created by Abdulkalam.
Answer questions based on Machine Learning, Python, Generative AI, and software engineering."""
    
    messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}] + history_msgs

    # 3. Stream Response
    async def generate_response():
        try:
            # Call Ollama
            stream = ollama.chat(
                model='llama3.2',
                messages=messages_payload,
                stream=True
            )
            
            for chunk in stream:
                content = chunk['message']['content']
                if content:
                    yield content

        except Exception as e:
            yield f"Error connecting to TitanBot Brain (Ollama): {str(e)}"

    return StreamingResponse(generate_response(), media_type="text/event-stream")
