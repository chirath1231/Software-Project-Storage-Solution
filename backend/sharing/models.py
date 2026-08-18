import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

PERMISSION_CHOICES = [
    ("read", "Read Only"),
    ("read_upload", "Read & Upload"),
]


class FileShare(models.Model):
    file = models.ForeignKey("storage.File", on_delete=models.CASCADE, related_name="shares")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_shares")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    link_permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default="read")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("file", "owner")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Share({self.file.name}, token={self.token})"


class FileShareCollaborator(models.Model):
    share = models.ForeignKey(FileShare, on_delete=models.CASCADE, related_name="collaborators")
    email = models.EmailField()
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default="read")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("share", "email")
        ordering = ["email"]

    def __str__(self):
        return f"{self.email} → {self.permission} on {self.share.file.name}"


class FolderShare(models.Model):
    folder = models.ForeignKey("storage.Folder", on_delete=models.CASCADE, related_name="shares")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_folder_shares")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    link_permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default="read")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("folder", "owner")
        ordering = ["-created_at"]

    def __str__(self):
        return f"FolderShare({self.folder.name}, token={self.token})"


class FolderShareCollaborator(models.Model):
    share = models.ForeignKey(FolderShare, on_delete=models.CASCADE, related_name="collaborators")
    email = models.EmailField()
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default="read")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("share", "email")
        ordering = ["email"]

    def __str__(self):
        return f"{self.email} on folder {self.share.folder.name}"
