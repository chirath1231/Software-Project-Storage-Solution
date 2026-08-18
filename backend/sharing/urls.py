from django.urls import path
from . import views

urlpatterns = [
    # File shares
    path("files/<int:file_id>/share/", views.file_share_view, name="file-share"),
    path("files/<int:file_id>/share/collaborators/", views.add_collaborator, name="file-share-add-collab"),
    path("files/<int:file_id>/share/collaborators/<int:collab_id>/", views.remove_collaborator, name="file-share-remove-collab"),
    path("shared/<uuid:token>/", views.shared_file_view, name="shared-file"),
    # Folder shares
    path("folders/<int:folder_id>/share/", views.folder_share_view, name="folder-share"),
    path("folders/<int:folder_id>/share/collaborators/", views.add_folder_collaborator, name="folder-share-add-collab"),
    path("folders/<int:folder_id>/share/collaborators/<int:collab_id>/", views.remove_folder_collaborator, name="folder-share-remove-collab"),
    path("shared/folder/<uuid:token>/", views.shared_folder_view, name="shared-folder"),
]
