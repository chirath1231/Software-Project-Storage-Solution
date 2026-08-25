from rest_framework import viewsets, permissions
from .models import Ticket
from .serializers import TicketSerializer

from notifications.utils import create_system_notification

from django.db.models import Q

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            if user.is_staff or user.is_superuser:
                return Ticket.objects.all().order_by('-created_at')
            return Ticket.objects.filter(Q(user=user) | Q(email=user.email)).order_by('-created_at')
        # If query parameter all=true or unauthenticated admin request
        if self.request.query_params.get('all') == 'true':
            return Ticket.objects.all().order_by('-created_at')
        return Ticket.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(
                user=self.request.user,
                email=serializer.validated_data.get('email') or self.request.user.email,
                name=serializer.validated_data.get('name') or self.request.user.get_full_name() or self.request.user.username
            )
        else:
            serializer.save()

        