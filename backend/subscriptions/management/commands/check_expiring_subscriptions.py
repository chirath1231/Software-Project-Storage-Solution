from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from subscriptions.models import SubscriptionPayment
from notifications.models import Notification
from django.contrib.auth import get_user_model
import os
import resend

User = get_user_model()

class Command(BaseCommand):
    help = "Checks for subscriptions nearing expiration or already expired and sends alerts."

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        warning_date = today + timedelta(days=3) # Warn 3 days before expiry

        # 1. Check for plans expiring in 3 days
        expiring_soon = SubscriptionPayment.objects.filter(status="ACTIVE", expires_at__date=warning_date)
        for sub in expiring_soon:
            user = User.objects.filter(email=sub.user_email).first()
            if user:
                # In-app notification
                Notification.objects.create(
                    user=user,
                    title="Subscription Expiring Soon ⚠️",
                    message=f"Your {sub.subscription.name} plan expires in 3 days. Renew now to avoid interruption.",
                    is_read=False
                )
                # Email alert via Resend
                self.send_email(
                    sub.user_email, 
                    "Your Subscription is Expiring Soon ⚠️", 
                    f"Hi there, your {sub.subscription.name} plan is scheduled to expire in 3 days. Please renew to keep your storage active."
                )

        # 2. Check for expired plans
        expired_subs = SubscriptionPayment.objects.filter(status="ACTIVE", expires_at__date__lt=today)
        for sub in expired_subs:
            sub.status = "EXPIRED"
            sub.save()
            
            user = User.objects.filter(email=sub.user_email).first()
            if user:
                Notification.objects.create(
                    user=user,
                    title="Subscription Expired ❌",
                    message=f"Your {sub.subscription.name} plan has expired. Please upgrade to restore features.",
                    is_read=False
                )
                self.send_email(
                    sub.user_email, 
                    "Your Subscription Has Expired ❌", 
                    f"Hi there, your {sub.subscription.name} plan has expired. Upgrade your plan to restore full storage access."
                )

        self.stdout.write(self.style.SUCCESS("Successfully processed subscription lifecycle alerts."))

    def send_email(self, to_email, subject, message):
        try:
            resend.api_key = os.getenv("RESEND_API_KEY")
            resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": [to_email],
                "subject": subject,
                "html": f"""
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 30px;">
                        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 25px; text-align: center; color: white;">
                                <h2 style="margin: 0; font-size: 20px;">{subject}</h2>
                            </div>
                            <div style="padding: 30px; color: #374151; line-height: 1.6;">
                                <p>{message}</p>
                            </div>
                        </div>
                    </div>
                """
            })
        except Exception as e:
            print(f"Email failed: {e}")