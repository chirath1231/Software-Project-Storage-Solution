from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone
from datetime import timedelta
from django.apps import apps
from admin_management.permissions import admin_permission_required
from .models import Subscription, Payment, SubscriptionPayment
from .serializers import SubscriptionSerializer
import uuid
import hashlib
import logging

User = get_user_model()

# Setup logger
logger = logging.getLogger(__name__)

import os
from django.conf import settings

# --------------------------------------------------------
# PAYHERE CONFIG  (LOAD FROM DJANGO SETTINGS / ENV)
# --------------------------------------------------------
MERCHANT_ID = getattr(settings, "PAYHERE_MERCHANT_ID", os.getenv("PAYHERE_MERCHANT_ID"))
MERCHANT_SECRET = getattr(settings, "PAYHERE_MERCHANT_SECRET", os.getenv("PAYHERE_MERCHANT_SECRET"))
# PayHere requires md5(secret)
MERCHANT_SECRET_MD5 = hashlib.md5(MERCHANT_SECRET.encode()).hexdigest().upper()


# --------------------------------------------------------
# GET ALL SUBSCRIPTIONS
# --------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def subscription_list(request):
    """
    Returns all available subscription plans
    """
    subs = Subscription.objects.all()
    serializer = SubscriptionSerializer(subs, many=True)
    return Response(serializer.data)


