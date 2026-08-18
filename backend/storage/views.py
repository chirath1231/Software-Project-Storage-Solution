import uuid
import logging
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.shortcuts import redirect
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

<<<<<<< HEAD

# ---------------- UPLOAD FILE ----------------
=======
from .models import File
from sharing.models import FileShare
from notifications.utils import create_system_notification
from .models import File, Folder

logger = logging.getLogger(__name__)

>>>>>>> origin/main
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

<<<<<<< HEAD
    # Save file only — no share link created here
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)
=======
    # 1. Save file to the database
    folder = None
    folder_id = request.data.get("folder_id")
    if folder_id:
        try:
            folder = Folder.objects.get(id=folder_id, user=request.user, is_deleted=False)
        except Folder.DoesNotExist:
            return Response({"error": "Folder not found"}, status=404)
>>>>>>> origin/main

    file_obj = File.objects.create(
        user=request.user,
        name=uploaded_file.name,
        file=uploaded_file,
        size=uploaded_file.size,
        folder=folder,
    )

<<<<<<< HEAD
    return Response({
        "message": "Uploaded successfully",
        "id": file_obj.id,
        "name": file_obj.name,
        "size": file_obj.size,
        "uploaded_at": file_obj.uploaded_at,
    }, status=201)
=======
    # 2. Trigger Upload Success Notification
    create_system_notification(
        user=request.user,
        title="Upload Complete 🚀",
        message=f"'{file_obj.name}' was successfully uploaded and securely stored.",
        notification_type='INFO'
    )

    # 3. Storage Capacity Warning Logic
    total_used = File.objects.filter(user=request.user).aggregate(Sum('size'))['size__sum'] or 0
    
    # Default 15GB limit (15 * 1024 * 1024 * 1024 bytes)
    storage_limit = 15 * 1024 * 1024 * 1024 
    warning_threshold = storage_limit * 0.90  # 90%

    if total_used >= warning_threshold:
        create_system_notification(
            user=request.user,
            title="⚠️ Storage Warning",
            message="You have used over 90% of your total storage capacity. Please consider upgrading your plan.",
            notification_type='WARNING'
        )

    # 4. Create share link if expiry_date is provided
    expiry_str = request.data.get("expiry_date")
    if expiry_str:
        expiry_date = parse_datetime(expiry_str)
        if expiry_date:
            share = FileShare.objects.create(
                file=file_obj,
                token=uuid.uuid4(),
                expiry=expiry_date
            )

            # Trigger Share Link Notification
            create_system_notification(
                user=request.user,
                title="Secure Link Generated 🔗",
                message=f"A new sharing link was created for '{file_obj.name}'.",
                notification_type='INFO'
            )

            shareable_link = request.build_absolute_uri(f"/api/share/{share.token}/")
            return Response({
                "message": "Uploaded successfully",
                "url": shareable_link,
                "token": str(share.token),
                "expiry": share.expiry
            })

    return Response({
        "message": "Uploaded successfully",
        "url": file_obj.file.url
    })
>>>>>>> origin/main


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):
<<<<<<< HEAD
    files = File.objects.filter(user=request.user)
    data = []
    for f in files:
        shares = ShareLink.objects.filter(file=f)
        share_links = [
            request.build_absolute_uri(f"/api/share/{s.token}/") for s in shares
        ]
        data.append({
            "id": f.id,
            "name": f.name,
            "size": f.size,
            "uploaded_at": f.uploaded_at,
            "url": request.build_absolute_uri(f.file.url),
            "share_links": share_links,
        })
=======
    folder_id = request.query_params.get("folder")
    all_files = request.query_params.get("all")
    if all_files:
        files = File.objects.filter(user=request.user, is_deleted=False)
    elif folder_id:
        files = File.objects.filter(user=request.user, is_deleted=False, folder_id=folder_id)
    else:
        files = File.objects.filter(user=request.user, is_deleted=False, folder__isnull=True)

    data = [{
        "id": f.id,
        "name": f.name,
        "size": f.size,
        "uploaded_at": f.uploaded_at,
        "url": f.file.url,
        "folder_id": f.folder_id,
    } for f in files]
