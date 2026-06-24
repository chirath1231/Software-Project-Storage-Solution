import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ConversationParticipant, Message
from accounts.models import Profile
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close()
            return

        # 1. Get the conversation ID
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        
        # 2. DEFINED HERE: Now it exists for all subsequent methods
        self.room_group_name = f"chat_{self.conversation_id}"

        is_member = await self.is_member(user.id, self.conversation_id)
        if not is_member:
            await self.close()
            return

        # 3. Join the group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # 4. Update status
        await self.update_user_status(user.id, True)
        
        # 5. Broadcast "User is Online"
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "user_status_update", "user_id": user.id, "is_online": True}
        )

        await self.accept()

    async def disconnect(self, close_code):
        # ✅ The check hasattr(self, "room_group_name") is safe now, 
        # but since we define it in connect, it will always be there for authenticated users.
        user = self.scope["user"]
        if user.is_authenticated:
            await self.update_user_status(user.id, False)
            
            # Broadcast "User is Offline"
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "user_status_update", "user_id": user.id, "is_online": False}
            )

        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        user = self.scope["user"]
        data = json.loads(text_data)

        text = (data.get("text") or "").strip()
        client_id = data.get("client_id")

        if not text:
            return

        msg = await self.create_message(self.conversation_id, user.id, text)

        payload = {"type": "chat_message", **msg}
        if client_id:
            payload["client_id"] = client_id

        await self.channel_layer.group_send(self.room_group_name, payload)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_status_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "status_update",
            "user_id": event["user_id"],
            "is_online": event["is_online"]
        }))    

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

    @database_sync_to_async
    def update_user_status(self, user_id, is_online):
        try:
            profile = Profile.objects.get(user_id=user_id)
            profile.is_online = is_online
            if not is_online:
                profile.last_seen = timezone.now()
            profile.save()
            return True
        except Profile.DoesNotExist:
            return False