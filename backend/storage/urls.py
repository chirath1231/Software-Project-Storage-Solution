# backend/storage/urls.py
from django.urls import path
from .views import upload_file, list_files, delete_file, access_shared_file, generate_share_link

urlpatterns = [
    path("files/upload/", upload_file),
    path("files/", list_files),
    path("files/<int:id>/delete/", delete_file),
    path("files/<int:file_id>/share/", generate_share_link),  # <-- fix: import this view
    path("share/<uuid:token>/", access_shared_file),
]