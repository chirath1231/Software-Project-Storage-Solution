from django.db import models
import uuid
from django.contrib.postgres.fields import ArrayField


# ✅ Named function (Django can serialize this)
def generate_order_id():
    return str(uuid.uuid4())

class Subscription(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    storage = models.IntegerField(default=0)  
    price = models.DecimalField(max_digits=10, decimal_places=2)
    features = ArrayField(
        models.CharField(max_length=255, blank=True),
        default=list,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.name


class Payment(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("CANCELED", "Canceled"),
        ("CHARGEDBACK", "Chargeback"),
        ("UNKNOWN", "Unknown"),
    ]

    # ✅ lambda REMOVED ✅ function used
    order_id = models.CharField(
        max_length=128,
        unique=True,
        default=generate_order_id
    )

    subscription = models.ForeignKey(
        Subscription,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    payer_email = models.EmailField(null=True, blank=True)
    payment_id = models.CharField(max_length=128, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order_id} - {self.status}"

class SubscriptionPayment(models.Model):
    user_email = models.EmailField()
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=128, unique=True)
    payment_id = models.CharField(max_length=128, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_email} - {self.subscription.name}"
