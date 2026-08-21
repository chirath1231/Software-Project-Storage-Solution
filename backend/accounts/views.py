import os
import random
from django.utils.timezone import now
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, AccountDeletion, PasswordResetOTP
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GoogleAuthSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    DeleteAccountSerializer,
)

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
except ImportError:
    import sys
    print("Google Auth import warning:", sys.exc_info())
    id_token = None
    google_requests = None

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "781385776424-n8823en67ojbuq8jnhjude79pq9jl7c5.apps.googleusercontent.com",
)

try:
    from notifications.utils import create_system_notification
except ImportError:
    def create_system_notification(user, title, message):
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

            # BLOCK if marked for deletion
            if AccountDeletion.objects.filter(user=user, is_deleted=True).exists():
                return Response(
                    {"error": "Account is scheduled for deletion (Maybe you've tried to delete your account). Click 'Ok' to restore."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # BLOCK if inactive
            if not user.is_active:
                return Response(
                    {"error": "Your account has been deactivated."},
                    status=status.HTTP_403_FORBIDDEN
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
                    "message": f"Welcome {user.username}"
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
            if not id_token:
                return Response({"detail": "Google Auth library not loaded"}, status=400)

            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )

            email = idinfo["email"]
            name = idinfo.get("name", email.split("@")[0])

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": name,
                    "first_name": idinfo.get("given_name", ""),
                    "last_name": idinfo.get("family_name", ""),
                },
            )

            if not created and (user.username == "" or user.username.lower() == "user"):
                user.username = name
                user.save()

            Profile.objects.get_or_create(user=user)

            # BLOCK if marked for deletion
            if AccountDeletion.objects.filter(user=user, is_deleted=True).exists():
                return Response(
                    {"error": "Account is scheduled for deletion (Maybe you've tried to delete your account). Click to restore."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # BLOCK if inactive
            if not user.is_active:
                return Response(
                    {"error": "Your account has been deactivated. Contact our team for more clarification."},
                    status=status.HTTP_403_FORBIDDEN
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
                    "message": f"Welcome {user.username}"
                },
                status=status.HTTP_200_OK,
            )

        except ValueError:
            return Response(
                {"detail": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# =========================================================
# FORGOT & RESET PASSWORD
# =========================================================

@method_decorator(csrf_exempt, name="dispatch")
class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Email not found"}, status=status.HTTP_404_NOT_FOUND)

        otp = str(random.randint(100000, 999999))
        PasswordResetOTP.objects.create(user=user, otp=otp)

        send_mail(
            "Your Password Reset OTP",
            f"Your OTP is: {otp}. It will expire in 10 minutes.",
            "no-reply@ceynoa.com",
            [email],
            fail_silently=False,
        )

        return Response({"detail": "OTP sent to your email."}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name="dispatch")
class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid email"}, status=status.HTTP_404_NOT_FOUND)

        try:
            otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp).latest("created_at")
        except PasswordResetOTP.DoesNotExist:
            return Response({"detail": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if not otp_record.is_valid():
            return Response({"detail": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        otp_record.delete()

        return Response({"detail": "Password reset successfully"}, status=status.HTTP_200_OK)


# =========================================================
# PROFILE & UPDATE
# =========================================================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


# =========================================================
# DELETE & RESTORE ACCOUNT
# =========================================================

class DeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        password = serializer.validated_data["password"]
        user = request.user

        if not user.check_password(password):
            return Response({"error": "Incorrect password"}, status=400)

        user.is_active = False
        user.save()

        deletion_obj, _ = AccountDeletion.objects.get_or_create(user=user)
        deletion_obj.is_deleted = True
        deletion_obj.deleted_at = now()
        deletion_obj.save()

        return Response({"message": "Account scheduled for deletion"})


class RestoreAccountView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            return Response({"error": "Account not found"}, status=404)
        
        if user.is_active:
            return Response({"message": "Account is already active"}, status=200)

        deletion_obj = AccountDeletion.objects.filter(user=user, is_deleted=True).first()
        if not deletion_obj:
            return Response({"error": "No deletion request found"}, status=400)

        user.is_active = True
        user.save()

        deletion_obj.is_deleted = False
        deletion_obj.deleted_at = None
        deletion_obj.save()

        return Response({"message": "Account restored successfully"})


# =========================================================
# CHANGE PASSWORD
# =========================================================

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect"},
                status=400
            )

        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=400
            )

        user.set_password(new_password)
        user.save()

        update_session_auth_hash(request, user)

        return Response(
            {"message": "Password changed successfully"}
        )
