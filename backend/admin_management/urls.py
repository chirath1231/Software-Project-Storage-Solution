# urls.py (correct)
from django.urls import path
from .views import (
    AdminLoginView,
    AdminChangePasswordView,
    AdminUserListView,
    AdminUserToggleSuspendView,
    CheckAdminView,
)

urlpatterns = [
    path('check-admin/', CheckAdminView.as_view()),
    path('admin/login/', AdminLoginView.as_view()),
    path('admin/change-password/', AdminChangePasswordView.as_view()),
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/<int:user_id>/suspend/', AdminUserToggleSuspendView.as_view()),
]