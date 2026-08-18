from django.urls import path
<<<<<<< HEAD
from .views import RegisterView, LoginAPIView, GoogleLoginAPIView, ProfileView, ProfileUpdateView
=======
>>>>>>> origin/main
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, 
    LoginAPIView, 
    GoogleLoginAPIView,
    

    
)

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("google/", GoogleLoginAPIView.as_view(), name="google_login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
<<<<<<< HEAD
    path('login/', LoginAPIView.as_view(), name="login"),
    path("google/", GoogleLoginAPIView.as_view()),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile-update/", ProfileUpdateView.as_view(), name="profile-update"),
=======
    

    
    
>>>>>>> origin/main
]
