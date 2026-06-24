# models.py — add this to your files app (or a new sharing app)
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FileShare(models.Model):
    """
    A shareable link for a file.
    - The owner can add multiple collaborators with different permission levels.
    - A public token lets anyone with the link access the file at the defined permission level.
    """

    PERMISSION_CHOICES = [
        ("read", "Read Only"),
        ("read_upload", "Read & Upload"),
    ]

    # The file this share belongs to
    file = models.ForeignKey(
        "storage.File",          # adjust app_label.ModelName to match your File model
        on_delete=models.CASCADE,
        related_name="shares",
    )

    # Owner of the share (same as file owner, stored for convenience)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="owned_shares",
    )

    # Unique public token embedded in the shareable URL
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # Default permission for anyone who opens the link (without being an explicit collaborator)
    link_permission = models.CharField(
        max_length=20,
        choices=PERMISSION_CHOICES,
        default="read",
    )

    # Whether the link is currently active
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # One share record per file (owner can update it instead of creating duplicates)
        unique_together = ("file", "owner")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Share({self.file.name}, token={self.token})"

    @property
    def share_url(self):
        """Convenience – build the full URL in the serializer instead if you prefer."""
        return f"/shared/{self.token}/"


class FileShareCollaborator(models.Model):
    """
    An individual email address that has been granted explicit access to a shared file.
    The email doesn't have to be a registered user (guest access).
    """

    PERMISSION_CHOICES = FileShare.PERMISSION_CHOICES

    share = models.ForeignKey(
        FileShare,
        on_delete=models.CASCADE,
        related_name="collaborators",
    )

    email = models.EmailField()
    permission = models.CharField(
        max_length=20,
        choices=PERMISSION_CHOICES,
        default="read",
    )

    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("share", "email")
        ordering = ["email"]

    def __str__(self):
        return f"{self.email} → {self.permission} on {self.share.file.name}"