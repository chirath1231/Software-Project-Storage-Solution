from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    LoginAPIView,
    GoogleLoginAPIView,
    ProfileView,
    ProfileUpdateView,
)



urlpatterns = [
<<<<<<< HEAD
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
]
=======
    # Admin Panel
    path("admin/", admin.site.urls),

    # Accounts & Authentication
    path("api/auth/", include("accounts.urls")),
    path("api/accounts/", include("accounts.urls")),

    # Notifications
    path("api/accounts/notifications/", include("notifications.urls")),

    # Calendar Events
    path("api/accounts/events/", include("events.urls")),

    # Subscriptions
    path("api/subscriptions/", include("subscriptions.urls")),

    # Chat System
    path("api/chat/", include("chat.urls")),
    path("api/", include("chat.api_urls")),

    # Storage & File Management
    path("api/files/", include("storage.urls")),
    path("api/", include("storage.urls")),

    # Sharing API
    path("api/", include("sharing.urls")),

    # Support Tickets
    path("api/", include("tickets.urls")),

    # Admin Management
    path("api/", include("admin_management.urls")),
]


# Serve media files locally in development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
>>>>>>> c5d9789ae46436abbd3edf26820e3f131295bc07
