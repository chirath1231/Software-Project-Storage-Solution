from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .gemini_service import ask_gemini
from .knowledge_base import KNOWLEDGE_BASE
from .prompts import SYSTEM_PROMPT

class ChatAssistantView(APIView):
    permission_classes = [IsAuthenticated]   # ONLY LOGGED-IN USERS

    def post(self, request):

        user = request.user  # logged-in user from JWT
        user_message = request.data.get("message")

        if not user_message:
            return Response(
                {"error": "Message is required"},
                status=400
            )
        
        reply = ask_gemini(user_message)

        return Response({
            "user": user.username,
            "reply": reply
        })