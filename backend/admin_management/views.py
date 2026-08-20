<<<<<<< HEAD
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum
from django.apps import apps
from .models import AdminUser, AdminPermission
from .permissions import HasAdminPermission

User = get_user_model()
logger = logging.getLogger(__name__)


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # ==========================================
        # STEP 1: GET EMAIL + PASSWORD FROM FRONTEND
        # ==========================================
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

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
            user = User.objects.filter(email=email).first()

            # Check if there are any existing superusers in the system
            has_superuser = User.objects.filter(is_superuser=True).exists()

            if not user:
                # The very first admin created becomes Super Admin automatically
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    is_staff=True,
                    is_superuser=not has_superuser
                )
                logger.info("Created new staff user for admin: %s (superuser: %s)", email, not has_superuser)
            else:
                updated = False
                if not user.is_staff:
                    user.is_staff = True
                    updated = True
                # If no superuser exists yet, promote this user
                if not has_superuser and not user.is_superuser:
                    user.is_superuser = True
                    updated = True
                if updated:
                    user.save()

            # ==========================================
            # STEP 5: GENERATE JWT TOKENS & PERMISSIONS
            # ==========================================
            refresh = RefreshToken.for_user(user)

            if user.is_superuser:
                perms_list = ["*"]
            else:
                perms_list = list(user.admin_permissions.values_list('code', flat=True))

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': email,
                    'username': user.username,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'role': 'superadmin' if user.is_superuser else 'admin',
                    'permissions': perms_list,
                }
            }, status=status.HTTP_200_OK)

        except AdminUser.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class AdminChangePasswordView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = "settings.manage"

    def post(self, request):
        email = request.user.email
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

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
            admin_user = AdminUser.objects.get(email=email)

            if not check_password(current_password, admin_user.password):
                return Response(
                    {'error': 'Incorrect current password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            admin_user.password = make_password(new_password)
            admin_user.save()

            # Also update auth_user password to stay synchronized
            request.user.set_password(new_password)
            request.user.save()

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


class CheckAdminView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'is_admin': False}, status=status.HTTP_200_OK)
        is_admin = AdminUser.objects.filter(email=email).exists()
        return Response({'is_admin': is_admin}, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    permission_classes = [HasAdminPermission]
    required_permission = "users.view"

    def get(self, request):
        # Fetch all users from database
        users = User.objects.select_related('profile').all().order_by('-date_joined')

        # Storage usage aggregation
        try:
            FileModel = apps.get_model('storage', 'File')
            usage_data = (
                FileModel.objects
                .values('user_id')
                .annotate(total_size=Sum('size'))
            )
            usage_map = {item['user_id']: item['total_size'] for item in usage_data}
        except Exception as e:
            logger.error("Storage aggregation failed: %s", e)
            usage_map = {}

        # Active subscriptions
        try:
            SubPaymentModel = apps.get_model('subscriptions', 'SubscriptionPayment')
            active_subs = (
                SubPaymentModel.objects
                .filter(status="ACTIVE")
                .select_related('subscription')
            )
            sub_map = {
                s.user_email.lower(): (s.subscription.name, s.subscription.storage)
                for s in active_subs
            }
        except Exception as e:
            logger.error("Subscription data fetch failed: %s", e)
            sub_map = {}

        data = []
        for u in users:
            used_bytes = usage_map.get(u.id, 0) or 0
            package_name, limit_gb = sub_map.get(u.email.lower(), ("Free", 5))
            limit_bytes = limit_gb * 1024 * 1024 * 1024
            pct = (used_bytes / limit_bytes * 100) if limit_bytes > 0 else 0

            data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "is_active": u.is_active,
                "is_staff": u.is_staff,
                "is_superuser": u.is_superuser,
                "country": u.profile.country if hasattr(u, 'profile') else "N/A",
                "date_joined": u.date_joined.strftime("%Y-%m-%d"),
                "last_login": (
                    u.last_login.strftime("%Y-%m-%d %H:%M")
                    if u.last_login else "Never"
                ),
                "storage_used_bytes": used_bytes,
                "total_storage_gb": limit_gb,
                "package_name": package_name,
                "storage_usage_pct": min(round(pct, 2), 100.0),
            })

        return Response(data, status=status.HTTP_200_OK)


