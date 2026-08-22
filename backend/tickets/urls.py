from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'', TicketViewSet, basename='ticket-root')

urlpatterns = [
    path('', include(router.urls)),
]