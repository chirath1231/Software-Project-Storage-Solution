from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    LoginAPIView,
    GoogleLoginAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    ProfileView,
    ProfileUpdateView,
    DeleteView,
    RestoreAccountView,
    ChangePasswordView,
)


urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("google/", GoogleLoginAPIView.as_view(), name="google_login"),

    # JWT
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Profile
    path("profile/", ProfileView.as_view(), name="profile"),
    path(
        "profile-update/",
        ProfileUpdateView.as_view(),
        name="profile-update",
    ),

    # Password management
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="reset-password"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),

    # Account deletion & restoration
    path("delete-account/", DeleteView.as_view(), name="delete-account"),
    path("restore-account/", RestoreAccountView.as_view(), name="restore-account"),
]