class AdminUserToggleSuspendView(APIView):
    """
    Suspend or reactivate a user account by setting is_active in Django auth_user.
    Requires users.manage permission.
    """
    permission_classes = [HasAdminPermission]
    required_permission = "users.manage"

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Protect against suspending own admin account
        if target_user.id == request.user.id:
            return Response(
                {'detail': 'You cannot suspend your own admin account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get('action')
        if action == 'suspend':
            target_user.is_active = False
        elif action in ['activate', 'reactivate']:
            target_user.is_active = True
        else:
            target_user.is_active = not target_user.is_active

        target_user.save()

        status_text = "reactivated" if target_user.is_active else "suspended"
        logger.info(
            "Admin %s %s user %s (ID: %s)",
            request.user.email,
            status_text,
            target_user.email,
            target_user.id
        )

        return Response({
            'message': f"User account has been {status_text} successfully.",
            'user_id': target_user.id,
            'is_active': target_user.is_active,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# RBAC: SUPER ADMIN PERMISSION MANAGEMENT VIEWS
# ==============================================================================

class AdminPermissionListView(APIView):
    """
    Super Admin endpoint to list all system permissions and all admin accounts
    with their assigned permission scopes.
    """
    permission_classes = [HasAdminPermission]
    required_permission = "admin_permissions.manage"

    def get(self, request):
        # 0. Automatically synchronize all AdminUser records (admins table) into Django auth_user
        try:
            for admin_rec in AdminUser.objects.all():
                email_clean = (admin_rec.email or "").strip().lower()
                if email_clean:
                    u = User.objects.filter(email=email_clean).first()
                    if not u:
                        has_super = User.objects.filter(is_superuser=True).exists()
                        User.objects.create_user(
                            username=email_clean,
                            email=email_clean,
                            is_staff=True,
                            is_superuser=not has_super
                        )
                    elif not u.is_staff:
                        u.is_staff = True
                        u.save(update_fields=['is_staff'])
        except Exception as sync_err:
            logger.warning("AdminUser to auth_user auto-sync encountered an issue: %s", sync_err)

        # 1. Fetch all permissions
        permissions = AdminPermission.objects.all().order_by('category', 'code')
        permissions_data = [
            {
                "id": p.id,
                "code": p.code,
                "name": p.name,
                "category": p.category,
                "description": p.description,
            }
            for p in permissions
        ]

        # 2. Fetch all staff admin accounts from auth_user
        admins = User.objects.filter(is_staff=True).prefetch_related('admin_permissions').order_by('id')
        admins_data = []

        for admin in admins:
            if admin.is_superuser:
                assigned_codes = ["*"]
            else:
                assigned_codes = list(admin.admin_permissions.values_list('code', flat=True))

            admins_data.append({
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "first_name": admin.first_name,
                "last_name": admin.last_name,
                "is_superuser": admin.is_superuser,
                "is_staff": admin.is_staff,
                "is_active": admin.is_active,
                "date_joined": admin.date_joined.strftime("%Y-%m-%d"),
                "last_login": (
                    admin.last_login.strftime("%Y-%m-%d %H:%M")
                    if admin.last_login else "Never"
                ),
                "permissions": assigned_codes,
            })

        return Response({
            "permissions": permissions_data,
            "admins": admins_data,
        }, status=status.HTTP_200_OK)


class AdminUserPermissionUpdateView(APIView):
    """
    Super Admin endpoint to update the assigned permissions for an admin account.
    """
    permission_classes = [HasAdminPermission]
    required_permission = "admin_permissions.manage"

    def put(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Admin user not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not target_user.is_staff:
            return Response(
                {"detail": "Permissions can only be assigned to staff/admin accounts."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Handle optional is_superuser toggle
        if "is_superuser" in request.data and request.user.is_superuser:
            is_super = bool(request.data.get("is_superuser"))
            # Prevent removing own superuser status if it's the last superuser
            if target_user.id == request.user.id and not is_super:
                if User.objects.filter(is_superuser=True).count() <= 1:
                    return Response(
                        {"detail": "Cannot demote the only remaining Super Admin."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            target_user.is_superuser = is_super
            target_user.save()

        # Update permissions
        permissions_codes = request.data.get("permissions", [])
        if not isinstance(permissions_codes, list):
            return Response(
                {"detail": "Permissions must be a list of permission codes."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find matching permission records
        matched_perms = AdminPermission.objects.filter(code__in=permissions_codes)
        target_user.admin_permissions.set(matched_perms)

        logger.info(
            "Super Admin %s updated permissions for %s (ID: %s): %s",
            request.user.email,
            target_user.email,
            target_user.id,
            list(matched_perms.values_list('code', flat=True))
        )

        return Response({
            "message": f"Permissions updated successfully for {target_user.email}.",
            "user_id": target_user.id,
            "is_superuser": target_user.is_superuser,
            "permissions": (
                ["*"] if target_user.is_superuser else list(target_user.admin_permissions.values_list('code', flat=True))
            ),
        }, status=status.HTTP_200_OK)
=======
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
>>>>>>> origin/main
