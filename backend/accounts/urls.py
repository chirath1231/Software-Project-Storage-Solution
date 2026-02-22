# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginAPIView, GoogleLoginAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import NotificationListView, MarkNotificationReadView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),   
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('login/', LoginAPIView.as_view(), name="login"),
    path("google/", GoogleLoginAPIView.as_view()),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-mark-read'),
]
