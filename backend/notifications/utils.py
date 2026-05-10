from .models import Notification

def create_system_notification(user, title, message):
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message
    )
    return notification