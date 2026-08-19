from rest_framework import viewsets, permissions
from .models import Ticket
from .serializers import TicketSerializer

from notifications.utils import create_system_notification

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    # Change from AllowAny to IsAuthenticated
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        