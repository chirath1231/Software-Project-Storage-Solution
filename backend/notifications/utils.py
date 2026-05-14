from django.utils import timezone
from datetime import timedelta
from events.models import Event
from .models import Notification
from datetime import date

def create_system_notification(user, title, message, notification_type='INFO'):
    print(f"DEBUG: Creating {notification_type} notification for {user.email}")
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type
    )

def process_meeting_reminders():
    now = timezone.localtime(timezone.now())
    
    # 1. Process 1-Hour Reminders
    reminder_start = now + timedelta(minutes=55)
    reminder_end = now + timedelta(minutes=65)

    upcoming_reminders = Event.objects.filter(
        start_time__gte=reminder_start,
        start_time__lte=reminder_end
    )

    print(f"[{now.strftime('%I:%M:%S %p')}] Checking Reminders for window: {reminder_start.strftime('%H:%M')} - {reminder_end.strftime('%H:%M')}")
    
    for event in upcoming_reminders:
        Notification.objects.get_or_create(
            user=event.user,
            title="Meeting Reminder",
            message=f"Reminder: '{event.title}' starts in 1 hour.",
            notification_type='REMINDER'
        )

    
    live_start = now - timedelta(minutes=2)
    live_end = now + timedelta(minutes=5)

    live_events = Event.objects.filter(
        start_time__gte=live_start,
        start_time__lte=live_end
    )

    for event in live_events:
        Notification.objects.get_or_create(
            user=event.user,
            title="Join Now!",
            message=f"'{event.title}' is starting now. Ready to jump in?",
            notification_type='LIVE'
        )


def send_subscription_welcome(user, plan_name):
    # 1. Create System Notification
    create_system_notification(
        user=user,
        title="Subscription Activated",
        message=f"Success! You are now subscribed to the {plan_name} plan. Enjoy your new features!",
        notification_type='SUBSCRIPTION'
    )
    
    # 2. Send Email via Resend
    import resend
    import os
    resend.api_key = os.environ.get('RESEND_API_KEY')
    
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [user.email],
            "subject": f"Welcome to CEYNOA {plan_name}!",
            "html": f"<h1>Upgrade Successful!</h1><p>Hi {user.username}, your account has been upgraded to <strong>{plan_name}</strong>.</p>"
        })
    except Exception as e:
        print(f"Resend Email Error: {e}")


def check_subscription_expirations():
    today = date.today()
    reminder_date = today + timedelta(days=3) # 3-day warning
    
    
    expiring_soon = Subscription.objects.filter(end_date=reminder_date, is_active=True)
    
    for sub in expiring_soon:
        Notification.objects.get_or_create(
            user=sub.user,
            title="Subscription Expiring",
            message="Your plan expires in 3 days. Renew now to keep your files safe!",
            notification_type='SUBSCRIPTION'
        )