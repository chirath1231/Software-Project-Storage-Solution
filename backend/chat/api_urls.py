from django.urls import path
from .views import UserListView
from .api_views import (
    ConversationListView, 
    MessageListView, 
    SendMessageView, 
    StartConversationView,
    CreateGroupConversationView,
    AddGroupMemberView,
    RemoveGroupMemberView,
    RenameGroupView,
    DeleteMessageView
)

urlpatterns = [
    path("chat/users/", UserListView.as_view()),
    path("conversations/users/", UserListView.as_view()),
    path("conversations/", ConversationListView.as_view()),
    path("conversations/start/", StartConversationView.as_view()),  # ✅ must be here
    path("conversations/group/create/", CreateGroupConversationView.as_view()),
    path("conversations/group/<int:conversation_id>/add/", AddGroupMemberView.as_view()),
    path("conversations/group/<int:conversation_id>/remove/", RemoveGroupMemberView.as_view()),
    path("conversations/group/<int:conversation_id>/rename/", RenameGroupView.as_view()),
    path("messages/send/", SendMessageView.as_view()),
    path("messages/<int:message_id>/delete/", DeleteMessageView.as_view()),
    path("messages/<int:conversation_id>/", MessageListView.as_view()),
]