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


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
