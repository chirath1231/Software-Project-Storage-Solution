from rest_framework import serializers
from .models import Subscription, Payment, SubscriptionPayment


# --------------------------------------------------
# SUBSCRIPTION SERIALIZER
# --------------------------------------------------
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = "__all__"


# --------------------------------------------------
# PAYMENT SERIALIZER
# --------------------------------------------------
class PaymentSerializer(serializers.ModelSerializer):
    subscription_name = serializers.CharField(
        source="subscription.name",
        read_only=True
    )

    class Meta:
        model = Payment
        fields = [
            "order_id",
            "subscription",
            "subscription_name",
            "amount",
            "status",
            "payer_email",
            "payment_id",
            "created_at",
        ]


# --------------------------------------------------
# SUBSCRIPTION PAYMENT SERIALIZER (SUCCESS ONLY)
# --------------------------------------------------
class SubscriptionPaymentSerializer(serializers.ModelSerializer):
    subscription_name = serializers.CharField(
        source="subscription.name",
        read_only=True
    )

    class Meta:
        model = SubscriptionPayment
        fields = [
            "user_email",
            "subscription",
            "subscription_name",
            "order_id",
            "payment_id",
            "amount",
            "status",
            "created_at",
        ]