from rest_framework import viewsets, permissions
from .models import Ticket
from .serializers import TicketSerializer
from notifications.models import Notification
import os
import resend

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        
        # 1. Create In-App Notification
        try:
            Notification.objects.create(
                user=self.request.user,
                title="Support Ticket Submitted 🎫",
                message=f"Your ticket '{ticket.title}' has been successfully received. We'll get back to you soon.",
                is_read=False
            )
        except Exception as notif_err:
            print(f"⚠️ Ticket notification error: {notif_err}")

        # 2. Send Email via Resend
        user_email = ticket.email or self.request.user.email
        if user_email:
            try:
                resend.api_key = os.getenv("RESEND_API_KEY")
                resend.Emails.send({
                    "from": "onboarding@resend.dev",
                    "to": [user_email],
                    "subject": f"Support Ticket Received: TKT-{ticket.id} 🎫",
                    "html": f"""
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 30px;">
                            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                                <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 25px; text-align: center; color: white;">
                                    <h2 style="margin: 0; font-size: 20px;">Ticket Successfully Submitted</h2>
                                </div>
                                <div style="padding: 30px; color: #374151; line-height: 1.6;">
                                    <p>Hi <strong>{ticket.name or self.request.user.username}</strong>,</p>
                                    <p>We have successfully received your support request. Here are your ticket details:</p>
                                    
                                    <div style="background: #fdf8f6; border-left: 4px solid #f97316; margin: 20px 0; padding: 15px; border-radius: 4px;">
                                        <strong>Ticket ID:</strong> TKT-{ticket.id}<br>
                                        <strong>Subject:</strong> {ticket.title}<br>
                                        <strong>Category:</strong> {ticket.category}<br>
                                        <strong>Priority:</strong> {ticket.priority}
                                    </div>
                                    
                                    <p>Our support team will review your inquiry and follow up with you shortly.</p>
                                </div>
                            </div>
                        </div>
                    """
                })
                print(f"✅ Ticket confirmation email sent to {user_email}")
            except Exception as email_err:
                print(f"❌ Ticket email failed: {email_err}")
        