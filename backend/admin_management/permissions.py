from rest_framework.permissions import BasePermission
from functools import wraps
from rest_framework.response import Response
from rest_framework import status


class HasAdminPermission(BasePermission):
    """
    Central RBAC Permission class for Django REST Framework.
    
    1. Rejects unauthenticated requests (401/403).
    2. Rejects non-staff users (403 Forbidden).
    3. Super Admins (is_superuser=True) automatically pass all checks.
    4. Restricted Admins (is_staff=True, is_superuser=False) must have the specific
       permission code assigned to their account in auth_user.admin_permissions.
    """
    required_permission = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_staff:
            return False

        # Super Admin gets full, unconditional access
        if request.user.is_superuser:
            return True

        # Check required permission from view attribute or class
        required = getattr(view, 'required_permission', self.required_permission)
        if not required:
            # If view does not specify a fine-grained permission, staff access is sufficient
            return True

        return request.user.admin_permissions.filter(code=required).exists()


def has_admin_permission(perm_code):
    """
    Convenient class factory for use in permission_classes = [has_admin_permission('payments.view')]
    or as a view decorator for function-based views.
    """
    class SpecificAdminPermission(HasAdminPermission):
        required_permission = perm_code

    return SpecificAdminPermission


def admin_permission_required(perm_code):
    """
    Decorator for DRF function-based API views:
    @api_view(["GET"])
    @admin_permission_required("reports.view")
    def my_view(request): ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication credentials were not provided."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            if not request.user.is_staff:
                return Response(
                    {"detail": "Access denied: Staff privileges required."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)

            if not request.user.admin_permissions.filter(code=perm_code).exists():
                return Response(
                    {
                        "detail": f"Forbidden: You do not have the required '{perm_code}' permission.",
                        "required_permission": perm_code,
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator
