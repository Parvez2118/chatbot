from langchain_aws import ChatBedrockConverse

from langchain_classic.agents import (
    AgentExecutor,
    create_tool_calling_agent,
    tool,
)
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from database import engine, Base

# IMPORTANT IMPORTS
from models.user import User
from models.chat import Conversation, Message
from schemas import (
    UserCreate,
    ValidateUser,
    UserResponse
)
from langchain_google_genai import ChatGoogleGenerativeAI

from jose import jwt
from datetime import datetime, timedelta

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

# JWT Config
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
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
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

@app.post("/")
def read_root(body: dict):
    message = body.get("message")

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
            model="gemini-2.5-flash",
            google_api_key="AIzaSyCpAlV38gn7ukhrxbWKSUF3i3VCSE1jOwg"
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
    return {"reply": agentData.get("output")}



@app.post("/create_user")
async def create_user(
    user:UserCreate,
    db:AsyncSession=Depends(get_db)
):
    print("inside create_user function ",   user)
    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password
    )
    db.add(new_user)

    await db.commit()

    await db.refresh(new_user)

    return new_user


@app.post("/validate_user")
async def validate_user(
    user:ValidateUser,
    db:AsyncSession=Depends(get_db)
):
    print("inside vaidate function ",   user)

    stmt = select(User).where(
        User.email == user.email
    )

    result  = await db.execute(stmt)

    userdata = result.scalar_one_or_none()

    if not userdata:
        return {
            "success":False,
            "message":"User not found"
        }
    
    if userdata.password != user.password:
        return {
            "success": False,
            "message": "Invalid Password"
        }
    
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
