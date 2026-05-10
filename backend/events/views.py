import requests
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Event
from .serializers import EventSerializer
from notifications.utils import create_system_notification

# ==========================================
# CALENDAR EVENT VIEWS
# ==========================================
class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user).order_by('start_time')

    def perform_create(self, serializer):
        # 1. Save the event to the database
        event = serializer.save(user=self.request.user)

        # 2. Generate a system notification in the Command Center
        create_system_notification(
            user=self.request.user,
            title="Meeting Scheduled",
            message=f"You successfully scheduled '{event.title}' for {event.start_time.strftime('%b %d at %I:%M %p')}."
        )

        # 3. Mailgun Email Automation
        attendee_email = self.request.data.get('attendee_email')
        
        if attendee_email:
            # IMPORTANT: Put your real Mailgun Sandbox Domain and API Key here!
            mailgun_domain = "YOUR_MAILGUN_SANDBOX_DOMAIN" 
            mailgun_api_key = "YOUR_MAILGUN_API_KEY"

            subject = f"Meeting Invitation: {event.title} (CEYNOA)"
            body = (
                f"Hello!\n\n"
                f"You have been invited to a meeting by {event.user.username}.\n\n"
                f"📌 Title: {event.title}\n"
                f"🕒 Start: {event.start_time.strftime('%b %d, %Y at %H:%M')}\n"
                f"🔗 Link: {event.meeting_link or 'No link provided'}\n\n"
                f"Description: {event.description}\n\n"
                f"Sent securely via CEYNOA Workspace."
            )

            try:
                requests.post(
                    f"https://api.mailgun.net/v3/{mailgun_domain}/messages",
                    auth=("api", mailgun_api_key),
                    data={"from": f"CEYNOA Scheduler <mailgun@{mailgun_domain}>",
                          "to": [attendee_email],
                          "subject": subject,
                          "text": body}
                )
                print(f"✅ Invite sent successfully to {attendee_email}")
            except Exception as e:
                print(f"❌ Mailgun error: {e}")


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)