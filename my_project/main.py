from langchain_aws import ChatBedrockConverse

from langchain_classic.agents import (
    AgentExecutor,
    create_tool_calling_agent,
    tool,
)
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from langchain_google_genai import ChatGoogleGenerativeAI

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


