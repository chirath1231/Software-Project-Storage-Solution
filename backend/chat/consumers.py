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

        self.user_group_name = f"user_{user.id}"

        # 1. Join user-specific group
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)

        # 2. Update status to Online in DB (returns True if this is the user's first connection)
        is_first_connection = await self.update_user_status(user.id, True)

        # 3. Notify all chat partners that this user is online ONLY if it's the first connection
        if is_first_connection:
            partners = await self.get_chat_partners(user.id)
            for partner_id in partners:
                await self.channel_layer.group_send(
                    f"user_{partner_id}",
                    {
                        "type": "presence_update",
                        "user_id": user.id,
                        "is_online": True,
                        "last_seen": None
                    }
                )

        await self.accept()

    async def disconnect(self, close_code):
        user = self.scope["user"]
        if user.is_authenticated:
            # 1. Update status to Offline (returns last_seen if all connections are closed)
            last_seen, is_now_offline = await self.update_user_status(user.id, False)

            # 2. Notify all chat partners that this user is offline ONLY if all connections are closed
            if is_now_offline:
                partners = await self.get_chat_partners(user.id)
                for partner_id in partners:
                    await self.channel_layer.group_send(
                        f"user_{partner_id}",
                        {
                            "type": "presence_update",
                            "user_id": user.id,
                            "is_online": False,
                            "last_seen": last_seen
                        }
                    )

        # 3. Discard group membership
        if hasattr(self, "user_group_name"):
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        user = self.scope["user"]
        data = json.loads(text_data)

        conversation_id = data.get("conversation_id")
        text = (data.get("text") or "").strip()
        client_id = data.get("client_id")

        if not text or not conversation_id:
            return

        # Verify the user is a participant of the conversation
        is_member = await self.is_member(user.id, conversation_id)
        if not is_member:
            return

        msg = await self.create_message(conversation_id, user.id, text)

        # Broadcast the message to all participants' user groups
        participants = await self.get_conversation_participants(conversation_id)
        for participant_id in participants:
            payload = {
                "type": "chat_message_event",
                "client_id": client_id,
                **msg
            }
            await self.channel_layer.group_send(
                f"user_{participant_id}",
                payload
            )

    # Group event handlers
    async def presence_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "status_update",
            "user_id": event["user_id"],
            "is_online": event["is_online"],
            "last_seen": event["last_seen"]
        }))

    async def chat_message_event(self, event):
        # We forward the payload directly as a chat message event
        msg_data = {k: v for k, v in event.items() if k != 'type'}
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            **msg_data
        }))

    @database_sync_to_async
    def is_member(self, user_id, conversation_id):
        return ConversationParticipant.objects.filter(
            user_id=user_id, conversation_id=conversation_id
        ).exists()

    @database_sync_to_async
    def get_conversation_participants(self, conversation_id):
        return list(ConversationParticipant.objects.filter(
            conversation_id=conversation_id
        ).values_list('user_id', flat=True))

    @database_sync_to_async
    def get_chat_partners(self, user_id):
        conv_ids = ConversationParticipant.objects.filter(user_id=user_id).values_list('conversation_id', flat=True)
        partner_ids = ConversationParticipant.objects.filter(conversation_id__in=conv_ids).exclude(user_id=user_id).values_list('user_id', flat=True)
        return list(set(partner_ids))

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
        profile, created = Profile.objects.get_or_create(user_id=user_id)
        if is_online:
            # Connect event
            profile.online_connections_count = max(0, profile.online_connections_count) + 1
            is_first = (profile.online_connections_count == 1) or (not profile.is_online)
            profile.is_online = True
            profile.save()
            return is_first
        else:
            # Disconnect event
            profile.online_connections_count = max(0, profile.online_connections_count - 1)
            is_now_offline = (profile.online_connections_count == 0)
            last_seen_iso = None
            if is_now_offline:
                profile.is_online = False
                now = timezone.now()
                profile.last_seen = now
                last_seen_iso = now.isoformat()
            profile.save()
            return last_seen_iso, is_now_offline