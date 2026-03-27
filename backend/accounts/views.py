from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer, GoogleAuthSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import PasswordResetOTP
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer, ProfileSerializer, ProfileUpdateSerializer
from django.core.mail import send_mail
import random
from rest_framework.permissions import IsAuthenticated
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.generics import UpdateAPIView


GOOGLE_CLIENT_ID = "781385776424-n8823en67ojbuq8jnhjude79pq9jl7c5.apps.googleusercontent.com" 
# GOOGLE_CLIENT_ID = "24543519606-c5f9nj651gt4rqjhh2k9ntl06it1fl7m.apps.googleusercontent.com" 

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
                GOOGLE_CLIENT_ID
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
        serializer = ProfileSerializer(profile)
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