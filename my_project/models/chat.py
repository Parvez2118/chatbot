import uuid

from sqlalchemy import (
    Column,
    String,
    ForeignKey,
    Text,
    DateTime
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id")
    )

    title = Column(String,default=None) #summary of the conversation 

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id")
    )

    sender = Column(String)

    content = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )