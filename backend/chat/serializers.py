from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "conversation", "sender", "sender_username", "text", "created_at")
        read_only_fields = ("id", "sender", "created_at")
