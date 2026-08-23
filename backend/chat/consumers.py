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

        # 2. Update status to Online in DB
        is_first_connection = await self.update_user_status(user.id, True)

        await self.accept()

        # 3. Notify all chat partners that this user is online
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

        # 4. Sync online status of any already-online partners back to this newly connected user
        online_partners = await self.get_online_chat_partners(partners)
        for p_id in online_partners:
            await self.send(text_data=json.dumps({
                "type": "status_update",
                "user_id": p_id,
                "is_online": True,
                "last_seen": None
            }))

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

    async def user_status_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "status_update",
            "user_id": event["user_id"],
            "is_online": event["is_online"]
        }))

    async def group_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "group_update",
            "conversation_id": event["conversation_id"]
        }))

    async def message_deleted_event(self, event):
        await self.send(text_data=json.dumps({
            "type": "message_deleted",
            "message_id": event["message_id"],
            "conversation_id": event["conversation_id"]
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
    def get_online_chat_partners(self, partner_ids):
        if not partner_ids:
            return []
        return list(Profile.objects.filter(user_id__in=partner_ids, is_online=True).values_list('user_id', flat=True))

    @database_sync_to_async
    def create_message(self, conversation_id, sender_id, text):
        m = Message.objects.create(
            conversation_id=conversation_id, sender_id=sender_id, text=text
        )
        
        # --- TRIGGER NOTIFICATIONS & RESEND EMAILS ---
        try:
            from django.apps import apps
            import os
            import resend
            
            NotificationModel = apps.get_model('notifications', 'Notification')
            
            # Get all participants in this conversation except the sender
            participants = ConversationParticipant.objects.filter(
                conversation_id=conversation_id
            ).exclude(user_id=sender_id).select_related("user")
            
            sender_name = m.sender.username
            
            for p in participants:
                recipient_user = p.user
                
                # 1. Create In-App Notification
                NotificationModel.objects.create(
                    user=recipient_user,
                    title=f"New Message from {sender_name} 💬",
                    message=text[:50] + ("..." if len(text) > 50 else ""),
                    is_read=False
                )
                
                # 2. Send Email via Resend
                if recipient_user.email:
                    try:
                        resend.api_key = os.getenv("RESEND_API_KEY")
                        resend.Emails.send({
                            "from": "onboarding@resend.dev",
                            "to": [recipient_user.email],
                            "subject": f"New message from {sender_name} 💬",
                            "html": f"""
                                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 30px;">
                                    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                                        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 25px; text-align: center; color: white;">
                                            <h2 style="margin: 0; font-size: 20px;">New Message Received</h2>
                                        </div>
                                        <div style="padding: 30px; color: #374151; line-height: 1.6;">
                                            <p>Hi <strong>{recipient_user.username}</strong>,</p>
                                            <p>You have received a new message from <strong>{sender_name}</strong>:</p>
                                            <blockquote style="background: #fdf8f6; border-left: 4px solid #f97316; margin: 20px 0; padding: 15px; color: #1f2937;">
                                                "{text}"
                                            </blockquote>
                                            <p>Log in to your dashboard to reply and continue the conversation.</p>
                                        </div>
                                    </div>
                                </div>
                            """
                        })
                    except Exception as email_err:
                        print(f"⚠️ Chat email notification failed: {email_err}")
                        
        except Exception as e:
            print(f"⚠️ Chat notification error: {e}")
        # ---------------------------------------------

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
