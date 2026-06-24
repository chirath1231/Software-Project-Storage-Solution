from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'name', 'email', 'category', 'priority', 'title', 'description', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']