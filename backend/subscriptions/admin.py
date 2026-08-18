from django.contrib import admin
from .models import Subscription, Payment, SubscriptionPayment

admin.site.register(Subscription)
admin.site.register(Payment)
admin.site.register(SubscriptionPayment)