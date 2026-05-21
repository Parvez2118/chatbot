from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class ValidateUser(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True