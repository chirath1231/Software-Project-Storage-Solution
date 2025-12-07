from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Subscription, Payment
from .serializers import SubscriptionSerializer
import uuid
import hashlib


# --------------------------------------------------------
# PAYHERE CONFIG  (USE YOUR REAL SANDBOX CREDENTIALS)
# --------------------------------------------------------
MERCHANT_ID = "1233030"
MERCHANT_SECRET = "MTQwNDg3NDkzNDQ0MjE4MTIyMDE5MzI2ODUwMjAxMTE4MDk2NTY2"  # copy EXACT from payhere

# PayHere requires md5(secret)
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
# CREATE PAYMENT → FRONTEND REDIRECTS TO PAYHERE
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

    # Save payment record
    Payment.objects.create(
        order_id=order_id,
        subscription_id=subscription_id,
        amount=amount,
        status="PENDING",
        payer_email=email,
    )

    # PayHere HASH: md5( merchant_id + order_id + amount + currency + md5(secret) )
    string_to_hash = f"{MERCHANT_ID}{order_id}{amount}{currency}{MERCHANT_SECRET_MD5}"
    md5sig = hashlib.md5(string_to_hash.encode()).hexdigest().upper()

    paymentData = {
        "sandbox": True,
        "merchant_id": MERCHANT_ID,
        "return_url": "http://localhost:3000/payment-success",
        "cancel_url": "http://localhost:3000/payment-cancel",
        "notify_url": "https://d3dad4b47870.ngrok-free.app/api/subscriptions/payhere/notify/",
        "order_id": order_id,
        "items": f"Subscription-{subscription_id}",
        "currency": currency,
        "amount": amount,

        # User info
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
# PAYHERE WEBHOOK (SERVER → SERVER)
# --------------------------------------------------------
@csrf_exempt
@api_view(["POST"])
def payhere_notify(request):

    data = request.data

    merchant_id = data.get("merchant_id")
    order_id = data.get("order_id")
    pay_amount = data.get("payhere_amount")
    pay_currency = data.get("payhere_currency")
    status_code = data.get("status_code")
    received_md5 = data.get("md5sig")

    # VERIFY HASH
    verify_string = f"{MERCHANT_SECRET_MD5}{merchant_id}{order_id}{pay_amount}{pay_currency}{status_code}"
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

    Payment.objects.filter(order_id=order_id).update(
        status=status_map.get(status_code, "UNKNOWN"),
        payment_id=data.get("payment_id"),
    )

    return Response({"message": "OK"}, status=200)


# --------------------------------------------------------
# FRONTEND CAN CHECK PAYMENT STATUS
# --------------------------------------------------------
def check_payment_status(request, order_id):
    try:
        payment = Payment.objects.get(order_id=order_id)
        return JsonResponse({"status": payment.status}, status=200)
    except Payment.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=404)
