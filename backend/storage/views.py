import uuid
import logging
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.shortcuts import redirect
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import File
from sharing.models import FileShare
from notifications.utils import create_system_notification

logger = logging.getLogger(__name__)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

    # 1. Save file to the database
    file_obj = File.objects.create(
        user=request.user,
        name=uploaded_file.name,
        file=uploaded_file,
        size=uploaded_file.size
    )

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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):
    # request.user comes from the JWT token — no user_id param needed
    files = File.objects.filter(user=request.user, is_deleted=False)
    data = [{
        "id": f.id,
        "name": f.name,
        "size": f.size,
        "uploaded_at": f.uploaded_at,
        "url": f.file.url,
    } for f in files]
    return Response(data)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def move_to_trash(request, id):
    try:
        file = File.objects.get(id=id, user=request.user)

        file.is_deleted = True
        file.deleted_at = timezone.now()  # ✅ mark time
        file.save()

        return Response({"message": "Moved to trash"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_trash(request):
    files = File.objects.filter(user=request.user, is_deleted=True)

    data = []
    for f in files:
        data.append({
            "id": f.id,
            "name": f.name,
            "size": f.size,
            "uploaded_at": f.uploaded_at,
            "deleted_at": f.deleted_at,  # ✅ send this
            "url": f.file.url
        })

    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def restore_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user, is_deleted=True)

        file.is_deleted = False
        file.deleted_at = None
        file.save()

        return Response({"message": "File restored successfully"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def permanent_delete_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user, is_deleted=True)
        file_name = file.name
        file.file.delete()  # removes from Digital Ocean Spaces
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
        share = FileShare.objects.get(token=token)

        if timezone.now() > share.expiry:
            return Response({"error": "This link has expired"}, status=403)

        return redirect(share.file.file.url)

    except FileShare.DoesNotExist:
        return Response({"error": "Invalid link"}, status=404)
