from django.urls import path
from .views import EventListCreateView, EventDetailView

urlpatterns = [
    # We leave the prefix out here because we will map it in the main urls.py!
    path('', EventListCreateView.as_view(), name='event-list-create'),
    path('<int:pk>/', EventDetailView.as_view(), name='event-detail'),
]