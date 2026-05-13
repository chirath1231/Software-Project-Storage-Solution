import os
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer, GoogleAuthSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken #Token creation happens here
from django.contrib.auth.models import User
from .models import AccountDeletion, PasswordResetOTP
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer, ProfileSerializer, ProfileUpdateSerializer, DeleteAccountSerializer
from django.core.mail import send_mail
import random
from rest_framework.permissions import IsAuthenticated
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.generics import UpdateAPIView
from django.utils.timezone import now
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

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
            
            # BLOCK if marked for deletion
            if AccountDeletion.objects.filter(user=user, is_deleted=True).exists():
                return Response(
                    {"error": "Account is scheduled for deletion (You have tried to delete your account). Contact support to restore."},
                    status=403
                )
            
            # BLOCK if inactive
            if not user.is_active:
                return Response(
                    {"error": "Your account has been deactivated."},
                    status=403
                )

            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
                "email": user.email,
                "message": f"Welcome {user.username}"
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
                requests.Request(),
                os.getenv("GOOGLE_CLIENT_ID")
            )

            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])

            user, created = User.objects.get_or_create(
                email=email,
                defaults={"username": name}
            )

            # If the user exists but username is still 'User' or empty, update it
            if not created and (user.username == "" or user.username.lower() == "user"):
                user.username = name
                user.save()
            
            # BLOCK if marked for deletion
            if AccountDeletion.objects.filter(user=user, is_deleted=True).exists():
                return Response(
                    {"error": "Account is scheduled for deletion (You have tried to delete your account). Contact support to restore."},
                    status=403
                )
            
            # BLOCK if inactive
            if not user.is_active:
                return Response(
                    {"error": "Your account has been deactivated. Contact our team for more clarification."},
                    status=403
                )

            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
                "email": user.email,
                "is_new_user": created,
                "message": f"Welcome {user.username}"
            })

        except ValueError:
            return Response(
                {"detail": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST
            )

@method_decorator(csrf_exempt, name='dispatch')
class ForgotPasswordAPIView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Email not found"}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        PasswordResetOTP.objects.create(user=user, otp=otp)

        # Send email
        send_mail(
            "Your Password Reset OTP",
            f"Your OTP is: {otp}. It will expire in 10 minutes.",
            "no-reply@example.com",
            [email],
            fail_silently=False,
        )

        return Response({"detail": "OTP sent to your email."}, status=status.HTTP_200_OK)


class ResetPasswordAPIView(APIView):
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

        # Reset password
        user.set_password(new_password)
        user.save()

        # Delete used OTP
        otp_record.delete()

        return Response({"detail": "Password reset successfully"}, status=status.HTTP_200_OK)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
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
    queryset = User.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Return the currently logged-in user
        return self.request.user.profile
    
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

        # Restore
        user.is_active = True
        user.save()

        deletion_obj.is_deleted = False
        deletion_obj.deleted_at = None
        deletion_obj.save()

        return Response({"message": "Account restored successfully"})

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        # 1. Verify current password
        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect"},
                status=400
            )

        # 2. Validate new password strength (Django validators)
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=400
            )

        # 3. Set new password
        user.set_password(new_password)
        user.save()

        # 4. Keep user logged in (important if session auth used)
        update_session_auth_hash(request, user)

        return Response(
            {"message": "Password changed successfully"}
        )