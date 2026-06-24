from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save  # <--- Add this
from django.dispatch import receiver

User = get_user_model()

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    attendee_email = models.EmailField(blank=True, null=True)
    
    # Time management
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    
    meeting_link = models.URLField(blank=True, null=True) 
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"



class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

# --- NEW: This creates the profile automatically when a User is created ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)    