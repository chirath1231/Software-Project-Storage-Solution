from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_files),
    path("upload/", views.upload_file),

    path("<int:id>/trash/", views.move_to_trash),
    path("trash/", views.list_trash),

    path("trash/<int:id>/restore/", views.restore_file),
    path("trash/<int:id>/", views.permanent_delete_file),  # ✅ FIXED
]