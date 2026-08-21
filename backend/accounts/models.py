from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver


User = get_user_model()


# =========================================================
# USER PROFILE
# =========================================================

class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    # Personal information
    address = models.TextField(
        blank=True,
        null=True
    )

    contact_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    city = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    state = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        blank=True,
        null=True
    )

    # Online status
    is_online = models.BooleanField(
        default=False
    )

    last_seen = models.DateTimeField(
        null=True,
        blank=True
    )

    online_connections_count = models.IntegerField(
        default=0
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"


# =========================================================
# NOTIFICATION
# =========================================================

class Notification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(
        max_length=255
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.title} - {self.user.username}"


# =========================================================
# CREATE PROFILE AUTOMATICALLY
# =========================================================

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)


# =========================================================
# ACCOUNT DELETION & OTP
# =========================================================

class AccountDeletion(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="deletion_request"
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - Deleted: {self.is_deleted}"


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reset_otps"
    )
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        from django.utils.timezone import now
        from datetime import timedelta
        return now() <= self.created_at + timedelta(minutes=10)

    def __str__(self):
        return f"{self.user.email} - OTP: {self.otp}"
