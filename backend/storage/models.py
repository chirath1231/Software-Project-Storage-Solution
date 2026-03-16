from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone

# Existing File model
class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files", null=True) 
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to="uploads/")
    size = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 🔥 ShareLink model for generating shareable links
class ShareLink(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="share_links")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    expiry = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.expiry

    def __str__(self):
        return f"Share for {self.file.name}"