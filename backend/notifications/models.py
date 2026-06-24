from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('INFO', 'Information'),
        ('REMINDER', 'Reminder'),
        ('LIVE', 'Join Now'),
        ('SUBSCRIPTION', 'Subscription'),
    ]

    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notification_app_notifications'
    )
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=15, 
        choices=NOTIFICATION_TYPES, 
        default='INFO'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title