import os
import resend
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

        # 3. Resend Email Automation
        attendee_email = self.request.data.get('attendee_email')
        
        if attendee_email:
            # Securely get API Key from environment variables
            resend.api_key = os.environ.get('RESEND_API_KEY')

            subject = f"Meeting Invitation: {event.title} (CEYNOA)"
            
            # HTML Body for a professional look
            html_content = f"""
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Hello!</h2>
                    <p>You have been invited to a meeting by <strong>{event.user.username}</strong>.</p>
                    <hr />
                    <p>📌 <strong>Title:</strong> {event.title}</p>
                    <p>🕒 <strong>Start:</strong> {event.start_time.strftime('%b %d, %Y at %H:%M')}</p>
                    <p>🔗 <strong>Link:</strong> <a href="{event.meeting_link or '#'}">{event.meeting_link or 'No link provided'}</a></p>
                    <p><strong>Description:</strong> {event.description}</p>
                    <hr />
                    <p style="font-size: 12px; color: #777;">Sent securely via CEYNOA Workspace.</p>
                </div>
            """

            try:
                resend.Emails.send({
                    "from": "onboarding@resend.dev", 
                    "to": [attendee_email],
                    "subject": subject,
                    "html": html_content
                })
                print(f"✅ Invite sent successfully to {attendee_email} via Resend")
            except Exception as e:
                print(f"❌ Resend error: {e}")


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)