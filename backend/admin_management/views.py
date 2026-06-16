import logging #For logging important events and errors.
from rest_framework.views import APIView #Base class for API views in Django REST Framework.
from rest_framework.response import Response #Standard response object for API views.,json responds back to frontend
from rest_framework import status #HTTP status codes for responses
from rest_framework.permissions import IsAuthenticated  #Permission class to restrict access to authenticated users only.
from django.contrib.auth.hashers import check_password, make_password #Utilities for hashing and verifying passwords.
from django.contrib.auth import get_user_model #Gets the active Django User model safely.
from rest_framework_simplejwt.tokens import RefreshToken #Creates JWT tokens for authentication.
from django.db.models import Sum #Used for database aggregation.
from django.apps import apps
from .models import AdminUser


User = get_user_model() #Stores reference to Django auth user model.
logger = logging.getLogger(__name__)


class AdminLoginView(APIView):

    def post(self, request):
        # ==========================================
        # STEP 1: GET EMAIL + PASSWORD FROM FRONTEND
        # ==========================================
        email = request.data.get('email', '').strip().lower() 
        password = request.data.get('password', '')

        # ==========================================
        # STEP 1: VALIDATE INPUTS
        # ==========================================
        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # ==========================================
            # STEP 2: FETCH FROM CUSTOM ADMIN TABLE
            # ==========================================
            admin_record = AdminUser.objects.get(email=email)

            #Looks inside custom Admin table
            # ==========================================
            # STEP 3: VERIFY PASSWORD
            # ==========================================
            if not check_password(password, admin_record.password):
                return Response(
                    {'detail': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # ==========================================
            # STEP 4: SYNC WITH DJANGO AUTH USER TABLE
            # ==========================================
            #checks default Django auth table
            user = User.objects.filter(email=email).first()

            if not user:
                # Create a new staff user if they don't exist in auth_user
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    is_staff=True
                )
                logger.info("Created new staff user for admin: %s", email)

            # If user exists but isn't staff, promote them to staff - this handles the case where an admin was created in the custom table but not yet synced to auth_user
            elif not user.is_staff:
                # Promote existing normal user to staff
                logger.warning(
                    "Promoting existing user %s to staff on admin login", email
                )
                user.is_staff = True
                user.save()

            # ==========================================
            # STEP 5: GENERATE JWT TOKENS
            # Only return access token — refresh token
            # should not be exposed in JSON response
            # ==========================================
            refresh = RefreshToken.for_user(user)
            #creates login tokens

            return Response({
                #Frontend stores token.
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': email,
                    'is_staff': True,
                }
            }, status=status.HTTP_200_OK)

        #If email not found:prevent server crash.
        except AdminUser.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class AdminChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    #Only logged-in users can access this

    def post(self, request):
        # ==========================================
        # STEP 1: USE AUTHENTICATED USER'S EMAIL
        # Never trust client-supplied email —
        # an admin could change another admin's
        # password by supplying a different email
        # ==========================================
        email = request.user.email  #prevent from malicious admin change another admin's password.
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        # ==========================================
        # STEP 2: VALIDATE INPUTS
        # ==========================================
        if not all([current_password, new_password]):
            return Response(
                {'error': 'All fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_password == new_password:
            return Response(
                {'error': 'New password must differ from current password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # ==========================================
            # STEP 3: FETCH ADMIN RECORD
            # ==========================================
            admin_user = AdminUser.objects.get(email=email)

            # ==========================================
            # STEP 4: VERIFY CURRENT PASSWORD
            # ==========================================
            if not check_password(current_password, admin_user.password):
                return Response(
                    {'error': 'Incorrect current password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ==========================================
            # STEP 5: HASH AND SAVE NEW PASSWORD
            # ==========================================
            admin_user.password = make_password(new_password)
            admin_user.save()

            logger.info("Password changed successfully for admin: %s", email)

            return Response(
                {'message': 'Password updated successfully.'},
                status=status.HTTP_200_OK
            )

        except AdminUser.DoesNotExist:
            return Response(
                {'error': 'Admin record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

#CHECK IF USER IS ADMIN
class CheckAdminView(APIView):
    def post(self, request): #checks if user is admin by looking up email in custom AdminUser table
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'is_admin': False}, status=status.HTTP_200_OK)
        is_admin = AdminUser.objects.filter(email=email).exists()
        return Response({'is_admin': is_admin}, status=status.HTTP_200_OK)

class AdminUserListView(APIView):
    #AdminUserListView is used to provide the admin dashboard with complete user management data by securely fetching users, storage usage, subscription details, and calculated analytics from the database and sending them to the frontend
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ==========================================
        # STEP 1: STAFF-ONLY AUTHORIZATION CHECK
        # ==========================================
        #Only admins allowed
        if not request.user.is_staff:
            return Response(
                {'detail': 'Not authorized: Staff privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ==========================================
        # STEP 2: FETCH ALL USERS WITH PROFILES
        # ==========================================
        users = User.objects.select_related('profile').all().order_by('-date_joined') #fetches all users from database

        # ==========================================
        # STEP 3: AGGREGATE STORAGE USAGE
        # ==========================================
        try:
            FileModel = apps.get_model('storage', 'File')
            #dynamically loads File model

            usage_data = (
                FileModel.objects
                .values('user_id')
                .annotate(total_size=Sum('size')) #calculates total storage per user
            )
            usage_map = {item['user_id']: item['total_size'] for item in usage_data}

        except LookupError:
            logger.error("Storage app or File model not found.")
            usage_map = {}

        except Exception as e:
            logger.error("Storage aggregation failed: %s", e)
            usage_map = {}

        # ==========================================
        # STEP 4: FETCH ACTIVE SUBSCRIPTION DATA
        # ==========================================
        try:
            SubPaymentModel = apps.get_model('subscriptions', 'SubscriptionPayment') #loads subscription table
            active_subs = (
                SubPaymentModel.objects
                .filter(status="ACTIVE") #only active plans ; gets each user's plan
                .select_related('subscription') #optimizes by fetching related subscription data in same query
            )
            sub_map = {
                s.user_email.lower(): (s.subscription.name, s.subscription.storage)
                for s in active_subs
            }

        except LookupError:
            logger.error("Subscriptions app or SubscriptionPayment model not found.")
            sub_map = {}

        except Exception as e:
            logger.error("Subscription data fetch failed: %s", e)
            sub_map = {}

        # ==========================================
        # STEP 5: BUILD RESPONSE DATA
        # ==========================================
        data = []

        for u in users: #create loops
            used_bytes = usage_map.get(u.id, 0) or 0   #STORAGE USED
            package_name, limit_gb = sub_map.get(u.email.lower(), ("Free", 5))  #plan info-default 5gb
            limit_bytes = limit_gb * 1024 * 1024 * 1024

            pct = (used_bytes / limit_bytes * 100) if limit_bytes > 0 else 0 #PERCENTAGE CALCULATION

            data.append({ #builds response data
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "country": u.profile.country if hasattr(u, 'profile') else "N/A",
                "date_joined": u.date_joined.strftime("%Y-%m-%d"),
                "last_login": (
                    u.last_login.strftime("%Y-%m-%d %H:%M")
                    if u.last_login else "Never"
                ),
                "storage_used_bytes": used_bytes,
                "total_storage_gb": limit_gb,
                "package_name": package_name,
                # Cap at 100% to handle edge cases where usage exceeds plan limit
                "storage_usage_pct": min(round(pct, 2), 100.0), 
            })

        return Response(data, status=status.HTTP_200_OK)