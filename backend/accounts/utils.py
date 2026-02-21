from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

def send_system_notification(user, title, message, subject="CEYNOA Notification"):
    """
    This function sends an email via Mailgun AND saves an in-app notification 
    to the PostgreSQL database so it shows up in the React dashboard.
    """
    
    # 1. Save to the Database (For the React Frontend)
    Notification.objects.create(
        user=user,
        title=title,
        message=message
    )

    # 2. Send the Email via Mailgun
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False, 
        )
        print(f"Email sent successfully to {user.email}")
    except Exception as e:
        print(f"Error sending email to {user.email}: {e}")