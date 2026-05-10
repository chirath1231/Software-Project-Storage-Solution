from .models import Notification

def create_system_notification(user, title, message):
    """
    A globally reusable function to generate system alerts.
    """
    try:
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            is_read=False
        )
    except Exception as e:
        print(f"Failed to create notification: {e}")