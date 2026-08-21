from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
)

try:
    from google.oauth2 import id_token
except ImportError:
    import sys

    print("Current Python Executable:", sys.executable)
    print("System Path:", sys.path)
    raise

from google.auth.transport import requests as google_requests


GOOGLE_CLIENT_ID = (
    "781385776424-n8823en67ojbuq8jnhjude79pq9jl7c5.apps.googleusercontent.com"
)


# =========================================================
# OPTIONAL NOTIFICATION HELPER IMPORT
# =========================================================
# Keep this if create_system_notification exists in your project.
# Change the import path if your helper is located somewhere else.
try:
    from notifications.utils import create_system_notification
except ImportError:
    def create_system_notification(user, title, message):
        # Prevent authentication from crashing if notification helper
        # is unavailable during deployment.
        return None


# =========================================================
# REGISTER
# =========================================================

@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Ensure profile exists
            Profile.objects.get_or_create(user=user)

            refresh = RefreshToken.for_user(user)

            create_system_notification(
                user=user,
                title="Welcome to CEYNOA!",
                message=(
                    "Your account has been created successfully. "
                    "Explore your dashboard to get started."
                ),
            )

            return Response(
                {
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    },
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# LOGIN
# =========================================================

@method_decorator(csrf_exempt, name="dispatch")
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Prevent suspended users from logging in
            if not user.is_active:
                return Response(
                    {
                        "detail": (
                            "This account has been suspended. "
                            "Please contact support."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(user)

            perms = []

            if user.is_staff:
                if user.is_superuser:
                    perms = ["*"]
                else:
                    perms = list(
                        user.admin_permissions.values_list(
                            "code",
                            flat=True,
                        )
                    )

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),

                    # Keep both names for frontend compatibility
                    "id": user.id,
                    "user_id": user.id,

                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "role": (
                        "superadmin"
                        if user.is_superuser
                        else (
                            "admin"
                            if user.is_staff
                            else "user"
                        )
                    ),
                    "permissions": perms,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# GOOGLE LOGIN
# =========================================================

@method_decorator(csrf_exempt, name="dispatch")
class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )

            email = idinfo["email"]

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": idinfo.get("given_name", ""),
                    "last_name": idinfo.get("family_name", ""),
                },
            )

            # Ensure every Google user has a profile
            Profile.objects.get_or_create(user=user)

            # Prevent suspended users from signing in
            if not user.is_active:
                return Response(
                    {
                        "detail": (
                            "This account has been suspended. "
                            "Please contact support."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if created:
                create_system_notification(
                    user=user,
                    title="Welcome to CEYNOA!",
                    message=(
                        "Your Google account was linked successfully. "
                        "Explore your dashboard to get started."
                    ),
                )

            refresh = RefreshToken.for_user(user)

            perms = []

            if user.is_staff:
                if user.is_superuser:
                    perms = ["*"]
                else:
                    perms = list(
                        user.admin_permissions.values_list(
                            "code",
                            flat=True,
                        )
                    )

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),

                    # Keep both for compatibility
                    "id": user.id,
                    "user_id": user.id,

                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "role": (
                        "superadmin"
                        if user.is_superuser
                        else (
                            "admin"
                            if user.is_staff
                            else "user"
                        )
                    ),
                    "permissions": perms,
                    "is_new_user": created,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError:
            return Response(
                {"detail": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# =========================================================
# PROFILE
# =========================================================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
            profile,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# PROFILE UPDATE
# =========================================================

class ProfileUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(
            user=self.request.user
        )

        return profile
