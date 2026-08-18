from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.apps import apps
from datetime import timedelta
from .models import Subscription, Payment, SubscriptionPayment
from .serializers import SubscriptionSerializer
from admin_management.permissions import admin_permission_required
import uuid
import hashlib
import logging

# Setup logger
logger = logging.getLogger(__name__)
User = get_user_model()

# --------------------------------------------------------
# PAYHERE CONFIG  (USE YOUR REAL SANDBOX CREDENTIALS)
# --------------------------------------------------------
MERCHANT_ID = "1233030"
MERCHANT_SECRET = "MTQwNDg3NDkzNDQ0MjE4MTIyMDE5MzI2ODUwMjAxMTE4MDk2NTY2"

# PayHere requires md5(secret)
MERCHANT_SECRET_MD5 = hashlib.md5(MERCHANT_SECRET.encode()).hexdigest().upper()


# --------------------------------------------------------
# GET ALL SUBSCRIPTIONS
# --------------------------------------------------------
@api_view(["GET"])
def subscription_list(request): #This endpoint simply fetches all subscription plans from the database and returns them to the frontend.
    """
    Returns all available subscription plans
    """
    subs = Subscription.objects.all() ## Get all subscription plans from DB
    serializer = SubscriptionSerializer(subs, many=True) #Convert to JSON
    return Response(serializer.data) #Send to frontend

# --------------------------------------------------------
# UPDATE SUBSCRIPTION (ADMIN ONLY)
# --------------------------------------------------------
@api_view(["PUT"])
@admin_permission_required("payments.manage")
def update_subscription(request, subscription_id):
    """
    Admin can update a subscription plan
    """

    try:
        subscription = Subscription.objects.get(id=subscription_id)  # Get subscription object from DB
    except Subscription.DoesNotExist:
        return Response(
            #handle invalid data
            {"error": "Subscription not found"},
            status=404
        )
    #Bind incoming data to existing object
    #Take old object and update using new data. Partial=True allows updating only some fields without requiring all fields to be sent.
    serializer = SubscriptionSerializer(
        subscription,
        data=request.data,
        partial=True
    )
    #Validate data
    if serializer.is_valid():
        serializer.save() #Update DB
        return Response({ #Return success response
            "success": True,
            "message": "Subscription updated successfully",
            "data": serializer.data
        })

    return Response(serializer.errors, status=400)
# --------------------------------------------------------
# GET USER'S ACTIVE SUBSCRIPTIONS
# --------------------------------------------------------

@api_view(["GET"])
def user_subscriptions(request, email):
    """
    Returns all active subscriptions for a specific user email.
    Includes subscription id so the frontend can match plans.
    """
    records = SubscriptionPayment.objects.filter(
        user_email=email,
        status="ACTIVE" #Expired/cancelled ignored.
    ).select_related("subscription") #To improve performance by reducing extra database queries.

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
@permission_classes([IsAuthenticated])
def create_payhere_payment(request):# Ensure only authenticated users can create payments
    """
    Creates a payment record and returns PayHere checkout data
    Frontend will use this data to redirect user to PayHere payment gateway
    """
    subscription_id = request.data.get("subscription_id")
    email = request.user.email # Use the email of the authenticated user
    amount = request.data.get("amount")

    # Validate required fields
    if not all([subscription_id, amount]): # 'email' is now guaranteed from request.user
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

    # Prepare payment data for PayHere checkout
    paymentData = {
        "sandbox": True,
        "merchant_id": MERCHANT_ID,
        "return_url": "http://localhost:3000/payment-success",
        "cancel_url": "http://localhost:3000/payment-cancel",
        "notify_url": "https://ungladly-paraphrasable-sherwood.ngrok-free.dev/api/subscriptions/payhere/notify/",
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
# PAYHERE WEBHOOK (SERVER → SERVER) - DEBUGGING VERSION
# --------------------------------------------------------
@csrf_exempt
@api_view(["POST"])
def payhere_notify(request):
    """
    PayHere sends payment notifications to this endpoint
    """
    # Log all received data for debugging
    print("=" * 60)
    print("🔔 PAYHERE NOTIFICATION RECEIVED")
    print("=" * 60)
    print("Request Method:", request.method)
    print("Content-Type:", request.content_type)
    print("Raw Data:", request.body)
    print("\nParsed Data:")
    
    # PayHere sends data as form-data, not JSON
    # Use request.POST instead of request.data
    data = request.POST.dict() if request.POST else request.data
    
    for key, value in data.items():
        print(f"  {key}: {value}")
    
    # Extract PayHere notification data
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

    # Check if all required fields are present
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

    # Map PayHere status codes to our status values
    status_map = {
        "2": "SUCCESS",
        "0": "PENDING",
        "-1": "CANCELED",
        "-2": "FAILED",
        "-3": "CHARGEDBACK",
    }

    payment_status = status_map.get(status_code, "UNKNOWN")
    print(f"\n💳 PAYMENT STATUS: {payment_status}")

    # Update the Payment record
    updated_count = Payment.objects.filter(order_id=order_id).update(
        status=payment_status,
        payment_id=data.get("payment_id"),
    )
    
    print(f"📝 Updated {updated_count} Payment record(s)")

    # IF PAYMENT IS SUCCESSFUL → SAVE TO SubscriptionPayment TABLE
    if payment_status == "SUCCESS":
        try:
            payment = Payment.objects.get(order_id=order_id)
            print(f"\n✅ Payment found: {payment}")
            
            # Check if subscription payment already exists
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
            .annotate(total_size=Sum('size')))

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
