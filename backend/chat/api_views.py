from django.contrib.auth.models import User
from django.db.models import Count, OuterRef, Subquery
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


from .models import Conversation, ConversationParticipant, Message
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def _is_participant(user, conversation_id):
    return ConversationParticipant.objects.filter(
        conversation_id=conversation_id, user=user
    ).exists()


class ConversationListView(APIView):
    """
    GET /api/conversations/
    Returns conversations list for left sidebar.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        me = request.user

        # conversations where I'm a participant
        qs = Conversation.objects.filter(participants__user=me).distinct()

        # last message subquery
        last_msg_qs = Message.objects.filter(conversation=OuterRef("pk")).order_by("-created_at")
        qs = qs.annotate(
            last_text=Subquery(last_msg_qs.values("text")[:1]),
            last_time=Subquery(last_msg_qs.values("created_at")[:1]),
            pcount=Count("participants", distinct=True),
        ).order_by("-last_time", "-id")

        data = []
        for c in qs:
            # list of participants
            participants_data = []
            part_qs = ConversationParticipant.objects.filter(conversation=c).select_related("user__profile")
            for p in part_qs:
                p_user = p.user
                p_online = False
                p_last_active = "Offline"
                try:
                    p_profile = p_user.profile
                    p_online = p_profile.is_online
                    p_last_active = "Online" if p_online else "Offline"
                except Exception:
                    pass

                participants_data.append({
                    "id": p_user.id,
                    "username": p_user.username,
                    "email": p_user.email,
                    "full_name": getattr(p_user, "full_name", "") or p_user.username,
                    "avatar_emoji": getattr(p_user, "avatar_emoji", "👤"),
                    "is_online": p_online,
                    "last_active": p_last_active,
                    "is_admin": (c.is_group and c.admin_id == p_user.id)
                })

            if c.is_group:
                data.append({
                    "id": c.id,
                    "is_group": True,
                    "name": c.name or "Group Chat",
                    "admin_id": c.admin_id,
                    "other_user": None,
                    "participants": participants_data,
                    "last_message": {
                        "text": c.last_text or "",
                        "timestamp": c.last_time.isoformat() if c.last_time else "",
                    },
                    "unread_count": 0,
                    "recent_files": [],
                    "preview": c.last_text or "",
                })
            else:
                # find "other user" (for 1–1 conversations)
                other_part = (
                    ConversationParticipant.objects
                    .filter(conversation=c)
                    .exclude(user=me)
                    .select_related("user__profile")
                    .first()
                )
                other_user = other_part.user if other_part else None
                is_online = False
                last_active = "Offline"
                if other_user:
                    try:
                        profile = other_user.profile
                        is_online = profile.is_online
                        if is_online:
                            last_active = "Online"
                        else:
                            last_active = "Offline"
                    except Exception:
                        pass

                data.append({
                    "id": c.id,
                    "is_group": False,
                    "name": other_user.username if other_user else "Chat",
                    "admin_id": None,
                    "other_user": {
                        "id": other_user.id if other_user else None,
                        "username": other_user.username if other_user else "",
                        "email": other_user.email if other_user else "",
                        "full_name": getattr(other_user, "full_name", "") if other_user else "",
                        "phone": getattr(other_user, "phone", "") if other_user else "",
                        "language": getattr(other_user, "language", "") if other_user else "",
                        "avatar_emoji": getattr(other_user, "avatar_emoji", "👤") if other_user else "👤",
                        "is_online": is_online,
                        "last_active": last_active,
                    },
                    "participants": participants_data,
                    "last_message": {
                        "text": c.last_text or "",
                        "timestamp": c.last_time.isoformat() if c.last_time else "",
                    },
                    "unread_count": 0,
                    "recent_files": [],
                    "preview": c.last_text or "",
                })

        return Response(data)


class MessageListView(APIView):
    """
    GET /api/messages/<conversation_id>/
    Returns messages for middle chat.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id: int):
        if not _is_participant(request.user, conversation_id):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        msgs = Message.objects.filter(conversation_id=conversation_id).select_related("sender").order_by("created_at")

        data = []
        for m in msgs:
            data.append({
                "id": m.id,
                "text": m.text,
                "sender": m.sender_id,
                "sender_username": m.sender.username,
                # your UI expects timestamp
                "timestamp": m.created_at.isoformat(),
                # helps your UI align left/right
                "is_mine": (m.sender_id == request.user.id),
            })

        return Response(data)


