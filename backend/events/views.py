import os
import resend
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.conf import settings 
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
        # 1. Grab attendee_email from request data BEFORE saving
        attendee_email = self.request.data.get('attendee_email')

        # 2. Pass attendee_email explicitly to the save routine so it writes to PostgreSQL
        event = serializer.save(
            user=self.request.user,
            attendee_email=attendee_email 
        )

        # 3. Generate a system notification in the Command Center (Added notification_type)
        create_system_notification(
            user=self.request.user,
            title="Meeting Scheduled 📅",
            message=f"You successfully scheduled '{event.title}' for {event.start_time.strftime('%b %d at %I:%M %p')}.",
            notification_type='INFO' 
        )

        # 4. Resend Email Automation
        if attendee_email:
            # Securely get API Key from centralized Django settings config we loaded with dotenv
            resend.api_key = getattr(settings, "RESEND_API_KEY", None)

            if resend.api_key:
                subject = f"Meeting Invitation: {event.title} (CEYNOA)"
                
                # HTML Body for a professional look
                html_content = f"""
                    <div style="font-family: sans-serif; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #f97316;">Hello!</h2>
                        <p>You have been invited to a meeting by <strong>{event.user.username}</strong>.</p>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <p>📌 <strong>Title:</strong> {event.title}</p>
                        <p>🕒 <strong>Start:</strong> {event.start_time.strftime('%b %d, %Y at %I:%M %p')}</p>
                        <p>🔗 <strong>Link:</strong> <a href="{event.meeting_link or '#'}">{event.meeting_link or 'No link provided'}</a></p>
                        <p><strong>Description:</strong> {event.description or 'No description provided'}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #777;">Sent securely via CEYNOA Workspace.</p>
                    </div>
                """

                try:
                    resend.Emails.send({
                        "from": "CEYNOA Workspace <onboarding@resend.dev>", 
                        "to": [attendee_email],
                        "subject": subject,
                        "html": html_content
                    })
                    print(f"✅ Invite sent successfully to {attendee_email} via Resend")
                except Exception as e:
                    print(f"❌ Resend error: {e}")
            else:
                print("❌ CRITICAL: RESEND_API_KEY could not be read from global settings during event creation.")


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)