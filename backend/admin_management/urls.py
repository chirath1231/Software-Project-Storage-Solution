from django.urls import path
from .views import AdminChangePasswordView, AdminLoginView, AdminUserListView

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('admin/change-password/', AdminChangePasswordView.as_view(), name='admin_change_password'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
]