class SendMessageView(APIView):
    """
    POST /api/messages/send/
    Body: { conversation_id, text }
    Saves to DB and returns the created message in the same format.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get("conversation_id")
        text = (request.data.get("text") or "").strip()

        if not conversation_id:
            return Response({"detail": "conversation_id required"}, status=status.HTTP_400_BAD_REQUEST)
        if not text:
            return Response({"detail": "text required"}, status=status.HTTP_400_BAD_REQUEST)

        if not _is_participant(request.user, conversation_id):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        m = Message.objects.create(
            conversation_id=conversation_id,
            sender=request.user,
            text=text,
        )

        return Response({
            "id": m.id,
            "text": m.text,
            "sender": m.sender_id,
            "sender_username": request.user.username,
            "timestamp": m.created_at.isoformat(),
            "is_mine": True,
        }, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name="dispatch")
class StartConversationView(APIView):
    """
    POST /api/conversations/start/
    Body: { "other_user_id": <int> }
    Returns: { "conversation_id": <int> }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        other_user_id = request.data.get("other_user_id")

        if not other_user_id:
            return Response({"detail": "other_user_id required"}, status=status.HTTP_400_BAD_REQUEST)

        if int(other_user_id) == request.user.id:
            return Response({"detail": "Cannot chat with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing 1–1 conversation with exactly these 2 users
        convs = (
            Conversation.objects
            .annotate(pcount=Count("participants"))
            .filter(pcount=2, participants__user=request.user)
            .filter(participants__user_id=other_user_id)
        )

        if convs.exists():
            conversation = convs.first()
        else:
            conversation = Conversation.objects.create()
            ConversationParticipant.objects.create(conversation=conversation, user=request.user)
            ConversationParticipant.objects.create(conversation=conversation, user_id=other_user_id)

        return Response({"conversation_id": conversation.id}, status=status.HTTP_200_OK)


class CreateGroupConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        user_ids = request.data.get("user_ids") or []

        if not name:
            return Response({"detail": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the group conversation
        c = Conversation.objects.create(
            is_group=True,
            name=name,
            admin=request.user
        )

        # Add participants: creator + all selected users
        participants_to_create = [ConversationParticipant(conversation=c, user=request.user)]
        
        # Keep track of unique user IDs to add (excluding the creator)
        unique_user_ids = set(int(uid) for uid in user_ids if int(uid) != request.user.id)
        
        for uid in unique_user_ids:
            try:
                user = User.objects.get(id=uid)
                participants_to_create.append(ConversationParticipant(conversation=c, user=user))
            except User.DoesNotExist:
                pass

        ConversationParticipant.objects.bulk_create(participants_to_create)

        # Broadcast group creation to all participants' WebSocket user groups
        channel_layer = get_channel_layer()
        if channel_layer:
            for p in participants_to_create:
                async_to_sync(channel_layer.group_send)(
                    f"user_{p.user_id}",
                    {
                        "type": "group_update",
                        "conversation_id": c.id
                    }
                )

        return Response({"conversation_id": c.id}, status=status.HTTP_201_CREATED)


class AddGroupMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            c = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not c.is_group:
            return Response({"detail": "Not a group chat"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify admin
        if c.admin_id != request.user.id:
            return Response({"detail": "Only the group administrator can add members"}, status=status.HTTP_403_FORBIDDEN)

        user_ids = request.data.get("user_ids") or []
        unique_user_ids = set(int(uid) for uid in user_ids)

        new_participants = []
        for uid in unique_user_ids:
            # Check if already a participant
            if not ConversationParticipant.objects.filter(conversation=c, user_id=uid).exists():
                try:
                    user = User.objects.get(id=uid)
                    new_participants.append(ConversationParticipant(conversation=c, user=user))
                except User.DoesNotExist:
                    pass

        if new_participants:
            ConversationParticipant.objects.bulk_create(new_participants)

        # Broadcast group_update to all participants
        participants = list(ConversationParticipant.objects.filter(conversation=c).values_list('user_id', flat=True))
        channel_layer = get_channel_layer()
        if channel_layer:
            for pid in participants:
                async_to_sync(channel_layer.group_send)(
                    f"user_{pid}",
                    {
                        "type": "group_update",
                        "conversation_id": c.id
                    }
                )

        return Response({"detail": f"Added {len(new_participants)} members successfully"})


class RemoveGroupMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            c = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not c.is_group:
            return Response({"detail": "Not a group chat"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify admin
        if c.admin_id != request.user.id:
            return Response({"detail": "Only the group administrator can remove members"}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id required"}, status=status.HTTP_400_BAD_REQUEST)

        if int(user_id) == request.user.id:
            return Response({"detail": "Admin cannot remove themselves from the group"}, status=status.HTTP_400_BAD_REQUEST)

        # Delete participant record
        participants = list(ConversationParticipant.objects.filter(conversation=c).values_list('user_id', flat=True))

        deleted_count, _ = ConversationParticipant.objects.filter(conversation=c, user_id=user_id).delete()

        # Broadcast group_update to all original participants (including the removed one)
        channel_layer = get_channel_layer()
        if channel_layer:
            for pid in participants:
                async_to_sync(channel_layer.group_send)(
                    f"user_{pid}",
                    {
                        "type": "group_update",
                        "conversation_id": c.id
                    }
                )

        return Response({"detail": "Member removed successfully"})


class RenameGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            c = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        if not c.is_group:
            return Response({"detail": "Not a group chat"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify admin
        if c.admin_id != request.user.id:
            return Response({"detail": "Only the group administrator can rename the group"}, status=status.HTTP_403_FORBIDDEN)

        name = (request.data.get("name") or "").strip()
        if not name:
            return Response({"detail": "Group name cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

        c.name = name
        c.save()

        # Broadcast group_update to all participants
        participants = list(ConversationParticipant.objects.filter(conversation=c).values_list('user_id', flat=True))
        channel_layer = get_channel_layer()
        if channel_layer:
            for pid in participants:
                async_to_sync(channel_layer.group_send)(
                    f"user_{pid}",
                    {
                        "type": "group_update",
                        "conversation_id": c.id
                    }
                )

        return Response({"detail": "Group renamed successfully"})
