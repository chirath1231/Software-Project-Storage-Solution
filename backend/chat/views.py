from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import Conversation, Message
from .serializers import ConversationListSerializer, MessageSerializer


class ConversationListView(ListAPIView):
    serializer_class = ConversationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).order_by("-created_at")


class MessageListView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(conversation_id=self.kwargs["pk"]).order_by("timestamp")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


# ✅ NEW: Save message to database (used by frontend)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request):
    conversation_id = request.data.get("conversation_id")
    text = request.data.get("text")

    if not conversation_id or not text:
        return Response(
            {"detail": "conversation_id and text required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ✅ optional safety: check conversation belongs to current user
    if not Conversation.objects.filter(id=conversation_id, participants=request.user).exists():
        return Response(
            {"detail": "You are not allowed to send messages to this conversation."},
            status=status.HTTP_403_FORBIDDEN
        )

    msg = Message.objects.create(
        conversation_id=conversation_id,
        sender=request.user,
        text=text
    )

    return Response(
        {
            "id": msg.id,
            "text": msg.text,
            "timestamp": msg.timestamp.isoformat(),
            "sender_username": request.user.username,
            "is_mine": True
        },
        status=status.HTTP_201_CREATED
    )
