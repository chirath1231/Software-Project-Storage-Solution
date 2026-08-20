import hashlib
import logging
import uuid
from datetime import timedelta

import resend

from django.apps import apps
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Subscription, Payment, SubscriptionPayment
from .serializers import SubscriptionSerializer

from admin_management.permissions import admin_permission_required
from notifications.utils import create_system_notification


# ========================================================
# LOGGER
# ========================================================

logger = logging.getLogger(__name__)

User = get_user_model()


# ========================================================
# PAYHERE CONFIGURATION
# ========================================================

MERCHANT_ID = "1233030"
MERCHANT_SECRET = "MTQwNDg3NDkzNDQ0MjE4MTIyMDE5MzI2ODUwMjAxMTE4MDk2NTY2"

MERCHANT_SECRET_MD5 = hashlib.md5(
    MERCHANT_SECRET.encode()
).hexdigest().upper()


# ========================================================
# GET ALL SUBSCRIPTIONS
# ========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def subscription_list(request):
    """
    Returns all available subscription plans.
    """

    subscriptions = Subscription.objects.all()

    serializer = SubscriptionSerializer(
        subscriptions,
        many=True
    )

    return Response(serializer.data)


# ========================================================
# UPDATE SUBSCRIPTION - ADMIN ONLY
# ========================================================

@api_view(["PUT"])
@admin_permission_required("payments.manage")
def update_subscription(request, subscription_id):
    """
    Admin can update a subscription plan.
    """

    try:
        subscription = Subscription.objects.get(
            id=subscription_id
        )

    except Subscription.DoesNotExist:
        return Response(
            {
                "success": False,
                "error": "Subscription not found"
            },
            status=404
        )

    serializer = SubscriptionSerializer(
        subscription,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "success": True,
                "message": "Subscription updated successfully",
                "data": serializer.data
            },
            status=200
        )

    return Response(
        serializer.errors,
        status=400
    )


# ========================================================
# GET USER'S ACTIVE SUBSCRIPTIONS
# ========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_subscriptions(request, email):
    """
    Returns active subscriptions belonging to the given email.
    """

    records = (
        SubscriptionPayment.objects
        .filter(
            user_email__iexact=email,
            status="ACTIVE"
        )
        .select_related("subscription")
    )

    data = [
        {
            "subscription_id": record.subscription.id,
            "subscription_name": record.subscription.name,
            "storage": record.subscription.storage,
            "amount": str(record.amount),
            "order_id": record.order_id,
            "payment_id": record.payment_id,
            "date": record.created_at.isoformat(),
        }
        for record in records
    ]

    return Response(data)


