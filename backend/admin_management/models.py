from django.db import models
from django.contrib.auth.hashers import make_password

class AdminUser(models.Model):
    admin_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    def save(self, *args, **kwargs):
        # Automatically hash password if it's not already hashed
        if not self.password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2$')):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'admins'
