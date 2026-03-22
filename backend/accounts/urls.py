# accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginAPIView, GoogleLoginAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),   # login with credentials
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('login/', LoginAPIView.as_view(), name="login"),
    path("google/", GoogleLoginAPIView.as_view()),
]
