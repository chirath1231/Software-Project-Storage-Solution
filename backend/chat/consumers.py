import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Message

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
        text = (data.get("message") or "").strip()
        if not text:
            return

        user = self.scope.get("user")

        # ✅ If not logged in, still broadcast but don't save to DB
        if not user or isinstance(user, AnonymousUser) or user.is_anonymous:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "text": text,
                    "sender_username": "anonymous",
                    "timestamp": "",
                },
            )
            return

        # ✅ Save message safely
        msg = await self.save_message(user.id, int(self.room_id), text)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "id": msg["id"],
                "text": msg["text"],
                "sender_username": msg["sender_username"],
                "timestamp": msg["timestamp"],
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
            "sender_username": m.sender.username,
            "timestamp": m.timestamp.isoformat(),
        }