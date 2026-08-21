from rest_framework import viewsets, permissions
from .models import Ticket
from .serializers import TicketSerializer

from notifications.utils import create_system_notification

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Ticket.objects.filter(user=self.request.user)
        return Ticket.objects.none()

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
        