from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count
from .models import Conversation, ConversationParticipant, Message
from .serializers import UserSerializer, MessageSerializer

# --- 1. IMPORT OUR GLOBAL NOTIFICATION HELPER ---
from accounts.views import create_system_notification 

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.exclude(id=request.user.id).order_by("username")
        return Response(UserSerializer(users, many=True).data)

class GetOrCreateConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        other_user_id = request.data.get("other_user_id")
        if not other_user_id:
            return Response({"detail": "other_user_id required"}, status=400)

        if int(other_user_id) == request.user.id:
            return Response({"detail": "Cannot chat with yourself"}, status=400)

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

        return Response({"conversation_id": conversation.id})


class MessageListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # --- READ MESSAGES ---
    def get(self, request):
        conversation_id = request.query_params.get("conversation_id")
        if not conversation_id:
            return Response({"detail": "conversation_id required"}, status=400)

        is_member = ConversationParticipant.objects.filter(
            conversation_id=conversation_id, user=request.user
        ).exists()
        if not is_member:
            return Response({"detail": "Not allowed"}, status=403)

        msgs = Message.objects.filter(conversation_id=conversation_id).order_by("created_at")
        return Response(MessageSerializer(msgs, many=True).data)

    # --- NEW: SEND MESSAGES & TRIGGER ALERTS ---
    def post(self, request):
        conversation_id = request.data.get("conversation_id")
        content = request.data.get("content") # Assuming your React app sends the text as 'content'

        if not conversation_id or not content:
            return Response({"detail": "conversation_id and content required"}, status=400)

        # 1. Verify the user is in this conversation
        is_member = ConversationParticipant.objects.filter(
            conversation_id=conversation_id, user=request.user
        ).exists()
        
        if not is_member:
            return Response({"detail": "Not allowed to post in this conversation"}, status=403)

        # 2. Save the message to the database
        message = Message.objects.create(
            conversation_id=conversation_id,
            sender=request.user,
            content=content
        )

        # 3. Find the RECIPIENT of the message (the other person in the chat)
        other_participants = ConversationParticipant.objects.filter(
            conversation_id=conversation_id
        ).exclude(user=request.user)

        # 4. Trigger the notification for the recipient(s)
        for participant in other_participants:
            # We truncate the message content so the alert isn't a massive wall of text
            preview_text = content[:40] + "..." if len(content) > 40 else content
            
            create_system_notification(
                user=participant.user,
                title=f"New Message from {request.user.username}",
                message=f'"{preview_text}"'
            )

        return Response(MessageSerializer(message).data, status=201)