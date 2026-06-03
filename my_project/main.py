from langchain_aws import ChatBedrockConverse
import json
from langchain_classic.agents import (
    AgentExecutor,
    create_tool_calling_agent,
    tool,
)
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import LLMChain
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from database import engine, Base

from databaseQuery.chat import ConversationRepository
from databaseQuery.chat import MessageRepository

from dotenv import load_dotenv
import os

# IMPORTANT IMPORTS
from models.user import User
from models.chat import Conversation, Message
from schemas import (
    UserCreate,
    ValidateUser,
    UserResponse
)
from langchain_google_genai import ChatGoogleGenerativeAI

from jose import jwt, JWTError
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():

    async with engine.begin() as conn:
        await conn.run_sync(
            Base.metadata.create_all
        )

ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        os.getenv("SECRET_KEY"),
        algorithm=os.getenv("ALGORITHM")
    )

    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )

        return payload

    except JWTError as e:
        print("Token is invalid:", str(e))
        return None


@app.post("/stream_chat/{chat_id}")
async def read_root(request: Request, 
                body: dict,
                chat_id:str,
                db:AsyncSession=Depends(get_db)):
    headers = request.headers
    
    auth_header = request.headers.get("token")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")
    
    payload = verify_token(auth_header)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    print("ai continues ===================")
    
    message = body.get("message")

    new_message = Message(
        conversation_id=chat_id,
        sender="Human",
        content=message
    )
    db.add(new_message)

    await db.commit()

    await db.refresh(new_message)

    print(f"Received message: {message}")
    prompt = ChatPromptTemplate.from_messages(
             [
            ("system", "You are a helpful assistant. your name is Claude."),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ]
    )
    model = ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL"),
            google_api_key=os.getenv("GOOGLE_API_KEY")
            )

    @tool
    def magic_function(input: int) -> int:
        """Applies a magic function to an input."""
        return input + 2

    tools = [magic_function]

    agent = create_tool_calling_agent(model, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    agentData = agent_executor.invoke({"input": message})
    print(f"Agent data: {agentData}")   
    print(agentData.get("output"))

    new_message_ai = Message(
        conversation_id=chat_id,
        sender="AI",
        content=json.dumps(agentData.get("output"))
    )
    db.add(new_message_ai)

    await db.commit()

    await db.refresh(new_message_ai)
    return {"reply": agentData.get("output")}



@app.post("/create_user")
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == user.email)

    result = await db.execute(stmt)

    userdata = result.scalar_one_or_none()

    if userdata:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password
    )

    db.add(new_user)

    await db.commit()

    await db.refresh(new_user)

    return {
        "success": True,
        "message": "User created successfully",
        "data": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


@app.post("/validate_user")
async def validate_user(
    user: ValidateUser,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(
        User.email == user.email
    )

    result = await db.execute(stmt)
    userdata = result.scalar_one_or_none()

    if not userdata:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if userdata.password != user.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "user_id": str(userdata.id),
        "email": userdata.email
    })

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(userdata.id),
            "name": userdata.name,
            "email": userdata.email
        }
    }



@app.post("/create_chat_id")
async def create_chat(
    request: Request,
    db:AsyncSession=Depends(get_db)
):

    headers = request.headers
    
    auth_header = request.headers.get("token")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")
    
    payload = verify_token(auth_header)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    new_conversation = Conversation(
        user_id=payload.get("user_id")
    )
    db.add(new_conversation)

    await db.commit()

    await db.refresh(new_conversation)

    return new_conversation



@app.post("/summarise/{chat_id}")
async def summarise_chat(
    request: Request,
    chat_id:str,
     body: dict,
     db:AsyncSession=Depends(get_db)
):

    headers = request.headers
    
    auth_header = request.headers.get("token")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")
    
    payload = verify_token(auth_header)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    message = body.get("prompt")
    model = ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL"),
            google_api_key=os.getenv("GOOGLE_API_KEY")
            )

    prompt = PromptTemplate.from_template(
        "You are a charged with naming conversations based on the questions asked by the user.Just suggest one name and reply with just the suggested name nothing more. Return greeting if the question is just a greeting. The question is\n{message}"
    )

    chain = LLMChain(llm=model, prompt=prompt)

    summary = await chain.ainvoke(input=message)

    repo = ConversationRepository(db)

    updated_conversation = await repo.update_conversation_title(
    conversation_id=chat_id,
    new_title= summary.get("text")
    )

    return updated_conversation



@app.get("/conversations")
async def get_conversations(
    request: Request,
    db: AsyncSession = Depends(get_db)
):

    headers = request.headers
    
    auth_header = request.headers.get("token")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")
    
    payload = verify_token(auth_header)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    
    repo = ConversationRepository(db)

    conversations = await repo.get_all_conversations(user_id=payload.get("user_id"))

    return {
        "success": True,
        "data": conversations
    }



@app.get("/getmessages/{message_id}")
async def get_messages(
    message_id:str,
    db: AsyncSession = Depends(get_db)
):
    repo = MessageRepository(db)
    messages = await repo.get_all_messages(message_id)
    print(messages)
    return {
        "success": True,
        "data": messages
    }