# --------------------------------------------------------
# GET USER'S ACTIVE SUBSCRIPTIONS
# --------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def user_subscriptions(request, email):
    """
    Returns all active subscriptions for a specific user email.
    Includes subscription id so the frontend can match plans.
    """
    records = SubscriptionPayment.objects.filter(
        user_email=email,
        status="ACTIVE"
    ).select_related("subscription")

    data = [
        {
            "subscription_id": r.subscription.id,
            "subscription_name": r.subscription.name,
            "storage": r.subscription.storage,   # Include storage directly

            "amount": str(r.amount),
            "order_id": r.order_id,
            "payment_id": r.payment_id,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]

    return Response(data)


# --------------------------------------------------------
# CREATE PAYMENT → FRONTEND REDIRECTS TO PAYHERE
# --------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def create_payhere_payment(request):
    """
    Creates a payment record and returns PayHere checkout data
    Frontend will use this data to redirect user to PayHere payment gateway
    """
    subscription_id = request.data.get("subscription_id")
    email = request.data.get("email")
    amount = request.data.get("amount")

    # Validate required fields
    if not all([subscription_id, email, amount]):
        return Response(
            {"success": False, "error": "Missing required fields"},
            status=400
        )

    # Format amount to 2 decimal places
    amount = f"{float(amount):.2f}"
    order_id = "ORDER_" + str(uuid.uuid4())
    currency = "LKR"

    # Save payment record with PENDING status
    Payment.objects.create(
        order_id=order_id,
        subscription_id=subscription_id,
        amount=amount,
        status="PENDING",
        payer_email=email,
    )

    # Generate PayHere hash
    # Formula: md5(merchant_id + order_id + amount + currency + md5(secret))
    string_to_hash = f"{MERCHANT_ID}{order_id}{amount}{currency}{MERCHANT_SECRET_MD5}"
    md5sig = hashlib.md5(string_to_hash.encode()).hexdigest().upper()

    # --- NGROK LOCAL TESTING OVERRIDE ---
    # We override the production URLs to force PayHere to talk to your local machine
    origin = "http://localhost:3000"
    backend_url = "https://vest-guileless-overshot.ngrok-free.dev"
    # ------------------------------------

    # Prepare payment data for PayHere checkout
    paymentData = {
        "sandbox": True,
        "merchant_id": MERCHANT_ID,
        # Notice we added /dashboard/ here to fix your React white-screen crash!
        "return_url": f"{origin}/dashboard/payment-success",
        "cancel_url": f"{origin}/dashboard/subscription",
        "notify_url": f"{backend_url}/api/subscriptions/payhere/notify/",
        "order_id": order_id,
        "items": f"Subscription-{subscription_id}",
        "currency": currency,
        "amount": amount,

        # Customer information
        "first_name": email.split("@")[0],
        "last_name": "User",
        "email": email,
        "phone": "0700000000",
        "address": "N/A",
        "city": "Colombo",
        "country": "Sri Lanka",

        # Security hash
        "hash": md5sig,
        
        # Custom field to store subscription_id
        "custom_1": str(subscription_id),
    }

    # ADD THIS RIGHT BEFORE THE RETURN STATEMENT:
    print("\n--- PAYHERE HASH DEBUGGING ---")
    print(f"Merchant ID: '{MERCHANT_ID}'")
    print(f"Merchant Secret: '{MERCHANT_SECRET}'")
    print(f"Order ID: '{order_id}'")
    print(f"Amount: '{amount}'")
    print(f"Currency: '{currency}'")
    print(f"String to Hash: '{string_to_hash}'")
    print(f"Generated Hash: '{md5sig}'")
    print("------------------------------\n")

    return Response({"success": True, "paymentData": paymentData})


# --------------------------------------------------------
# PAYHERE WEBHOOK (SERVER → SERVER)
# --------------------------------------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def payhere_notify(request):
    """
    PayHere sends payment notifications to this endpoint
    """
    data = request.POST.dict() if request.POST else request.data
    
    merchant_id = data.get("merchant_id")
    order_id = data.get("order_id")
    pay_amount = data.get("payhere_amount")
    pay_currency = data.get("payhere_currency")
    status_code = data.get("status_code")
    received_md5 = data.get("md5sig")

    if not all([merchant_id, order_id, pay_amount, pay_currency, status_code, received_md5]):
        return Response({"message": "Missing required fields"}, status=400)

    # VERIFY HASH for security
    verify_string = f"{merchant_id}{order_id}{pay_amount}{pay_currency}{status_code}{MERCHANT_SECRET_MD5}"
    computed_md5 = hashlib.md5(verify_string.encode()).hexdigest().upper()

    if computed_md5 != received_md5:
        return Response({"message": "Invalid hash"}, status=400)

    # Map PayHere status codes
    status_map = {
        "2": "SUCCESS",
        "0": "PENDING",
        "-1": "CANCELED",
        "-2": "FAILED",
        "-3": "CHARGEDBACK",
    }

    payment_status = status_map.get(status_code, "UNKNOWN")

    # Update the Payment record
    Payment.objects.filter(order_id=order_id).update(
        status=payment_status,
        payment_id=data.get("payment_id"),
    )

    # IF PAYMENT IS SUCCESSFUL → SAVE TO SubscriptionPayment AND SEND EMAIL/NOTIFICATION
    if payment_status == "SUCCESS":
        try:
            payment = Payment.objects.get(order_id=order_id)
            
            if not SubscriptionPayment.objects.filter(order_id=order_id).exists():
                sub_payment = SubscriptionPayment.objects.create(
                    user_email=payment.payer_email,
                    subscription=payment.subscription,
                    order_id=order_id,
                    payment_id=data.get("payment_id"),
                    amount=payment.amount,
                    status="ACTIVE",
                    expires_at=timezone.now() + timedelta(days=30)
                )

                # 1. Create In-App Notification
                try:
                    from django.apps import apps
                    NotificationModel = apps.get_model('notifications', 'Notification')
                    user = User.objects.filter(email=payment.payer_email).first()
                    
                    if user and NotificationModel:
                        NotificationModel.objects.create(
                            user=user,
                            title="Subscription Upgraded 🚀",
                            message=f"Success! Your storage has been upgraded to {sub_payment.subscription.name}. The payment of Rs. {sub_payment.amount} was received.",
                            is_read=False
                        )
                except Exception as notif_err:
                    print(f"⚠️ Notification error: {notif_err}")

                # 2. Send Email via Resend
                try:
                    import os
                    import resend
                    
                    resend.api_key = os.getenv("RESEND_API_KEY")
                    
                    html_content = f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }}
                            .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }}
                            .header {{ background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; color: white; }}
                            .header h1 {{ margin: 0; font-size: 24px; font-weight: 700; }}
                            .content {{ padding: 30px; color: #374151; line-height: 1.6; }}
                            .card {{ background: #fdf8f6; border-left: 4px solid #f97316; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }}
                            .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; background: #f9fafb; }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Subscription Upgraded 🚀</h1>
                            </div>
                            <div class="content">
                                <p>Hi there,</p>
                                <p>Great news! Your payment has been successfully processed and your storage space has been upgraded.</p>
                                
                                <div class="card">
                                    <strong>Plan:</strong> {sub_payment.subscription.name}<br>
                                    <strong>Amount Paid:</strong> Rs. {sub_payment.amount}<br>
                                    <strong>Status:</strong> Active
                                </div>
                                
                                <p>You can now enjoy your expanded storage features instantly from your dashboard.</p>
                                <p>Thank you for choosing us!</p>
                            </div>
                            <div class="footer">
                                &copy; 2026 Cloud Storage Solution. All rights reserved.
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    
                    params = {
                        "from": "onboarding@resend.dev",  # Change to your verified domain email later if needed
                        "to": [payment.payer_email],
                        "subject": "Subscription Upgraded Successfully! 🎉",
                        "html": html_content,
                    }
                    
                    email_response = resend.Emails.send(params)
                    print(f"✅ Resend email sent successfully: {email_response}")
                except Exception as email_err:
                    print(f"❌ Resend email failed: {email_err}")

        except Exception as e:
            print(f"❌ Error processing successful payment: {str(e)}")

    return Response({"message": "OK"}, status=200)


# --------------------------------------------------------
# FRONTEND CAN CHECK PAYMENT STATUS
# --------------------------------------------------------
@api_view(["GET"])
def check_payment_status(request, order_id):
    """
    Allows frontend to check the current status of a payment
    """
    try:
        payment = Payment.objects.get(order_id=order_id)
        return JsonResponse({
            "status": payment.status,
            "order_id": payment.order_id,
            "amount": str(payment.amount),
            "payment_id": payment.payment_id
        }, status=200)
    except Payment.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=404)


# --------------------------------------------------------
# SUBSCRIPTION REPORTS VIEW
# --------------------------------------------------------
# --------------------------------------------------------
# ADMIN ANALYTICS ENDPOINT
# --------------------------------------------------------
@api_view(["GET"])
@admin_permission_required("payments.view")
def subscription_analytics(request):
    """
    Aggregates data for the Admin Subscription Analytics dashboard.
    """
    # 1. Package Overview Table & Revenue Distribution
    # We group by subscription ID and name to get counts and revenue
    package_data = SubscriptionPayment.objects.values(
        'subscription__id', 
        'subscription__name',
        'subscription__price'
    ).annotate(
        user_count=Count('id'),
        total_revenue=Sum('amount')
    ).order_by('-user_count')

    # 2. Web vs Mobile Popularity
    # As requested: Mobile is null/0 until the app is created.
    total_web_users = SubscriptionPayment.objects.count()
    popularity = {
        "web": total_web_users,
        "mobile": 0  # Placeholder for future mobile app data
    }

    # 3. Revenue Distribution (Formatted for charts)
    revenue_dist = [
        {"name": item['subscription__name'], "value": float(item['total_revenue'] or 0)}
        for item in package_data
    ]

    # 4. Top Paying Users
    # Grouping by email to find who has spent the most across all their subscriptions
    top_users = SubscriptionPayment.objects.values(
        'user_email'
    ).annotate(
        total_spent=Sum('amount')
    ).order_by('-total_spent')[:10]  # Top 10 users

    return Response({
        "package_overview": list(package_data),
        "popularity": popularity,
        "revenue_distribution": revenue_dist,
        "top_users": list(top_users)
    })


# --------------------------------------------------------
# ADMIN REPORTS ENDPOINT
# --------------------------------------------------------
@api_view(["GET"])
@admin_permission_required("reports.view")
def admin_reports(request): #This endpoint generates ALL analytics data for admin dashboard
    """
    Aggregates data for the Reports & Analytics tab.
    Fixes the 'System Error' on the frontend.
    """
    try:
        today = timezone.now().date()
        start_of_week = today - timedelta(days=6)  # Last 7 days including today

        total_users = User.objects.count()

        # total_income = Payment.objects.filter(status="SUCCESS").aggregate(total=Sum('amount'))['total'] or 0
        total_income = SubscriptionPayment.objects.aggregate(
        total=Sum('amount')
        )['total'] or 0
        
        # 1. Weekly New Users (from auth_user table)
        #Gets users who joined in last 7 days
        users_daily = (
            User.objects
            .filter(date_joined__date__gte=start_of_week)
            .annotate(day=TruncDay('date_joined'))
            .values('day')
            .annotate(count=Count('id'))
        )
            
        # 2. Weekly Income (from Payment table)
        income_daily = (
            Payment.objects
            .filter(created_at__date__gte=start_of_week, status="SUCCESS")
            .annotate(day=TruncDay('created_at'))
            .values('day')
            .annotate(total=Sum('amount'))
        )
        
        # 3. Weekly Storage Utilization (from storage_file table)
        FileModel = apps.get_model('storage', 'File')
        #gets uploaded files from last 7 days, groups by day, and sums their sizes to get total storage used each day; also handles date/datetime formats for compatibility with different databases
        storage_daily = (
            FileModel.objects
            .filter(uploaded_at__date__gte=start_of_week)
            .annotate(day=TruncDay('uploaded_at'))
            .values('day')
            .annotate(total_size=Sum('size'))
        )

        weekly_new_users = [0] * 7 # Initialize with zeros for 7 days
        weekly_income = [0.0] * 7 #[0,0,0,0,0,0,0] Because some days may have no data.
        weekly_storage = [0.0] * 7
        labels = []
        
        for i in range(7): #builds data day-by-day for the last 7 days, generating labels and mapping counts/sums to the correct day
            target_date = start_of_week + timedelta(days=i)
            labels.append(target_date.strftime('%a')) # Dynamically generates 'Tue', 'Wed', etc.
            
            # Helper for date comparison (handling SQLite strings vs objects)
            def get_date(val):
                if not val: return None
                if isinstance(val, str):
                    return timezone.datetime.strptime(val.split(' ')[0], '%Y-%m-%d').date()
                return val.date() if hasattr(val, 'date') else val

            # Map Users
            for u in users_daily:
                if get_date(u['day']) == target_date: #checks if record belongs to that day; Compares the target date with the date from the query, handling both string and date formats for compatibility across databases
                    weekly_new_users[i] = u['count'] #maps the count of new users to the correct day index in the weekly_new_users list
                    break
            
            # Map Income
            for inc in income_daily:
                if get_date(inc['day']) == target_date:
                    weekly_income[i] = float(inc['total'] or 0.0)
                    break

            # Map Storage (Converted from Bytes to GB)
            for s in storage_daily:
                if get_date(s['day']) == target_date:
                    weekly_storage[i] = round(float(s['total_size'] or 0.0) / (1024**3), 4)
                    break

        # 2. Yearly Analytics (Monthly Breakdown)
        current_year = today.year
        #Get current year data grouped by month, summing income and counting subscriptions for each month; also handles date/datetime formats for compatibility with different databases
        monthly_qs = SubscriptionPayment.objects.filter(created_at__year=current_year)\
        .annotate(month=TruncMonth('created_at'))\
        .values('month')\
        .annotate(income=Sum('amount'), count=Count('id'))
    
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        yearly_data = []
        
        for i, name in enumerate(month_names):
            month_num = i + 1
            match = next((m for m in monthly_qs if m['month'].month == month_num), None) #Match DB data to month
            
            # This generates the peak in May if data exists only there
            yearly_data.append({
                "month": name,
                "web": match['count'] if match else 0,
                "mobile": 0, 
                "income": float(match['income'] or 0) if match else 0
            })

        # 3. Final Aggregated Response
        return Response({
            "total_users": total_users,
            "total_income": float(total_income),
            "weekly_new_users": weekly_new_users,
            "weekly_income": weekly_income,
            "labels": labels,
            "weekly_storage": weekly_storage,
            "comparison": {
                "users": {
                    "current": sum(weekly_new_users),
                    "last": 0, #Since previous-week analytics were not implemented yet, it was temporarily set to 0 as a placeholder to keep the comparison cards working without causing frontend errors
                    "diff": sum(weekly_new_users),
                    "weekLabel": "This Week"
                },
                "income": {
                    "current": sum(weekly_income),
                    "last": 0,
                    "diff": sum(weekly_income),
                    "weekLabel": "This Week"
                },
                "storage": { 
                    "current": round(sum(weekly_storage), 3), 
                    "last": 0, 
                    "diff": round(sum(weekly_storage), 3),
                    "weekLabel": "This Week"
                }
            },
            "yearly_data": yearly_data
        })
    except Exception as e:
        logger.error(f"Error in admin_reports: {str(e)}")
        return Response({"error": "Internal server error while generating reports."}, status=500)


# --------------------------------------------------------
# UPDATE SUBSCRIPTION PLAN
# --------------------------------------------------------
@api_view(["PUT"])
@admin_permission_required("payments.manage")
def update_subscription(request, subscription_id):
    """
    Updates a subscription plan's name, description, price, storage, and features.
    """
    try:
        sub = Subscription.objects.get(id=subscription_id)
    except Subscription.DoesNotExist:
        return Response({"error": "Subscription plan not found"}, status=404)

    serializer = SubscriptionSerializer(sub, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        logger.info(f"Admin {request.user.email} updated Subscription {sub.id} ({sub.name})")
        return Response({
            "message": "Subscription plan updated successfully.",
            "subscription": serializer.data
        }, status=200)

    return Response(serializer.errors, status=400)
