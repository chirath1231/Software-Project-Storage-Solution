from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Ticket
from .serializers import TicketSerializer

from notifications.utils import create_system_notification


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            if self.request.user.is_staff or self.request.user.is_superuser:
                return Ticket.objects.all().order_by('-created_at')
            return Ticket.objects.filter(
                Q(user=self.request.user) | Q(email=self.request.user.email)
            ).order_by('-created_at')
        return Ticket.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

        