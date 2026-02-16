from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
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