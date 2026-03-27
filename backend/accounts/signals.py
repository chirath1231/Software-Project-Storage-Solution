from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

print("Accounts signals loaded!")  

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create profile automatically
        Profile.objects.create(user=instance)

        # Auto-set username if missing
        if not instance.username:
            instance.username = instance.email.split('@')[0]

        # first_name and last_name can remain blank for Google login
        if not instance.first_name:
            instance.first_name = ''
        if not instance.last_name:
            instance.last_name = ''

        instance.save()
    else:
        # Update profile fields with user's current info
        profile = instance.profile
        profile.username = instance.username  # optional, if you store it in profile
        profile.first_name = instance.first_name
        profile.last_name = instance.last_name
        profile.save()