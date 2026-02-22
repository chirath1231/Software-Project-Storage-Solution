# subscriptions/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from .models import Subscription, Payment, SubscriptionPayment
from .serializers import SubscriptionSerializer

import uuid
import hashlib
import logging


logger = logging.getLogger(__name__)

# --------------------------------------------------------
# PAYHERE CONFIG  (USE YOUR REAL SANDBOX CREDENTIALS)
# --------------------------------------------------------
MERCHANT_ID = "1233030"
MERCHANT_SECRET = "MTQwNDg3NDkzNDQ0MjE4MTIyMDE5MzI2ODUwMjAxMTE4MDk2NTY2"

# PayHere requires md5(secret)
MERCHANT_SECRET_MD5 = hashlib.md5(MERCHANT_SECRET.encode()).hexdigest().upper()


# --------------------------------------------------------
# GET ALL SUBSCRIPTIONS (PUBLIC)
# --------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])  # ✅ PUBLIC: anyone can view plans (fixes 401)
def subscription_list(request):
    """
    Returns all available subscription plans (public)
    """
    subs = Subscription.objects.all()
    serializer = SubscriptionSerializer(subs, many=True)
    return Response(serializer.data)


# --------------------------------------------------------
# GET USER'S ACTIVE SUBSCRIPTIONS (RECOMMENDED: AUTH REQUIRED)
# NOTE: Your current frontend passes email in URL.
#       This is not secure because anyone can query another email.
#       Kept as-is but protected with IsAuthenticated.
# --------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])  # ✅ Require login (recommended)
def user_subscriptions(request, email):
    """
    Returns all active subscriptions for a specific user email.
    Includes subscription id so the frontend can match plans.

    SECURITY NOTE:
    - Better approach: do NOT accept email in URL.
      Use request.user.email instead.
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
            "date": r.created_at.isoformat(),
        }
        for r in records
    ]
    return Response(data)


# --------------------------------------------------------
# CREATE PAYMENT → FRONTEND REDIRECTS TO PAYHERE
# --------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])  # ✅ Require login (recommended)
def create_payhere_payment(request):
    """
    Creates a payment record and returns PayHere checkout data.
    Frontend will use this data to redirect user to PayHere payment gateway.
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
    try:
        amount = f"{float(amount):.2f}"
    except (TypeError, ValueError):
        return Response(
            {"success": False, "error": "Invalid amount"},
            status=400
        )

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

    paymentData = {
        "sandbox": True,
        "merchant_id": MERCHANT_ID,
        "return_url": "http://localhost:3000/payment-success",
        "cancel_url": "http://localhost:3000/payment-cancel",
        "notify_url": "https://c28b-2402-4000-13cb-81f2-3cd6-e782-2f38-c710.ngrok-free.app/api/subscriptions/payhere/notify/",
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

    return Response({"success": True, "paymentData": paymentData})


# --------------------------------------------------------
# PAYHERE WEBHOOK (SERVER → SERVER) - PUBLIC + CSRF EXEMPT
# --------------------------------------------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])  # ✅ PayHere server can't send JWT, so must be public
def payhere_notify(request):
    """
    PayHere sends payment notifications to this endpoint
    """
    print("=" * 60)
    print("🔔 PAYHERE NOTIFICATION RECEIVED")
    print("=" * 60)
    print("Request Method:", request.method)
    print("Content-Type:", request.content_type)
    print("Raw Data:", request.body)
    print("\nParsed Data:")

    # PayHere sends data as form-data, not JSON
    data = request.POST.dict() if request.POST else request.data

    for key, value in data.items():
        print(f"  {key}: {value}")

    merchant_id = data.get("merchant_id")
    order_id = data.get("order_id")
    pay_amount = data.get("payhere_amount")
    pay_currency = data.get("payhere_currency")
    status_code = data.get("status_code")
    received_md5 = data.get("md5sig")

    print("\n📋 EXTRACTED VALUES:")
    print(f"  Merchant ID: {merchant_id}")
    print(f"  Order ID: {order_id}")
    print(f"  Amount: {pay_amount}")
    print(f"  Currency: {pay_currency}")
    print(f"  Status Code: {status_code}")
    print(f"  Received MD5: {received_md5}")

    if not all([merchant_id, order_id, pay_amount, pay_currency, status_code, received_md5]):
        print("❌ MISSING REQUIRED FIELDS")
        print("=" * 60)
        return Response({"message": "Missing required fields"}, status=400)

    # VERIFY HASH for security
    verify_string = f"{merchant_id}{order_id}{pay_amount}{pay_currency}{status_code}{MERCHANT_SECRET_MD5}"
    computed_md5 = hashlib.md5(verify_string.encode()).hexdigest().upper()

    print("\n🔐 HASH VERIFICATION:")
    print(f"  Verify String: {verify_string}")
    print(f"  Computed MD5: {computed_md5}")
    print(f"  Received MD5: {received_md5}")
    print(f"  Match: {computed_md5 == received_md5}")

    if computed_md5 != received_md5:
        print("❌ HASH MISMATCH - Security verification failed")
        print("=" * 60)
        return Response({"message": "Invalid hash"}, status=400)

    print("✅ HASH VERIFIED SUCCESSFULLY")

    status_map = {
        "2": "SUCCESS",
        "0": "PENDING",
        "-1": "CANCELED",
        "-2": "FAILED",
        "-3": "CHARGEDBACK",
    }
    payment_status = status_map.get(status_code, "UNKNOWN")
    print(f"\n💳 PAYMENT STATUS: {payment_status}")

    updated_count = Payment.objects.filter(order_id=order_id).update(
        status=payment_status,
        payment_id=data.get("payment_id"),
    )
    print(f"📝 Updated {updated_count} Payment record(s)")

    if payment_status == "SUCCESS":
        try:
            payment = Payment.objects.get(order_id=order_id)
            print(f"\n✅ Payment found: {payment}")

            if not SubscriptionPayment.objects.filter(order_id=order_id).exists():
                sub_payment = SubscriptionPayment.objects.create(
                    user_email=payment.payer_email,
                    subscription=payment.subscription,
                    order_id=order_id,
                    payment_id=data.get("payment_id"),
                    amount=payment.amount,
                    status="ACTIVE"
                )
                print(f"✅ SubscriptionPayment created: {sub_payment}")
            else:
                print(f"⚠️ SubscriptionPayment already exists for order: {order_id}")

        except Payment.DoesNotExist:
            print(f"❌ Payment record not found for order: {order_id}")
        except Exception as e:
            print(f"❌ Error creating SubscriptionPayment: {str(e)}")
            import traceback
            traceback.print_exc()

    print("=" * 60)
    return Response({"message": "OK"}, status=200)


# --------------------------------------------------------
# FRONTEND CAN CHECK PAYMENT STATUS
# --------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])  # ✅ Optional: public is fine (shows only status)
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
