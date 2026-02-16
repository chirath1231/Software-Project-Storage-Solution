from django.urls import path
from .views import ConversationListView, MessageListView

urlpatterns = [
    path("conversations/", ConversationListView.as_view()),
    path("messages/<int:pk>/", MessageListView.as_view()),
]