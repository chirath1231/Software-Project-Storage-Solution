from django.urls import path
from . import views

urlpatterns = [
    path("", views.subscription_list, name="subscription-list"),
    path("create-payment/", views.create_payhere_payment, name="create-payhere-payment"),
    path("payhere/notify/", views.payhere_notify, name="payhere-notify"),
    path("payment-status/<str:order_id>/", views.check_payment_status, name="payment-status"),
]
