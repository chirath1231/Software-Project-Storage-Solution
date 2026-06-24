from django.contrib.auth.models import User
from django.db.models import Count, OuterRef, Subquery
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


from .models import Conversation, ConversationParticipant, Message


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
            # find "other user" (for 1–1 conversations)
            other_part = (
                ConversationParticipant.objects
                .filter(conversation=c)
                .exclude(user=me)
                .select_related("user")
                .first()
            )
            other_user = other_part.user if other_part else None

            data.append({
                "id": c.id,
                "other_user": {
                    "id": other_user.id if other_user else None,
                    "username": other_user.username if other_user else "",
                    "email": other_user.email if other_user else "",
                    # these are optional fields your UI tries to read
                    "full_name": getattr(other_user, "full_name", "") if other_user else "",
                    "phone": getattr(other_user, "phone", "") if other_user else "",
                    "language": getattr(other_user, "language", "") if other_user else "",
                    "avatar_emoji": getattr(other_user, "avatar_emoji", "👤") if other_user else "👤",
                    "is_online": False,
                    "last_active": "",
                },
                "last_message": {
                    "text": c.last_text or "",
                    "timestamp": c.last_time.isoformat() if c.last_time else "",
                },
                # unread requires extra model (read receipts). For now return 0.
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
