from django.urls import path
from .views import (
    subscription_list,
    create_payhere_payment,
    payhere_notify,
    check_payment_status,
    user_subscriptions,
)

urlpatterns = [
    # --------------------------------------------------
    # SUBSCRIPTIONS
    # --------------------------------------------------
    path("", subscription_list, name="subscription-list"),

    # --------------------------------------------------
    # PAYHERE PAYMENT
    # --------------------------------------------------
    path(
        "create-payment/",
        create_payhere_payment,
        name="create-payhere-payment"
    ),

    # --------------------------------------------------
    # PAYHERE SERVER NOTIFY (WEBHOOK)
    # --------------------------------------------------
    path(
        "payhere/notify/",
        payhere_notify,
        name="payhere-notify"
    ),

    # --------------------------------------------------
    # PAYMENT STATUS CHECK
    # --------------------------------------------------
    path(
        "payment-status/<str:order_id>/",
        check_payment_status,
        name="payment-status"
    ),

    # --------------------------------------------------
    # USER ACTIVE SUBSCRIPTIONS
    # --------------------------------------------------
    path(
        "user-subscriptions/<str:email>/",
        user_subscriptions,
        name="user-subscriptions"
    ),
]
