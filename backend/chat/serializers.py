from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Message

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "profile_picture")

    def get_profile_picture(self, obj):
        try:
            if hasattr(obj, "profile") and obj.profile.profile_picture:
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.profile.profile_picture.url)
                return obj.profile.profile_picture.url
        except Exception:
            pass
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ("id", "conversation", "sender", "sender_username", "text", "created_at")
        read_only_fields = ("id", "sender", "created_at")