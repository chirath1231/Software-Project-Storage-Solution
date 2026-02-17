from django.urls import path
from .views import ConversationListView, MessageListView, send_message

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversations"),
    path("messages/<int:pk>/", MessageListView.as_view(), name="messages"),
    path("messages/send/", send_message, name="send-message"),  # ✅ new
]
