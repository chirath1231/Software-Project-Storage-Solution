from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import FileShare, FileShareCollaborator, FolderShare, FolderShareCollaborator
from .serializers import FileShareSerializer, FileShareCollaboratorSerializer, FolderShareSerializer, FolderShareCollaboratorSerializer
from storage.models import File as FileModel, Folder as FolderModel


# ── File share endpoints ───────────────────────────────────────────────────────

@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def file_share_view(request, file_id):
    file_obj = get_object_or_404(FileModel, id=file_id, user=request.user)

    if request.method == "GET":
        share = FileShare.objects.filter(file=file_obj, owner=request.user).first()
        if not share:
            return Response({"detail": "No share created yet."}, status=status.HTTP_404_NOT_FOUND)
        return Response(FileShareSerializer(share, context={"request": request}).data)

    if request.method == "POST":
        link_permission = request.data.get("link_permission", "read")
        if link_permission not in ("read", "read_upload"):
            return Response({"detail": "Invalid permission."}, status=status.HTTP_400_BAD_REQUEST)
        share, created = FileShare.objects.get_or_create(
            file=file_obj, owner=request.user,
            defaults={"link_permission": link_permission, "is_active": True},
        )
        if not created:
            share.link_permission = link_permission
            share.is_active = True
            share.save(update_fields=["link_permission", "is_active", "updated_at"])
        serializer = FileShareSerializer(share, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    if request.method == "DELETE":
        share = get_object_or_404(FileShare, file=file_obj, owner=request.user)
        share.is_active = False
        share.save(update_fields=["is_active", "updated_at"])
        return Response({"detail": "Share link revoked."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_collaborator(request, file_id):
    file_obj = get_object_or_404(FileModel, id=file_id, user=request.user)
    share = get_object_or_404(FileShare, file=file_obj, owner=request.user)
    email = request.data.get("email", "").strip().lower()
    permission = request.data.get("permission", "read")
    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    if permission not in ("read", "read_upload"):
        return Response({"detail": "Invalid permission."}, status=status.HTTP_400_BAD_REQUEST)
    collab, created = FileShareCollaborator.objects.get_or_create(
        share=share, email=email, defaults={"permission": permission},
    )
    if not created:
        collab.permission = permission
        collab.save(update_fields=["permission"])
    return Response(FileShareCollaboratorSerializer(collab).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_collaborator(request, file_id, collab_id):
    file_obj = get_object_or_404(FileModel, id=file_id, user=request.user)
    share = get_object_or_404(FileShare, file=file_obj, owner=request.user)
    collab = get_object_or_404(FileShareCollaborator, id=collab_id, share=share)
    collab.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shared_file_view(request, token):
    share = get_object_or_404(FileShare, token=token, is_active=True)
    is_owner = share.owner == request.user
    if not is_owner:
        collaborators = share.collaborators.all()
        if collaborators.exists():
            allowed_emails = collaborators.values_list("email", flat=True)
            if request.user.email not in allowed_emails:
                return Response({"error": "You don't have permission to access this file."}, status=403)
    return Response({
        "file_id": share.file.id,
        "file_name": share.file.name,
        "file_url": share.file.file.url,
        "file_size": share.file.size,
        "permission": share.link_permission,
    })


# ── Folder share endpoints ─────────────────────────────────────────────────────

@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def folder_share_view(request, folder_id):
    folder_obj = get_object_or_404(FolderModel, id=folder_id, user=request.user, is_deleted=False)

    if request.method == "GET":
        share = FolderShare.objects.filter(folder=folder_obj, owner=request.user).first()
        if not share:
            return Response({"detail": "No share created yet."}, status=status.HTTP_404_NOT_FOUND)
        return Response(FolderShareSerializer(share, context={"request": request}).data)

    if request.method == "POST":
        link_permission = request.data.get("link_permission", "read")
        if link_permission not in ("read", "read_upload"):
            return Response({"detail": "Invalid permission."}, status=status.HTTP_400_BAD_REQUEST)
        share, created = FolderShare.objects.get_or_create(
            folder=folder_obj, owner=request.user,
            defaults={"link_permission": link_permission, "is_active": True},
        )
        if not created:
            share.link_permission = link_permission
            share.is_active = True
            share.save(update_fields=["link_permission", "is_active", "updated_at"])
        serializer = FolderShareSerializer(share, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    if request.method == "DELETE":
        share = get_object_or_404(FolderShare, folder=folder_obj, owner=request.user)
        share.is_active = False
        share.save(update_fields=["is_active", "updated_at"])
        return Response({"detail": "Share link revoked."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_folder_collaborator(request, folder_id):
    folder_obj = get_object_or_404(FolderModel, id=folder_id, user=request.user, is_deleted=False)
    share = get_object_or_404(FolderShare, folder=folder_obj, owner=request.user)
    email = request.data.get("email", "").strip().lower()
    permission = request.data.get("permission", "read")
    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    if permission not in ("read", "read_upload"):
        return Response({"detail": "Invalid permission."}, status=status.HTTP_400_BAD_REQUEST)
    collab, created = FolderShareCollaborator.objects.get_or_create(
        share=share, email=email, defaults={"permission": permission},
    )
    if not created:
        collab.permission = permission
        collab.save(update_fields=["permission"])
    return Response(FolderShareCollaboratorSerializer(collab).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_folder_collaborator(request, folder_id, collab_id):
    folder_obj = get_object_or_404(FolderModel, id=folder_id, user=request.user, is_deleted=False)
    share = get_object_or_404(FolderShare, folder=folder_obj, owner=request.user)
    collab = get_object_or_404(FolderShareCollaborator, id=collab_id, share=share)
    collab.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shared_folder_view(request, token):
    share = get_object_or_404(FolderShare, token=token, is_active=True)
    is_owner = share.owner == request.user
    if not is_owner:
        collaborators = share.collaborators.all()
        if collaborators.exists():
            allowed_emails = collaborators.values_list("email", flat=True)
            if request.user.email not in allowed_emails:
                return Response({"error": "You don't have permission to access this folder."}, status=403)
    files = share.folder.files.filter(is_deleted=False)
    return Response({
        "folder_id": share.folder.id,
        "folder_name": share.folder.name,
        "permission": share.link_permission,
        "files": [{
            "id": f.id,
            "name": f.name,
            "size": f.size,
            "uploaded_at": f.uploaded_at,
            "url": f.file.url,
        } for f in files],
    })
