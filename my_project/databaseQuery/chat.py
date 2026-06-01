from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from uuid import UUID

from models.chat import Conversation, Message


class ConversationRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def update_conversation_title(
        self,
        conversation_id: UUID,
        new_title: str
    ):
        try:
            result = await self.db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id
                )
            )

            conversation = result.scalar_one_or_none()

            if not conversation:
                return None

            conversation.title = new_title

            await self.db.commit()
            await self.db.refresh(conversation)

            return conversation

        except SQLAlchemyError as e:
            self.db.rollback()
            raise e

    
    async def get_all_conversations(self):
        result = await self.db.execute(
            select(
                Conversation.id,
                Conversation.title
            )
        )

        conversations = result.all()

        return [
            {
                "id": str(conversation.id),
                "title": conversation.title
            }
            for conversation in conversations
        ]



class MessageRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_messages(self, message_id:str):
        result = await self.db.execute(
            select(Message).where(
                    Message.conversation_id == message_id
                )
        )

        messages = result.scalars().all()

        return [
            {
                "id": str(message.id),
                "sender": message.sender,
                "content":message.content
            }
            for message in messages
        ]