from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model


User = get_user_model()


# =========================================================
# ADMIN USER
# =========================================================

class AdminUser(models.Model):
    admin_id = models.AutoField(
        primary_key=True
    )

    email = models.EmailField(
        unique=True
    )

    password = models.CharField(
        max_length=128
    )

    def save(self, *args, **kwargs):
        """
        Automatically hash the password before saving
        if it has not already been hashed.
        """

        if not self.password.startswith(
            (
                "pbkdf2_sha256$",
                "bcrypt$",
                "argon2$"
            )
        ):
            self.password = make_password(self.password)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    class Meta:
        db_table = "admins"


# =========================================================
# ADMIN PERMISSION
# =========================================================

class AdminPermission(models.Model):
    code = models.CharField(
        max_length=100,
        unique=True
    )

    name = models.CharField(
        max_length=100
    )

    category = models.CharField(
        max_length=50,
        default="General"
    )

    description = models.TextField(
        blank=True
    )

    users = models.ManyToManyField(
        User,
        related_name="admin_permissions",
        blank=True
    )

    def __str__(self):
        return f"{self.category} - {self.name} ({self.code})"

    class Meta:
        db_table = "admin_permissions"
        ordering = ["category", "code"]
