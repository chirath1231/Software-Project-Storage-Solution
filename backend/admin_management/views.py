from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AdminUser

class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            # 1. Fetch from custom 'admins' table
            admin_record = AdminUser.objects.get(email=email)
            
            # 2. Verify password from the admins table column
            if not check_password(password, admin_record.password):
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            # 3. Ensure a corresponding Django User exists to generate a valid JWT
            # This ensures the token works with [IsAuthenticated] permissions
            user, created = User.objects.get_or_create(
                email=email, 
                defaults={'username': email.split('@')[0], 'is_staff': True}
            )

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {'email': email, 'is_staff': True, 'id': user.id}
            })

        except AdminUser.DoesNotExist:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class AdminChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get('email')
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not all([email, current_password, new_password]):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            admin_user = AdminUser.objects.get(email=email)
            
            # Check if provided current password matches the hash in DB
            if not check_password(current_password, admin_user.password):
                return Response({'error': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)

            # Hash and save the new password
            admin_user.password = make_password(new_password)
            admin_user.save()
            
            return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
            
        except AdminUser.DoesNotExist:
            return Response({'error': 'Admin record not found.'}, status=status.HTTP_404_NOT_FOUND)
