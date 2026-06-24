from django.urls import path
from . import views

urlpatterns = [
    path("files/<int:file_id>/share/", views.file_share_view, name="file-share"),
    path("files/<int:file_id>/share/collaborators/", views.add_collaborator, name="file-share-add-collab"),
    path("files/<int:file_id>/share/collaborators/<int:collab_id>/", views.remove_collaborator, name="file-share-remove-collab"),
    path("shared/<uuid:token>/", views.shared_file_view, name="shared-file"),

]