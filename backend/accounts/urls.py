# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginAPIView, GoogleLoginAPIView, EventListCreateView, EventDetailView, NotificationListView, NotificationReadView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import EventListCreateView, EventDetailView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),   # login with credentials
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('login/', LoginAPIView.as_view(), name="login"),
    path("google/", GoogleLoginAPIView.as_view()),
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    # path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    # path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
]
