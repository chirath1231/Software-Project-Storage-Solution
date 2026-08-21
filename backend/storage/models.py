import uuid

from django.db import models
from django.contrib.auth.models import User


def user_upload_path(instance, filename):
    # Store each user's files under:
    # uploads/{user_id}/filename
    return f"{instance.user.id}/{filename}"


# =========================================================
# FOLDER MODEL
# =========================================================

class Folder(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="folders"
    )

    name = models.CharField(max_length=255)

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="subfolders"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    is_deleted = models.BooleanField(default=False)

    deleted_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name


# =========================================================
# FILE MODEL
# =========================================================

class File(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="files"
    )

    name = models.CharField(max_length=255)

    file = models.FileField(
        upload_to=user_upload_path
    )

    size = models.BigIntegerField(default=0)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    is_deleted = models.BooleanField(default=False)

    deleted_at = models.DateTimeField(
        null=True,
        blank=True
    )

    folder = models.ForeignKey(
        Folder,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="files"
    )

    def __str__(self):
        return self.name


# =========================================================
# SHARE LINK MODEL
# =========================================================

class ShareLink(models.Model):
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name="share_links"
    )

    token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    expiry = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Share link for {self.file.name}"
