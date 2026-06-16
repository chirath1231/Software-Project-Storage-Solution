from django.db import models
from django.contrib.auth.hashers import make_password

class AdminUser(models.Model):
    admin_id = models.AutoField(primary_key=True) #Auto-generated ID (1, 2, 3, …)
    email = models.EmailField(unique=True) #Stores admin email
    password = models.CharField(max_length=128) #Stores password

    def save(self, *args, **kwargs):
        # Automatically hash password if it's not already hashed
        if not self.password.startswith(('pbkdf2_sha256$', 'bcrypt$', 'argon2$')): #If password is NOT already hashed; then hash it
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self): #String representation- instead of memory address
        return self.email

    class Meta:
        db_table = 'admins' #forces Django to name the table
