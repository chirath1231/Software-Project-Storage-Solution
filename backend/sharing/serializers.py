from rest_framework import serializers
from .models import FileShare, FileShareCollaborator, FolderShare, FolderShareCollaborator

DEFAULT_FRONTEND_URL = "https://software-project-storage-solution.vercel.app"


def get_frontend_origin(request):
    if request is not None:
        origin = request.headers.get("origin")
        if origin:
            return origin
    return DEFAULT_FRONTEND_URL


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
        origin = get_frontend_origin(self.context.get("request"))
        return f"{origin}/shared/{obj.token}"


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
        origin = get_frontend_origin(self.context.get("request"))
        return f"{origin}/shared/folder/{obj.token}"
