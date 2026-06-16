# views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import FileShare, FileShareCollaborator
from .serializers import FileShareSerializer, FileShareCollaboratorSerializer

# ── Adjust this import to match your File model location ──────────────────────
from storage.models import File as FileModel

# ---------------------------------------------------------------------------
# GET /api/files/<file_id>/share/        → fetch existing share (or 404)
# POST /api/files/<file_id>/share/       → create/update share for a file
# DELETE /api/files/<file_id>/share/     → deactivate (revoke) share link
# ---------------------------------------------------------------------------

@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def file_share_view(request, file_id):
    file_obj = get_object_or_404(FileModel, id=file_id, user=request.user)

    # ── GET: return current share config ────────────────────────────────────
    if request.method == "GET":
        share = FileShare.objects.filter(file=file_obj, owner=request.user).first()
        if not share:
            return Response({"detail": "No share created yet."}, status=status.HTTP_404_NOT_FOUND)
        serializer = FileShareSerializer(share, context={"request": request})
        return Response(serializer.data)

    # ── POST: create or update share ─────────────────────────────────────────
    if request.method == "POST":
        link_permission = request.data.get("link_permission", "read")
        if link_permission not in ("read", "read_upload"):
            return Response({"detail": "Invalid permission."}, status=status.HTTP_400_BAD_REQUEST)

        share, created = FileShare.objects.get_or_create(
            file=file_obj,
            owner=request.user,
            defaults={"link_permission": link_permission, "is_active": True},
        )
        if not created:
            share.link_permission = link_permission
            share.is_active = True
            share.save(update_fields=["link_permission", "is_active", "updated_at"])

        serializer = FileShareSerializer(share, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    # ── DELETE: revoke link ──────────────────────────────────────────────────
    if request.method == "DELETE":
        share = get_object_or_404(FileShare, file=file_obj, owner=request.user)
        share.is_active = False
        share.save(update_fields=["is_active", "updated_at"])
        return Response({"detail": "Share link revoked."}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# POST /api/files/<file_id>/share/collaborators/        → add collaborator
# DELETE /api/files/<file_id>/share/collaborators/<id>/ → remove collaborator
# ---------------------------------------------------------------------------

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
        share=share,
        email=email,
        defaults={"permission": permission},
    )
    if not created:
        collab.permission = permission
        collab.save(update_fields=["permission"])

    serializer = FileShareCollaboratorSerializer(collab)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_collaborator(request, file_id, collab_id):
    file_obj = get_object_or_404(FileModel, id=file_id, user=request.user)
    share = get_object_or_404(FileShare, file=file_obj, owner=request.user)
    collab = get_object_or_404(FileShareCollaborator, id=collab_id, share=share)
    collab.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# GET /api/shared/<token>/   → public endpoint — validate token & return file info
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([AllowAny])
def shared_file_view(request, token):
    share = get_object_or_404(FileShare, token=token, is_active=True)

    # If collaborators exist, check if the logged-in user's email is in the list
    collaborators = share.collaborators.all()
    
    if collaborators.exists():
        # Get email from JWT token if logged in
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {"error": "You must be logged in to access this file."},
                status=401
            )
        # Check if their email is in the collaborators list
        allowed_emails = collaborators.values_list("email", flat=True)
        if user.email not in allowed_emails:
            return Response(
                {"error": "You don't have permission to access this file."},
                status=403
            )

    return Response({
        "file_id": share.file.id,
        "file_name": share.file.name,
        "file_url": share.file.file.url,
        "file_size": share.file.size,
        "permission": share.link_permission,
    })

# ============================================================================
# urls.py  (add to your files/urls.py or main urls.py)
# ============================================================================
#
# from django.urls import path
# from . import views
#
# urlpatterns = [
#     path("api/files/<int:file_id>/share/", views.file_share_view, name="file-share"),
#     path("api/files/<int:file_id>/share/collaborators/", views.add_collaborator, name="file-share-add-collab"),
#     path("api/files/<int:file_id>/share/collaborators/<int:collab_id>/", views.remove_collaborator, name="file-share-remove-collab"),
#     path("api/shared/<uuid:token>/", views.shared_file_view, name="shared-file"),
# ]