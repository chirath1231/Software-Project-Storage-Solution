from django.urls import path

from .views import (
    AdminLoginView,
    AdminChangePasswordView,
    AdminUserListView,
    AdminUserToggleSuspendView,
    AdminPermissionListView,
    AdminUserPermissionUpdateView,
    CheckAdminView,
)

urlpatterns = [
    path(
        'check-admin/',
        CheckAdminView.as_view(),
        name='check_admin'
    ),

    path(
        'admin/login/',
        AdminLoginView.as_view(),
        name='admin_login'
    ),

    path(
        'admin/change-password/',
        AdminChangePasswordView.as_view(),
        name='admin_change_password'
    ),

    path(
        'admin/users/',
        AdminUserListView.as_view(),
        name='admin_user_list'
    ),

    path(
        'admin/users/<int:user_id>/suspend/',
        AdminUserToggleSuspendView.as_view(),
        name='admin_user_suspend'
    ),

    path(
        'admin/permissions/',
        AdminPermissionListView.as_view(),
        name='admin-permissions-list'
    ),

    path(
        'admin/permissions/<int:user_id>/',
        AdminUserPermissionUpdateView.as_view(),
        name='admin-permissions-update'
    ),
]
