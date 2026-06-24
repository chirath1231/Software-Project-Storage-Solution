# serializers.py
import os

from rest_framework import serializers
from .models import FileShare, FileShareCollaborator


class FileShareCollaboratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileShareCollaborator
        fields = ["id", "email", "permission", "added_at"]
        read_only_fields = ["id", "added_at"]


class FileShareSerializer(serializers.ModelSerializer):
    collaborators = FileShareCollaboratorSerializer(many=True, read_only=True)
    share_url = serializers.SerializerMethodField()
    file_name = serializers.CharField(source="file.name", read_only=True)

    class Meta:
        model = FileShare
        fields = [
            "id",
            "file",
            "file_name",
            "token",
            "link_permission",
            "is_active",
            "collaborators",
            "share_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "token", "created_at", "updated_at", "file_name"]

    def get_share_url(self, obj):
        frontend_url = "http://localhost:3000"
        return f"{frontend_url}/shared/{obj.token}"
