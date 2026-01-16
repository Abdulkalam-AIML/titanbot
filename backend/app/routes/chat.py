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
    SYSTEM_PROMPT = """You are TitanBot, an elite Technical AI Assistant specialized in Software Engineering, Coding, and Computer Science.
    
    Your Goal: Provide highly accurate, efficient, and technically detailed answers.
    - Prefer code examples.
    - Explain complex technical concepts clearly.
    - Debug errors with precision.
    """
    
    messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}] + history_msgs

    # 3. Stream Response
    # 3. Stream Response
    # 3. Stream Response (PURE CLOUD - GEMINI ONLY)
    async def generate_response():
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
             yield f"Configuration Error: GEMINI_API_KEY is missing in Vercel. Please add it to Settings -> Environment Variables."
             return

        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        
        # Priority list: reliable flash first, then powerful pro, then legacy
        candidate_models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro']
        
        response_stream = None
        last_error = None
        working_model_name = None

        # Reconstruct prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\n"
        for msg in history_msgs:
            full_prompt += f"{msg['role'].upper()}: {msg['content']}\n"
        full_prompt += f"USER: {request.message}\nASSISTANT:"

        # Attempt 1: Try Standard Models
        for model_name in candidate_models:
            try:
                model = genai.GenerativeModel(model_name)
                response_stream = model.generate_content(full_prompt, stream=True)
                working_model_name = model_name
                break 
            except Exception as e:
                last_error = e
                continue
        
        # Attempt 2: If all standard failed, try to find ANY available model from user account
        if not response_stream:
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                         # Try this available model
                         try:
                             model = genai.GenerativeModel(m.name)
                             response_stream = model.generate_content(full_prompt, stream=True)
                             working_model_name = m.name
                             break
                         except:
                             continue
            except:
                pass

        # Stream or Fail
        if response_stream:
            try:
                for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text
            except Exception as stream_error:
                    yield f"Error streaming content from {working_model_name}: {str(stream_error)}"
        else:
            # Failure Report
            error_msg = f"TitanBot Cloud Error: Could not connect to Google Gemini.\n\n"
            error_msg += f"1. We tried these models: {', '.join(candidate_models)}\n"
            error_msg += f"2. We tried auto-discovering models from your key.\n"
            error_msg += f"3. All failed. Last error: {str(last_error)}\n\n"
            error_msg += "Please check your GEMINI_API_KEY is correct and has access to Generative Language API."
            yield error_msg

    return StreamingResponse(generate_response(), media_type="text/event-stream")
