from django.urls import path
from .views import upload_file, list_files, delete_file

urlpatterns = [
    path("files/", list_files),
    path("files/upload/", upload_file),
    path("files/<int:id>/", delete_file),
]