# ========================================================
# CREATE PAYHERE PAYMENT
# ========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payhere_payment(request):
    """
    Creates a pending payment record and returns
    PayHere checkout data to the frontend.
    """

    subscription_id = request.data.get("subscription_id")
    amount = request.data.get("amount")

    # User email comes from authenticated user
    email = request.user.email

    if not subscription_id or not amount:
        return Response(
            {
                "success": False,
                "error": "Missing required fields"
            },
            status=400
        )

    if not email:
        return Response(
            {
                "success": False,
                "error": "Authenticated user does not have an email"
            },
            status=400
        )

    # Validate subscription
    try:
        subscription = Subscription.objects.get(
            id=subscription_id
        )
    except Subscription.DoesNotExist:
        return Response(
            {
                "success": False,
                "error": "Subscription not found"
            },
            status=404
        )

    # Format amount
    try:
        amount = f"{float(amount):.2f}"
    except (TypeError, ValueError):
        return Response(
            {
                "success": False,
                "error": "Invalid amount"
            },
            status=400
        )

    order_id = f"ORDER_{uuid.uuid4()}"

    currency = "LKR"

    # Create pending payment
    Payment.objects.create(
        order_id=order_id,
        subscription=subscription,
        amount=amount,
        status="PENDING",
        payer_email=email,
    )

    # PayHere hash
    string_to_hash = (
        f"{MERCHANT_ID}"
        f"{order_id}"
        f"{amount}"
        f"{currency}"
        f"{MERCHANT_SECRET_MD5}"
    )

    md5sig = hashlib.md5(
        string_to_hash.encode()
    ).hexdigest().upper()

    # ----------------------------------------------------
    # IMPORTANT:
    # Change this URL to your current ngrok URL.
    # ----------------------------------------------------

    notify_url = (
        "https://vest-guileless-overshot.ngrok-free.dev"
        "/api/subscriptions/payhere/notify/"
    )

    payment_data = {
        "sandbox": True,

        "merchant_id": MERCHANT_ID,

        "return_url": (
            "http://localhost:3000/dashboard/payment-success"
        ),

        "cancel_url": (
            "http://localhost:3000/payment-cancel"
        ),

        "notify_url": notify_url,

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

    return Response(
        {
            "success": True,
            "paymentData": payment_data
        },
        status=200
    )


# ========================================================
# PAYHERE WEBHOOK / NOTIFY
# ========================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def payhere_notify(request):
    """
    Receives payment status notifications from PayHere.
    """

    try:

        # PayHere usually sends form-encoded POST data
        data = request.POST.dict()

        if not data:
            data = request.data

        merchant_id = data.get("merchant_id")
        order_id = data.get("order_id")
        pay_amount = data.get("payhere_amount")
        pay_currency = data.get("payhere_currency")
        status_code = data.get("status_code")
        received_md5 = data.get("md5sig")
        payment_id = data.get("payment_id")

        # ------------------------------------------------
        # Validate required webhook fields
        # ------------------------------------------------

        required_fields = [
            merchant_id,
            order_id,
            pay_amount,
            pay_currency,
            status_code,
            received_md5,
        ]

        if not all(required_fields):
            logger.warning(
                "PayHere webhook missing required fields"
            )

            return Response(
                {
                    "success": False,
                    "message": "Missing required fields"
                },
                status=400
            )

        # ------------------------------------------------
        # Verify merchant ID
        # ------------------------------------------------

        if str(merchant_id) != str(MERCHANT_ID):

            logger.warning(
                "Invalid PayHere merchant ID"
            )

            return Response(
                {
                    "success": False,
                    "message": "Invalid merchant ID"
                },
                status=400
            )

        # ------------------------------------------------
        # Verify PayHere MD5 signature
        # ------------------------------------------------

        verify_string = (
            f"{merchant_id}"
            f"{order_id}"
            f"{pay_amount}"
            f"{pay_currency}"
            f"{status_code}"
            f"{MERCHANT_SECRET_MD5}"
        )

        computed_md5 = hashlib.md5(
            verify_string.encode()
        ).hexdigest().upper()

        if computed_md5 != str(received_md5).upper():

            logger.warning(
                f"Invalid PayHere hash for order {order_id}"
            )

            return Response(
                {
                    "success": False,
                    "message": "Invalid hash"
                },
                status=400
            )

        # ------------------------------------------------
        # Map PayHere status
        # ------------------------------------------------

        status_map = {
            "2": "SUCCESS",
            "0": "PENDING",
            "-1": "CANCELED",
            "-2": "FAILED",
        }

        payment_status = status_map.get(
            str(status_code),
            "UNKNOWN"
        )

        # ------------------------------------------------
        # Get Payment
        # ------------------------------------------------

        try:
            payment = (
                Payment.objects
                .select_related("subscription")
                .get(order_id=order_id)
            )

        except Payment.DoesNotExist:

            logger.error(
                f"Payment not found for order {order_id}"
            )

            return Response(
                {
                    "success": False,
                    "message": "Payment not found"
                },
                status=404
            )

        # ------------------------------------------------
        # Update payment
        # ------------------------------------------------

        payment.status = payment_status

        if payment_id:
            payment.payment_id = payment_id

        payment.save(
            update_fields=[
                "status",
                "payment_id"
            ]
        )

        # ------------------------------------------------
        # SUCCESS PAYMENT
        # ------------------------------------------------

        if payment_status == "SUCCESS":

            # Prevent duplicate SubscriptionPayment records
            sub_payment, created = (
                SubscriptionPayment.objects.get_or_create(
                    order_id=order_id,
                    defaults={
                        "user_email": payment.payer_email,
                        "subscription": payment.subscription,
                        "payment_id": payment_id,
                        "amount": payment.amount,
                        "status": "ACTIVE",
                    }
                )
            )

            # If record already exists, make sure status
            # and payment ID are updated.
            if not created:

                sub_payment.status = "ACTIVE"

                if payment_id:
                    sub_payment.payment_id = payment_id

                sub_payment.save(
                    update_fields=[
                        "status",
                        "payment_id"
                    ]
                )

            # ------------------------------------------------
            # Find User
            # ------------------------------------------------

            target_email = (
                payment.payer_email.strip().lower()
            )

            user = (
                User.objects
                .filter(email__iexact=target_email)
                .first()
            )

            # Fallback username lookup
            if not user and "@" not in target_email:

                user = (
                    User.objects
                    .filter(username__iexact=target_email)
                    .first()
                )

            # ------------------------------------------------
            # USER FOUND
            # ------------------------------------------------

            if user:

                # --------------------------------------------
                # Create dashboard notification
                # --------------------------------------------

                try:

                    create_system_notification(
                        user=user,
                        title="Subscription Upgraded! 🎉",
                        message=(
                            f"Success! You are now on the "
                            f"{payment.subscription.name} plan."
                        ),
                        notification_type="SUBSCRIPTION"
                    )

                except Exception as notification_error:

                    logger.error(
                        "Notification creation failed: "
                        f"{notification_error}"
                    )

                # --------------------------------------------
                # Send email using Resend
                # --------------------------------------------

                resend.api_key = getattr(
                    settings,
                    "RESEND_API_KEY",
                    None
                )

                if resend.api_key:

                    try:

                        resend.Emails.send(
                            {
                                "from": (
                                    "CEYNOA Billing "
                                    "<onboarding@resend.dev>"
                                ),

                                "to": [user.email],

                                "subject": (
                                    f"Welcome to CEYNOA "
                                    f"{payment.subscription.name}!"
                                ),

                                "html": f"""
                                <div style="
                                    font-family: sans-serif;
                                    border: 1px solid #eee;
                                    padding: 20px;
                                    border-radius: 10px;
                                    max-width: 500px;
                                    margin: 0 auto;
                                ">

                                    <h2 style="
                                        color: #f97316;
                                        border-bottom:
                                        1px solid #eee;
                                        padding-bottom: 10px;
                                    ">
                                        Payment Successful
                                    </h2>

                                    <p>
                                        Hi {user.username},
                                    </p>

                                    <p>
                                        Your workspace account has
                                        been successfully upgraded
                                        to the
                                        <strong>
                                            {payment.subscription.name}
                                        </strong>
                                        plan.
                                    </p>

                                    <div style="
                                        background-color: #f9f9f9;
                                        padding: 15px;
                                        border-radius: 8px;
                                        margin: 20px 0;
                                    ">

                                        <p>
                                            <strong>
                                                Order ID:
                                            </strong>
                                            {order_id}
                                        </p>

                                        <p>
                                            <strong>
                                                Amount Paid:
                                            </strong>
                                            LKR {payment.amount}
                                        </p>

                                        <p>
                                            <strong>
                                                Status:
                                            </strong>
                                            Activated
                                        </p>

                                    </div>

                                    <p>
                                        Your expanded limits and
                                        storage adjustments are
                                        now active.
                                    </p>

                                    <hr style="
                                        border: 0;
                                        border-top:
                                        1px solid #eee;
                                        margin: 20px 0;
                                    " />

                                    <p style="
                                        font-size: 12px;
                                        color: #666;
                                    ">
                                        Thank you for choosing CEYNOA.
                                    </p>

                                </div>
                                """
                            }
                        )

                        logger.info(
                            f"Receipt email sent to {user.email}"
                        )

                    except Exception as email_error:

                        logger.error(
                            "Resend email error: "
                            f"{email_error}"
                        )

                else:

                    logger.warning(
                        "RESEND_API_KEY is not configured."
                    )

            else:

                logger.warning(
                    "Could not find user for payment: "
                    f"{target_email}"
                )

        return Response(
            {
                "success": True,
                "message": "OK"
            },
            status=200
        )

    except Exception as error:

        logger.exception(
            f"PayHere webhook error: {error}"
        )

        return Response(
            {
                "success": False,
                "message": "Internal server error"
            },
            status=500
        )


# ========================================================
# CHECK PAYMENT STATUS
# ========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_payment_status(request, order_id):
    """
    Returns the current status of a payment.
    """

    try:

        payment = Payment.objects.get(
            order_id=order_id
        )

        # Optional security check:
        # Only allow the payment owner to check status.
        if (
            payment.payer_email
            and request.user.email
            and payment.payer_email.lower()
            != request.user.email.lower()
        ):
            return Response(
                {
                    "error": "You do not have permission "
                             "to view this payment."
                },
                status=403
            )

        return Response(
            {
                "status": payment.status,
                "order_id": payment.order_id,
                "amount": str(payment.amount),
                "payment_id": payment.payment_id,
            },
            status=200
        )

    except Payment.DoesNotExist:

        return Response(
            {
                "error": "Order not found"
            },
            status=404
        )


# ========================================================
# ADMIN SUBSCRIPTION ANALYTICS
# ========================================================

@api_view(["GET"])
@admin_permission_required("payments.view")
def subscription_analytics(request):
    """
    Aggregates data for the Admin Subscription Analytics dashboard.
    """

    # ----------------------------------------------------
    # Package overview
    # ----------------------------------------------------

    package_data = (
        SubscriptionPayment.objects
        .values(
            "subscription__id",
            "subscription__name",
            "subscription__price"
        )
        .annotate(
            user_count=Count("id"),
            total_revenue=Sum("amount")
        )
        .order_by("-user_count")
    )

    # ----------------------------------------------------
    # Web vs Mobile
    # ----------------------------------------------------

    total_web_users = (
        SubscriptionPayment.objects
        .count()
    )

    popularity = {
        "web": total_web_users,
        "mobile": 0
    }

    # ----------------------------------------------------
    # Revenue distribution
    # ----------------------------------------------------

    revenue_dist = [
        {
            "name": item["subscription__name"],
            "value": float(
                item["total_revenue"] or 0
            )
        }
        for item in package_data
    ]

    # ----------------------------------------------------
    # Top paying users
    # ----------------------------------------------------

    top_users = (
        SubscriptionPayment.objects
        .values("user_email")
        .annotate(
            total_spent=Sum("amount")
        )
        .order_by("-total_spent")[:10]
    )

    return Response(
        {
            "package_overview": list(package_data),

            "popularity": popularity,

            "revenue_distribution": revenue_dist,

            "top_users": list(top_users),
        }
    )


# ========================================================
# ADMIN REPORTS
# ========================================================

@api_view(["GET"])
@admin_permission_required("reports.view")
def admin_reports(request):
    """
    Generates analytics data for the admin dashboard.
    """

    try:

        today = timezone.now().date()

        # Last 7 days including today
        start_of_week = today - timedelta(days=6)

        # ------------------------------------------------
        # TOTAL USERS
        # ------------------------------------------------

        total_users = User.objects.count()

        # ------------------------------------------------
        # TOTAL INCOME
        # ------------------------------------------------

        total_income = (
            SubscriptionPayment.objects
            .filter(status="ACTIVE")
            .aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        # ------------------------------------------------
        # DAILY NEW USERS
        # ------------------------------------------------

        users_daily = (
            User.objects
            .filter(
                date_joined__date__gte=start_of_week
            )
            .annotate(
                day=TruncDay("date_joined")
            )
            .values("day")
            .annotate(
                count=Count("id")
            )
        )

        # ------------------------------------------------
        # DAILY INCOME
        # ------------------------------------------------

        income_daily = (
            Payment.objects
            .filter(
                created_at__date__gte=start_of_week,
                status="SUCCESS"
            )
            .annotate(
                day=TruncDay("created_at")
            )
            .values("day")
            .annotate(
                total=Sum("amount")
            )
        )

        # ------------------------------------------------
        # DAILY STORAGE
        # ------------------------------------------------

        FileModel = apps.get_model(
            "storage",
            "File"
        )

        storage_daily = (
            FileModel.objects
            .filter(
                uploaded_at__date__gte=start_of_week
            )
            .annotate(
                day=TruncDay("uploaded_at")
            )
            .values("day")
            .annotate(
                total_size=Sum("size")
            )
        )

        # ------------------------------------------------
        # INITIALIZE 7 DAYS
        # ------------------------------------------------

        weekly_new_users = [0] * 7

        weekly_income = [0.0] * 7

        weekly_storage = [0.0] * 7

        labels = []

        # ------------------------------------------------
        # Helper
        # ------------------------------------------------

        def get_date(value):

            if not value:
                return None

            if isinstance(value, str):

                return timezone.datetime.strptime(
                    value.split(" ")[0],
                    "%Y-%m-%d"
                ).date()

            if hasattr(value, "date"):
                return value.date()

            return value

        # ------------------------------------------------
        # Build daily data
        # ------------------------------------------------

        for i in range(7):

            target_date = (
                start_of_week
                + timedelta(days=i)
            )

            labels.append(
                target_date.strftime("%a")
            )

            # ----------------------------
            # Users
            # ----------------------------

            for user_data in users_daily:

                if (
                    get_date(user_data["day"])
                    == target_date
                ):

                    weekly_new_users[i] = (
                        user_data["count"]
                    )

                    break

            # ----------------------------
            # Income
            # ----------------------------

            for income_data in income_daily:

                if (
                    get_date(income_data["day"])
                    == target_date
                ):

                    weekly_income[i] = float(
                        income_data["total"] or 0
                    )

                    break

            # ----------------------------
            # Storage
            # ----------------------------

            for storage_data in storage_daily:

                if (
                    get_date(storage_data["day"])
                    == target_date
                ):

                    # Bytes -> GB
                    weekly_storage[i] = round(
                        float(
                            storage_data["total_size"]
                            or 0
                        )
                        / (1024 ** 3),
                        4
                    )

                    break

        # =================================================
        # YEARLY ANALYTICS
        # =================================================

        current_year = today.year

        monthly_qs = (
            SubscriptionPayment.objects
            .filter(
                created_at__year=current_year,
                status="ACTIVE"
            )
            .annotate(
                month=TruncMonth("created_at")
            )
            .values("month")
            .annotate(
                income=Sum("amount"),
                count=Count("id")
            )
        )

        month_names = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        yearly_data = []

        for i, month_name in enumerate(
            month_names
        ):

            month_number = i + 1

            match = next(
                (
                    item
                    for item in monthly_qs
                    if item["month"]
                    and item["month"].month
                    == month_number
                ),
                None
            )

            yearly_data.append(
                {
                    "month": month_name,

                    "web": (
                        match["count"]
                        if match
                        else 0
                    ),

                    "mobile": 0,

                    "income": (
                        float(
                            match["income"] or 0
                        )
                        if match
                        else 0
                    ),
                }
            )

        # =================================================
        # RESPONSE
        # =================================================

        current_users = sum(
            weekly_new_users
        )

        current_income = sum(
            weekly_income
        )

        current_storage = round(
            sum(weekly_storage),
            3
        )

        return Response(
            {
                "total_users": total_users,

                "total_income": float(
                    total_income
                ),

                "weekly_new_users":
                    weekly_new_users,

                "weekly_income":
                    weekly_income,

                "labels":
                    labels,

                "weekly_storage":
                    weekly_storage,

                "comparison": {

                    "users": {
                        "current": current_users,
                        "last": 0,
                        "diff": current_users,
                        "weekLabel": "This Week",
                    },

                    "income": {
                        "current": current_income,
                        "last": 0,
                        "diff": current_income,
                        "weekLabel": "This Week",
                    },

                    "storage": {
                        "current": current_storage,
                        "last": 0,
                        "diff": current_storage,
                        "weekLabel": "This Week",
                    },
                },

                "yearly_data":
                    yearly_data,
            }
        )

    except Exception as error:

        logger.exception(
            f"Error in admin_reports: {error}"
        )

        return Response(
            {
                "error":
                    "Internal server error while "
                    "generating reports."
            },
            status=500
        )