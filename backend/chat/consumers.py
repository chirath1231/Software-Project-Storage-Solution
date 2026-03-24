import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ConversationParticipant, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close()
            return

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        is_member = await self.is_member(user.id, self.conversation_id)
        if not is_member:
            await self.close()
            return

        self.room_group_name = f"chat_{self.conversation_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        user = self.scope["user"]
        data = json.loads(text_data)

        text = (data.get("text") or "").strip()
        client_id = data.get("client_id")  # ✅ NEW (used to prevent duplicates)

        if not text:
            return

        msg = await self.create_message(self.conversation_id, user.id, text)

        payload = {"type": "chat_message", **msg}
        if client_id:
            payload["client_id"] = client_id  # ✅ NEW

        await self.channel_layer.group_send(self.room_group_name, payload)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def is_member(self, user_id, conversation_id):
        return ConversationParticipant.objects.filter(
            user_id=user_id, conversation_id=conversation_id
        ).exists()

    @database_sync_to_async
    def create_message(self, conversation_id, sender_id, text):
        m = Message.objects.create(
            conversation_id=conversation_id, sender_id=sender_id, text=text
        )
        return {
            "id": m.id,
            "conversation": m.conversation_id,
            "sender": m.sender_id,
            "sender_username": m.sender.username,
            "text": m.text,
            "created_at": m.created_at.isoformat(),
        }
