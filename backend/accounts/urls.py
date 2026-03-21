# accounts/urls.py
from django.urls import path, include
from .views import RegisterView, LoginAPIView, GoogleLoginAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import login_view
from django.contrib import admin

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),   # login with credentials
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("google/", GoogleLoginAPIView.as_view()),
    path('login/', login_view,name="login"),
]
