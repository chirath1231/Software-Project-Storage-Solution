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

        # 3. Generate a system notification in the Command Center 
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
                
                # Setup conditional CTA button logic
                if event.meeting_link:
                    cta_html = f"""
                    <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                      <a href="{event.meeting_link}" style="background-color: #f97316; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Join Meeting
                      </a>
                    </div>
                    """
                else:
                    cta_html = """
                    <p style="color: #6b7280; font-size: 14px; text-align: center; font-style: italic; margin-top: 30px;">
                      (No meeting link was provided for this event)
                    </p>
                    """
                
                # HTML Body for a professional look
                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <title>Meeting Invitation</title>
                </head>
                <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 20px;">
                  
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    
                    <!-- Header with CEYNOA Branding -->
                    <div style="background-color: #f97316; padding: 30px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">CEYNOA</h1>
                      <p style="color: #ffedd5; margin: 5px 0 0 0; font-size: 14px;">Cloud Workspace</p>
                    </div>

                    <!-- Main Content Body -->
                    <div style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Hello!</h2>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        You have been invited to a scheduled meeting by <strong style="color: #111827;">{event.user.username}</strong>.
                      </p>

                      <!-- Event Details Card -->
                      <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px;">
                          <span style="font-size: 18px; margin-right: 8px;">📌</span> 
                          <strong>Title:</strong> {event.title}
                        </p>
                        <p style="margin: 0 0 12px 0; color: #374151; font-size: 15px;">
                          <span style="font-size: 18px; margin-right: 8px;">🕒</span> 
                          <strong>Start:</strong> {event.start_time.strftime('%b %d, %Y at %I:%M %p')}
                        </p>
                        <p style="margin: 0; color: #374151; font-size: 15px;">
                          <span style="font-size: 18px; margin-right: 8px;">📝</span> 
                          <strong>Description:</strong> {event.description or 'No description provided.'}
                        </p>
                      </div>

                      <!-- Conditional Call to Action Button -->
                      {cta_html}

                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        Sent securely via CEYNOA Workspace.<br>
                        Please do not reply directly to this automated email.
                      </p>
                    </div>

                  </div>

                </body>
                </html>
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