from rest_framework import serializers
from .models import FileShare, FileShareCollaborator, FolderShare, FolderShareCollaborator

FRONTEND_URL = "http://localhost:3000"


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
            "id", "file", "file_name", "token", "link_permission",
            "is_active", "collaborators", "share_url", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "token", "created_at", "updated_at", "file_name"]

    def get_share_url(self, obj):
        return f"{FRONTEND_URL}/shared/{obj.token}"


class FolderShareCollaboratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolderShareCollaborator
        fields = ["id", "email", "permission", "added_at"]
        read_only_fields = ["id", "added_at"]


class FolderShareSerializer(serializers.ModelSerializer):
    collaborators = FolderShareCollaboratorSerializer(many=True, read_only=True)
    share_url = serializers.SerializerMethodField()
    folder_name = serializers.CharField(source="folder.name", read_only=True)

    class Meta:
        model = FolderShare
        fields = [
            "id", "folder", "folder_name", "token", "link_permission",
            "is_active", "collaborators", "share_url", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "token", "created_at", "updated_at", "folder_name"]

    def get_share_url(self, obj):
        return f"{FRONTEND_URL}/shared/folder/{obj.token}"
