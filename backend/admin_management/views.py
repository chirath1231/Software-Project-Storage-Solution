import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.apps import apps

from rest_framework_simplejwt.tokens import RefreshToken

from .models import AdminUser, AdminPermission
from .permissions import HasAdminPermission


User = get_user_model()
logger = logging.getLogger(__name__)


# ============================================================
# ADMIN LOGIN
# ============================================================

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        # Get email and password
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Find admin from custom AdminUser table
            admin_record = AdminUser.objects.get(email=email)

            # Check password
            if not check_password(password, admin_record.password):
                return Response(
                    {'detail': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Find matching Django User
            user = User.objects.filter(email=email).first()

            # Check whether system already has a superuser
            has_superuser = User.objects.filter(
                is_superuser=True
            ).exists()

            # Create Django auth user if it doesn't exist
            if not user:

                user = User.objects.create_user(
                    username=email,
                    email=email,
                    is_staff=True,
                    is_superuser=not has_superuser
                )

                logger.info(
                    "Created new staff user for admin: %s "
                    "(superuser: %s)",
                    email,
                    not has_superuser
                )

            else:
                updated = False

                if not user.is_staff:
                    user.is_staff = True
                    updated = True

                # If no superuser exists, promote this admin
                if not has_superuser and not user.is_superuser:
                    user.is_superuser = True
                    updated = True

                if updated:
                    user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            # Get permissions
            if user.is_superuser:
                perms_list = ["*"]
            else:
                perms_list = list(
                    user.admin_permissions.values_list(
                        'code',
                        flat=True
                    )
                )

            return Response(
                {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),

                    'user': {
                        'id': user.id,
                        'email': email,
                        'username': user.username,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                        'role': (
                            'superadmin'
                            if user.is_superuser
                            else 'admin'
                        ),
                        'permissions': perms_list,
                    }
                },
                status=status.HTTP_200_OK
            )

        except AdminUser.DoesNotExist:

            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


# ============================================================
# ADMIN CHANGE PASSWORD
# ============================================================

class AdminChangePasswordView(APIView):

    permission_classes = [HasAdminPermission]
    required_permission = "settings.manage"

    def post(self, request):

        email = request.user.email

        current_password = request.data.get(
            'current_password',
            ''
        )

        new_password = request.data.get(
            'new_password',
            ''
        )

        if not all([current_password, new_password]):

            return Response(
                {'error': 'All fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:

            return Response(
                {
                    'error':
                    'New password must be at least 8 characters.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_password == new_password:

            return Response(
                {
                    'error':
                    'New password must differ from current password.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            admin_user = AdminUser.objects.get(
                email=email
            )

            if not check_password(
                current_password,
                admin_user.password
            ):

                return Response(
                    {
                        'error':
                        'Incorrect current password.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update AdminUser password
            admin_user.password = make_password(
                new_password
            )

            admin_user.save()

            # Update Django auth_user password
            request.user.set_password(
                new_password
            )

            request.user.save()

            logger.info(
                "Password changed successfully for admin: %s",
                email
            )

            return Response(
                {
                    'message':
                    'Password updated successfully.'
                },
                status=status.HTTP_200_OK
            )

        except AdminUser.DoesNotExist:

            return Response(
                {
                    'error':
                    'Admin record not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )


# ============================================================
# CHECK WHETHER EMAIL IS ADMIN
# ============================================================

class CheckAdminView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get(
            'email',
            ''
        ).strip().lower()

        if not email:

            return Response(
                {'is_admin': False},
                status=status.HTTP_200_OK
            )

        is_admin = AdminUser.objects.filter(
            email=email
        ).exists()

        return Response(
            {'is_admin': is_admin},
            status=status.HTTP_200_OK
        )


# ============================================================
# ADMIN USER LIST
# ============================================================

class AdminUserListView(APIView):

    permission_classes = [HasAdminPermission]
    required_permission = "users.view"

    def get(self, request):

        # Get all users
        users = (
            User.objects
            .select_related('profile')
            .all()
            .order_by('-date_joined')
        )

        # ====================================================
        # STORAGE USAGE
        # ====================================================

        try:

            FileModel = apps.get_model(
                'storage',
                'File'
            )

            usage_data = (
                FileModel.objects
                .values('user_id')
                .annotate(
                    total_size=Sum('size')
                )
            )

            usage_map = {
                item['user_id']:
                item['total_size']
                for item in usage_data
            }

        except Exception as e:

            logger.error(
                "Storage aggregation failed: %s",
                e
            )

            usage_map = {}

        # ====================================================
        # ACTIVE SUBSCRIPTIONS
        # ====================================================

        try:

            SubPaymentModel = apps.get_model(
                'subscriptions',
                'SubscriptionPayment'
            )

            active_subs = (
                SubPaymentModel.objects
                .filter(status="ACTIVE")
                .select_related('subscription')
            )

            sub_map = {
                s.user_email.lower(): (
                    s.subscription.name,
                    s.subscription.storage
                )
                for s in active_subs
            }

        except Exception as e:

            logger.error(
                "Subscription data fetch failed: %s",
                e
            )

            sub_map = {}

        # ====================================================
        # BUILD RESPONSE
        # ====================================================

        data = []

        for u in users:

            used_bytes = (
                usage_map.get(u.id, 0) or 0
            )

            package_name, limit_gb = (
                sub_map.get(
                    u.email.lower(),
                    ("Free", 5)
                )
            )

            limit_bytes = (
                limit_gb
                * 1024
                * 1024
                * 1024
            )

            if limit_bytes > 0:

                pct = (
                    used_bytes
                    / limit_bytes
                    * 100
                )

            else:
                pct = 0

            data.append(
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "first_name": u.first_name,
                    "last_name": u.last_name,

                    "is_active": u.is_active,
                    "is_staff": u.is_staff,
                    "is_superuser": u.is_superuser,

                    "country": (
                        u.profile.country
                        if hasattr(u, 'profile')
                        else "N/A"
                    ),

                    "date_joined":
                        u.date_joined.strftime(
                            "%Y-%m-%d"
                        ),

                    "last_login": (
                        u.last_login.strftime(
                            "%Y-%m-%d %H:%M"
                        )
                        if u.last_login
                        else "Never"
                    ),

                    "storage_used_bytes":
                        used_bytes,

                    "total_storage_gb":
                        limit_gb,

                    "package_name":
                        package_name,

                    "storage_usage_pct":
                        min(
                            round(pct, 2),
                            100.0
                        ),
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# ============================================================
# SUSPEND / REACTIVATE USER
# ============================================================

class AdminUserToggleSuspendView(APIView):

    permission_classes = [HasAdminPermission]
    required_permission = "users.manage"

    def post(self, request, user_id):

        try:

            target_user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:

            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent admin from suspending themselves
        if target_user.id == request.user.id:

            return Response(
                {
                    'detail':
                    'You cannot suspend your own admin account.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get(
            'action'
        )

        if action == 'suspend':

            target_user.is_active = False

        elif action in [
            'activate',
            'reactivate'
        ]:

            target_user.is_active = True

        else:

            target_user.is_active = (
                not target_user.is_active
            )

        target_user.save()

        status_text = (
            "reactivated"
            if target_user.is_active
            else "suspended"
        )

        logger.info(
            "Admin %s %s user %s (ID: %s)",
            request.user.email,
            status_text,
            target_user.email,
            target_user.id
        )

        return Response(
            {
                'message':
                    f"User account has been "
                    f"{status_text} successfully.",

                'user_id':
                    target_user.id,

                'is_active':
                    target_user.is_active,
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# RBAC - PERMISSION MANAGEMENT
# ============================================================

class AdminPermissionListView(APIView):

    permission_classes = [HasAdminPermission]
    required_permission = (
        "admin_permissions.manage"
    )

    def get(self, request):

        # ====================================================
        # SYNC AdminUser -> Django User
        # ====================================================

        try:

            for admin_rec in AdminUser.objects.all():

                email_clean = (
                    admin_rec.email or ""
                ).strip().lower()

                if email_clean:

                    u = User.objects.filter(
                        email=email_clean
                    ).first()

                    if not u:

                        has_super = (
                            User.objects
                            .filter(
                                is_superuser=True
                            )
                            .exists()
                        )

                        User.objects.create_user(
                            username=email_clean,
                            email=email_clean,
                            is_staff=True,
                            is_superuser=not has_super
                        )

                    elif not u.is_staff:

                        u.is_staff = True

                        u.save(
                            update_fields=[
                                'is_staff'
                            ]
                        )

        except Exception as sync_err:

            logger.warning(
                "AdminUser to auth_user "
                "auto-sync encountered an issue: %s",
                sync_err
            )

        # ====================================================
        # GET ALL PERMISSIONS
        # ====================================================

        permissions = (
            AdminPermission.objects
            .all()
            .order_by(
                'category',
                'code'
            )
        )

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

        # ====================================================
        # GET ADMIN ACCOUNTS
        # ====================================================

        admins = (
            User.objects
            .filter(is_staff=True)
            .prefetch_related(
                'admin_permissions'
            )
            .order_by('id')
        )

        admins_data = []

        for admin in admins:

            if admin.is_superuser:

                assigned_codes = ["*"]

            else:

                assigned_codes = list(
                    admin.admin_permissions
                    .values_list(
                        'code',
                        flat=True
                    )
                )

            admins_data.append(
                {
                    "id": admin.id,
                    "username": admin.username,
                    "email": admin.email,

                    "first_name":
                        admin.first_name,

                    "last_name":
                        admin.last_name,

                    "is_superuser":
                        admin.is_superuser,

                    "is_staff":
                        admin.is_staff,

                    "is_active":
                        admin.is_active,

                    "date_joined":
                        admin.date_joined.strftime(
                            "%Y-%m-%d"
                        ),

                    "last_login": (
                        admin.last_login.strftime(
                            "%Y-%m-%d %H:%M"
                        )
                        if admin.last_login
                        else "Never"
                    ),

                    "permissions":
                        assigned_codes,
                }
            )

        return Response(
            {
                "permissions":
                    permissions_data,

                "admins":
                    admins_data,
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# UPDATE ADMIN PERMISSIONS
# ============================================================

class AdminUserPermissionUpdateView(APIView):

    permission_classes = [HasAdminPermission]

    required_permission = (
        "admin_permissions.manage"
    )

    def put(self, request, user_id):

        try:

            target_user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Admin user not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Must be admin/staff
        if not target_user.is_staff:

            return Response(
                {
                    "detail":
                    "Permissions can only be "
                    "assigned to staff/admin accounts."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ====================================================
        # SUPERUSER TOGGLE
        # ====================================================

        if (
            "is_superuser" in request.data
            and request.user.is_superuser
        ):

            is_super = bool(
                request.data.get(
                    "is_superuser"
                )
            )

            # Prevent removing the last superadmin
            if (
                target_user.id
                == request.user.id
                and not is_super
            ):

                superuser_count = (
                    User.objects
                    .filter(
                        is_superuser=True
                    )
                    .count()
                )

                if superuser_count <= 1:

                    return Response(
                        {
                            "detail":
                            "Cannot demote the only "
                            "remaining Super Admin."
                        },
                        status=(
                            status.HTTP_400_BAD_REQUEST
                        )
                    )

            target_user.is_superuser = (
                is_super
            )

            target_user.save()

        # ====================================================
        # UPDATE PERMISSIONS
        # ====================================================

        permissions_codes = (
            request.data.get(
                "permissions",
                []
            )
        )

        if not isinstance(
            permissions_codes,
            list
        ):

            return Response(
                {
                    "detail":
                    "Permissions must be a list "
                    "of permission codes."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        matched_perms = (
            AdminPermission.objects
            .filter(
                code__in=permissions_codes
            )
        )

        target_user.admin_permissions.set(
            matched_perms
        )

        logger.info(
            "Super Admin %s updated permissions "
            "for %s (ID: %s): %s",
            request.user.email,
            target_user.email,
            target_user.id,
            list(
                matched_perms.values_list(
                    'code',
                    flat=True
                )
            )
        )

        if target_user.is_superuser:

            result_permissions = ["*"]

        else:

            result_permissions = list(
                target_user
                .admin_permissions
                .values_list(
                    'code',
                    flat=True
                )
            )

        return Response(
            {
                "message":
                    f"Permissions updated successfully "
                    f"for {target_user.email}.",

                "user_id":
                    target_user.id,

                "is_superuser":
                    target_user.is_superuser,

                "permissions":
                    result_permissions,
            },
            status=status.HTTP_200_OK
        )
