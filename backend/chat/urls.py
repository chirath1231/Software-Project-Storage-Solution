from django.urls import path
from .views import UserListView, GetOrCreateConversationView, MessageListView

urlpatterns = [
    path("users/", UserListView.as_view()),
    path("conversation/", GetOrCreateConversationView.as_view()),
    path("messages/", MessageListView.as_view()),
]
