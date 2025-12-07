from rest_framework import serializers
from .models import Subscription, Payment

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ["id", "name", "description", "price"]

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["order_id", "subscription", "amount", "status", "payer_email", "payment_id", "created_at"]
