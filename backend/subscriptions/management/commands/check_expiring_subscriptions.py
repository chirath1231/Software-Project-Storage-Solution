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
    help = "Checks for subscriptions nearing expiration (1 month, 5 days) or already expired and sends alerts."

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        
        # Target dates for reminders
        one_month_date = today + timedelta(days=30)
        five_days_date = today + timedelta(days=5)

        # ---------------------------------------------------------
        # 1. Check for plans expiring in EXACTLY 30 DAYS (1 Month)
        # ---------------------------------------------------------
        month_subs = SubscriptionPayment.objects.filter(status="ACTIVE", expires_at__date=one_month_date)
        for sub in month_subs:
            user = User.objects.filter(email=sub.user_email).first()
            if user:
                Notification.objects.create(
                    user=user,
                    title="Subscription Expiring in 1 Month 📅",
                    message=f"Your {sub.subscription.name} plan expires in 30 days. Please keep an eye on your renewal date.",
                    is_read=False
                )
                self.send_email(
                    sub.user_email, 
                    "Your Subscription Expiring in 1 Month 📅", 
                    f"Hi {user.username}, just a heads-up that your {sub.subscription.name} plan is scheduled to expire in 30 days."
                )

        # ---------------------------------------------------------
        # 2. Check for plans expiring in EXACTLY 5 DAYS
        # ---------------------------------------------------------
        five_day_subs = SubscriptionPayment.objects.filter(status="ACTIVE", expires_at__date=five_days_date)
        for sub in five_day_subs:
            user = User.objects.filter(email=sub.user_email).first()
            if user:
                Notification.objects.create(
                    user=user,
                    title="Subscription Expiring Soon ⚠️",
                    message=f"Action required: Your {sub.subscription.name} plan expires in just 5 days. Renew now to avoid losing access.",
                    is_read=False
                )
                self.send_email(
                    sub.user_email, 
                    "Your Subscription is Expiring in 5 Days ⚠️", 
                    f"Hi {user.username}, your {sub.subscription.name} plan expires in exactly 5 days. Please renew to keep your storage active and avoid interruption."
                )

        # ---------------------------------------------------------
        # 3. Check for EXPIRED plans (Date has passed)
        # ---------------------------------------------------------
        expired_subs = SubscriptionPayment.objects.filter(status="ACTIVE", expires_at__date__lt=today)
        for sub in expired_subs:
            sub.status = "EXPIRED"
            sub.save()
            
            user = User.objects.filter(email=sub.user_email).first()
            if user:
                Notification.objects.create(
                    user=user,
                    title="Subscription Expired ❌",
                    message=f"Your {sub.subscription.name} plan has expired. Please upgrade your plan to restore full features.",
                    is_read=False
                )
                self.send_email(
                    sub.user_email, 
                    "Your Subscription Has Expired ❌", 
                    f"Hi {user.username}, your {sub.subscription.name} plan has officially expired. Upgrade your plan today to restore your full storage access."
                )

        self.stdout.write(self.style.SUCCESS("Successfully processed 1-month, 5-day, and expiration lifecycle alerts."))

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