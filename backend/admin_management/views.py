from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AdminUser

User = get_user_model()

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

            # 3. Synchronize with Django's internal User system
            user = User.objects.filter(email=email).first()
            if not user:
                # Create a new staff user if they don't exist in auth_user
                user = User.objects.create_user(
                    username=email, # Use email as username to ensure uniqueness
                    email=email,
                    is_staff=True
                )
            elif not user.is_staff:
                # Upgrade existing normal user to staff
                user.is_staff = True
                user.save()

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

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only allow staff members to see the user list
        if not request.user.is_staff:
            return Response({"detail": "Not authorized: Staff privileges required."}, status=status.HTTP_403_FORBIDDEN)
            
        # Fetch all users so you can see your test data
        users = User.objects.all().order_by('-date_joined')
        
        data = [{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "date_joined": u.date_joined.strftime("%Y-%m-%d"),
            "is_active": u.is_active,
            "last_login": u.last_login.strftime("%Y-%m-%d %H:%M") if u.last_login else "Never"
        } for u in users]
        
        return Response(data, status=status.HTTP_200_OK)
