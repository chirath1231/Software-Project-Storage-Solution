import os
import uuid
import hashlib
import logging
import resend
import traceback
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Subscription, Payment, SubscriptionPayment
from .serializers import SubscriptionSerializer
from notifications.utils import create_system_notification

# Setup logger
logger = logging.getLogger(__name__)

# PayHere Config
MERCHANT_ID = "1233030"
MERCHANT_SECRET = "MTQwNDg3NDkzNDQ0MjE4MTIyMDE5MzI2ODUwMjAxMTE4MDk2NTY2"
MERCHANT_SECRET_MD5 = hashlib.md5(MERCHANT_SECRET.encode()).hexdigest().upper()

# --------------------------------------------------------
# GET ALL SUBSCRIPTIONS
# --------------------------------------------------------
@api_view(["GET"])
def subscription_list(request):
    subs = Subscription.objects.all()
    serializer = SubscriptionSerializer(subs, many=True)
    return Response(serializer.data)

# --------------------------------------------------------
# GET USER'S ACTIVE SUBSCRIPTIONS
# --------------------------------------------------------
@api_view(["GET"])
def user_subscriptions(request, email):
    records = SubscriptionPayment.objects.filter(
        user_email=email,
        status="ACTIVE"
    ).select_related("subscription")

    data = [
        {
            "subscription_id": r.subscription.id,
            "subscription_name": r.subscription.name,
            "storage": r.subscription.storage,
            "amount": str(r.amount),
            "order_id": r.order_id,
            "payment_id": r.payment_id,
            "date": r.created_at.isoformat(),
        }
        for r in records
    ]
    return Response(data)

# --------------------------------------------------------
# CREATE PAYMENT
# --------------------------------------------------------
@api_view(["POST"])
def create_payhere_payment(request):
    subscription_id = request.data.get("subscription_id")
    email = request.data.get("email")
    amount = request.data.get("amount")

    if not all([subscription_id, email, amount]):
        return Response({"success": False, "error": "Missing fields"}, status=400)

    amount = f"{float(amount):.2f}"
    order_id = "ORDER_" + str(uuid.uuid4())
    currency = "LKR"

    Payment.objects.create(
        order_id=order_id,
        subscription_id=subscription_id,
        amount=amount,
        status="PENDING",
        payer_email=email,
    )

    string_to_hash = f"{MERCHANT_ID}{order_id}{amount}{currency}{MERCHANT_SECRET_MD5}"
    md5sig = hashlib.md5(string_to_hash.encode()).hexdigest().upper()

    paymentData = {
        "sandbox": True,
        "merchant_id": MERCHANT_ID,
        "return_url": "http://localhost:3000/dashboard/payment-success", 
        "cancel_url": "http://localhost:3000/payment-cancel",
        "notify_url": "https://vest-guileless-overshot.ngrok-free.dev/api/subscriptions/payhere/notify/",
        "order_id": order_id,
        "items": f"Subscription-{subscription_id}",
        "currency": currency,
        "amount": amount,
        "first_name": email.split("@")[0],
        "last_name": "User",
        "email": email,
        "phone": "0700000000",
        "address": "N/A",
        "city": "Colombo",
        "country": "Sri Lanka",
        "hash": md5sig,
        "custom_1": str(subscription_id),
    }

    return Response({"success": True, "paymentData": paymentData})

# --------------------------------------------------------
# PAYHERE WEBHOOK (NOTIFY)
# --------------------------------------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def payhere_notify(request):
    data = request.POST.dict() if request.POST else request.data
    
    merchant_id = data.get("merchant_id")
    order_id = data.get("order_id")
    pay_amount = data.get("payhere_amount")
    pay_currency = data.get("payhere_currency")
    status_code = data.get("status_code")
    received_md5 = data.get("md5sig")

    # Hash Verification
    verify_string = f"{merchant_id}{order_id}{pay_amount}{pay_currency}{status_code}{MERCHANT_SECRET_MD5}"
    computed_md5 = hashlib.md5(verify_string.encode()).hexdigest().upper()

    if computed_md5 != received_md5:
        return Response({"message": "Invalid hash"}, status=400)

    status_map = {"2": "SUCCESS", "0": "PENDING", "-1": "CANCELED", "-2": "FAILED"}
    payment_status = status_map.get(status_code, "UNKNOWN")

    # Update Payment
    Payment.objects.filter(order_id=order_id).update(
        status=payment_status,
        payment_id=data.get("payment_id"),
    )

    if payment_status == "SUCCESS":
        try:
            payment = Payment.objects.select_related('subscription').get(order_id=order_id)
            
            # Create SubscriptionPayment record
            sub_payment, created = SubscriptionPayment.objects.get_or_create(
                order_id=order_id,
                defaults={
                    'user_email': payment.payer_email,
                    'subscription': payment.subscription,
                    'payment_id': data.get("payment_id"),
                    'amount': payment.amount,
                    'status': "ACTIVE"
                }
            )

            # --- IMPROVED USER LOOKUP ---
            target_email = payment.payer_email.strip().lower()
            
            # Try to find by exact email, or find a user whose email STARTS with this string
            user = User.objects.filter(email__iexact=target_email).first()
            
            if not user and "@" not in target_email:
                # If PayHere sent a username instead of email, try searching by username
                user = User.objects.filter(username__iexact=target_email).first()

            if user:
                create_system_notification(
                    user=user,
                    title="Subscription Upgraded! 🎉",
                    message=f"Success! You are now on the {payment.subscription.name} plan.",
                    notification_type='SUBSCRIPTION'
                )
                print(f"✅ Notification created for user: {user.username}")
            else:
                print(f"⚠️ Webhook warning: Could not link payment '{target_email}' to a User account.")

        except Exception as e:
            print(f"❌ Webhook Logic Error: {str(e)}")
            # We still want to return a 200 OK so PayHere stops retrying
            return Response({"message": "Error processed"}, status=200)

    return Response({"message": "OK"}, status=200)

@api_view(["GET"])
def check_payment_status(request, order_id):
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