from django.urls import path
from .api_views import (
    ConversationListView, 
    MessageListView, 
    SendMessageView, 
    StartConversationView,
    CreateGroupConversationView,
    AddGroupMemberView,
    RemoveGroupMemberView,
    RenameGroupView
)

urlpatterns = [
    path("conversations/", ConversationListView.as_view()),
    path("conversations/start/", StartConversationView.as_view()),  # ✅ must be here
    path("conversations/group/create/", CreateGroupConversationView.as_view()),
    path("conversations/group/<int:conversation_id>/add/", AddGroupMemberView.as_view()),
    path("conversations/group/<int:conversation_id>/remove/", RemoveGroupMemberView.as_view()),
    path("conversations/group/<int:conversation_id>/rename/", RenameGroupView.as_view()),
    path("messages/<int:conversation_id>/", MessageListView.as_view()),
    path("messages/send/", SendMessageView.as_view()),
]
