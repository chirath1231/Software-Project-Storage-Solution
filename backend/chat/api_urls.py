from django.urls import path
from .api_views import ConversationListView, MessageListView, SendMessageView, StartConversationView

urlpatterns = [
    path("conversations/", ConversationListView.as_view()),
    path("conversations/start/", StartConversationView.as_view()),  # ✅ must be here
    path("messages/<int:conversation_id>/", MessageListView.as_view()),
    path("messages/send/", SendMessageView.as_view()),
]
