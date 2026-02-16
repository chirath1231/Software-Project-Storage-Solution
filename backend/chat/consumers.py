import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"chat_{self.room_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get("message", "").strip()
        if not text:
            return

        user = self.scope["user"]
        msg = await self.save_message(user_id=user.id, conversation_id=self.room_id, text=text)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "id": msg["id"],
                "text": msg["text"],
                "timestamp": msg["timestamp"],
                "sender_username": msg["sender_username"],
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, user_id, conversation_id, text):
        m = Message.objects.create(
            conversation_id=conversation_id,
            sender_id=user_id,
            text=text
        )
        return {
            "id": m.id,
            "text": m.text,
            "timestamp": m.timestamp.isoformat(),
            "sender_username": m.sender.username,
        }