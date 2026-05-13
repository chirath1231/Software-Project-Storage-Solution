from django.utils import timezone
from datetime import timedelta
from events.models import Event
from .models import Notification

def create_system_notification(user, title, message, notification_type='INFO'):
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

    # 2. Process Live "Join Now" Alerts
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