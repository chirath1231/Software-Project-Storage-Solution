
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
<<<<<<< HEAD
from .serializers import RegisterSerializer, LoginSerializer, GoogleAuthSerializer, ProfileSerializer, ProfileUpdateSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import UpdateAPIView
=======
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny, IsAuthenticated
>>>>>>> origin/main
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Profile

try:
    from google.oauth2 import id_token
except ImportError:
    import sys
    print("Current Python Executable:", sys.executable)
    print("System Path:", sys.path)
    raise

from google.auth.transport import requests as google_requests

from .serializers import RegisterSerializer, LoginSerializer, GoogleAuthSerializer


GOOGLE_CLIENT_ID = "781385776424-n8823en67ojbuq8jnhjude79pq9jl7c5.apps.googleusercontent.com"

# ==========================================
# AUTHENTICATION VIEWS
# ==========================================
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            # --- Trigger Welcome Notification ---
            create_system_notification(
                user=user,
                title="Welcome to CEYNOA!",
                message="Your account has been created successfully. Explore your dashboard to get started."
            )

            return Response({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)

            perms = []
            if user.is_staff:
                perms = ["*"] if user.is_superuser else list(user.admin_permissions.values_list('code', flat=True))

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
<<<<<<< HEAD
                "id": user.id,
=======
                "user_id": user.id,
>>>>>>> origin/main
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "role": "superadmin" if user.is_superuser else ("admin" if user.is_staff else "user"),
                "permissions": perms,
            })

        return Response(serializer.errors, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID
            )

            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])

            user, created = User.objects.get_or_create(
                email=email,
                defaults={"username": email}
            )

<<<<<<< HEAD
            # Ensure a profile exists for Google users
            Profile.objects.get_or_create(user=user)

            if not user.is_active:
                return Response(
                    {"detail": "This account has been suspended. Please contact support."},
                    status=status.HTTP_403_FORBIDDEN
=======
            if created:
                # --- Trigger Welcome Notification for Google Login ---
                create_system_notification(
                    user=user,
                    title="Welcome to CEYNOA!",
                    message="Your Google account was linked successfully. Explore your dashboard to get started."
>>>>>>> origin/main
                )

            refresh = RefreshToken.for_user(user)

            perms = []
            if user.is_staff:
                perms = ["*"] if user.is_superuser else list(user.admin_permissions.values_list('code', flat=True))

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
<<<<<<< HEAD
                "id": user.id,
=======
                "user_id": user.id,
>>>>>>> origin/main
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "role": "superadmin" if user.is_superuser else ("admin" if user.is_staff else "user"),
                "permissions": perms,
                "is_new_user": created
            })

        except ValueError:
            return Response(
                {"detail": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST
            )

<<<<<<< HEAD
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure a profile exists for the user to prevent 500 errors if creation was skipped
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class ProfileUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile
=======

>>>>>>> origin/main
