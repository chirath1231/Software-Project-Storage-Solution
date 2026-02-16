from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Conversation, Message

class OtherUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_emoji = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "full_name", "avatar_emoji", "is_online"]

    def get_full_name(self, obj):
        name = (obj.first_name + " " + obj.last_name).strip()
        return name or obj.username

    def get_avatar_emoji(self, obj):
        return "👤"  # later you can store per user

    def get_is_online(self, obj):
        return False  # later we can implement real online tracking


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "conversation", "text", "timestamp", "sender_username", "is_mine"]

    def get_is_mine(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.sender_id == request.user.id


class ConversationListSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "other_user", "last_message", "unread_count", "created_at"]

    def get_other_user(self, obj):
        request = self.context.get("request")
        me = request.user
        other = obj.participants.exclude(id=me.id).first()
        if not other:
            other = me
        return OtherUserSerializer(other).data

    def get_last_message(self, obj):
        last = obj.messages.order_by("-timestamp").first()
        if not last:
            return {"text": "", "timestamp": None}
        return {"text": last.text, "timestamp": last.timestamp}

    def get_unread_count(self, obj):
        # simple version: 0 always
        # later we will implement real unread logic
        return 0