>>>>>>> origin/main
    return Response(data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def move_to_trash(request, id):
    try:
        file = File.objects.get(id=id, user=request.user)
        file.is_deleted = True
        file.deleted_at = timezone.now()
        file.save()
        return Response({"message": "Moved to trash"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_trash(request):
    files = File.objects.filter(user=request.user, is_deleted=True)
    data = [{
        "id": f.id,
        "name": f.name,
        "size": f.size,
        "uploaded_at": f.uploaded_at,
        "deleted_at": f.deleted_at,
        "url": f.file.url,
    } for f in files]
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
<<<<<<< HEAD
def generate_share_link(request, file_id):
    expiry_str = request.data.get("expiry_date")
    if not expiry_str:
        return Response({"error": "Expiry date required"}, status=400)

    expiry_date = parse_datetime(expiry_str)
    if not expiry_date:
        return Response({"error": "Invalid expiry date format"}, status=400)

=======
def restore_file(request, id):
>>>>>>> origin/main
    try:
        file = File.objects.get(id=id, user=request.user, is_deleted=True)
        file.is_deleted = False
        file.deleted_at = None
        file.save()

        return Response({"message": "File restored successfully"})
        return Response({"message": "Restored"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def permanent_delete_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user, is_deleted=True)
        file_name = file.name
        file.file.delete()  # removes from Digital Ocean Spaces
        file.file.delete()
        file.delete()

        # Trigger Delete Notification
        create_system_notification(
            user=request.user,
            title="File Deleted 🗑️",
            message=f"'{file_name}' has been permanently removed from your storage.",
            notification_type='WARNING'
        )

        return Response({"message": "Permanently deleted"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


# ---------------- ACCESS SHARE LINK ----------------
@api_view(["GET"])
def access_shared_file(request, token):
    try:
<<<<<<< HEAD
        share = ShareLink.objects.get(token=token)
=======
        share = FileShare.objects.get(token=token)

>>>>>>> origin/main
        if timezone.now() > share.expiry:
            return Response({"error": "This link has expired"}, status=403)
        return redirect(share.file.file.url)
<<<<<<< HEAD
    except ShareLink.DoesNotExist:
        return Response({"error": "Invalid link"}, status=404)
=======

    except FileShare.DoesNotExist:
        return Response({"error": "Invalid link"}, status=404)
# ── Folder endpoints ──────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def folder_list(request):
    if request.method == "GET":
        parent_id = request.query_params.get("parent")
        qs = Folder.objects.filter(user=request.user, is_deleted=False)
        qs = qs.filter(parent_id=parent_id) if parent_id else qs.filter(parent__isnull=True)
        data = [{"id": f.id, "name": f.name, "created_at": f.created_at, "parent": f.parent_id} for f in qs]
        return Response(data)

    name = request.data.get("name", "").strip()
    if not name:
        return Response({"error": "Name is required."}, status=400)

    parent = None
    parent_id = request.data.get("parent")
    if parent_id:
        try:
            parent = Folder.objects.get(id=parent_id, user=request.user, is_deleted=False)
        except Folder.DoesNotExist:
            return Response({"error": "Parent folder not found."}, status=404)

    if Folder.objects.filter(user=request.user, name=name, parent=parent, is_deleted=False).exists():
        return Response({"error": "A folder with this name already exists here."}, status=400)

    folder = Folder.objects.create(user=request.user, name=name, parent=parent)
    return Response(
        {"id": folder.id, "name": folder.name, "created_at": folder.created_at, "parent": folder.parent_id},
        status=201,
    )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def folder_detail(request, id):
    try:
        folder = Folder.objects.get(id=id, user=request.user, is_deleted=False)
    except Folder.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    if request.method == "PATCH":
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"error": "Name is required."}, status=400)
        folder.name = name
        folder.save()
        return Response({"id": folder.id, "name": folder.name})

    folder.is_deleted = True
    folder.deleted_at = timezone.now()
    folder.save()
    return Response({"message": "Folder deleted"})
>>>>>>> origin/main
