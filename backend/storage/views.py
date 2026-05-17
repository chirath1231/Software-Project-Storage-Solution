import uuid
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import redirect
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.db.models import Sum

from .models import File, ShareLink
from notifications.utils import create_system_notification

logger = logging.getLogger(__name__)

# ---------------- UPLOAD FILE ----------------
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

    # 2. Trigger Upload Success Notification (Added type='INFO')
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
    warning_threshold = storage_limit * 0.90 # 90%

    if total_used >= warning_threshold:
        create_system_notification(
            user=request.user,
            title="⚠️ Storage Warning",
            message="You have used over 90% of your total storage capacity. Please consider upgrading your plan.",
            notification_type='WARNING'
        )

    # 4. Process share link data
    expiry_str = request.data.get("expiry_date")
    if not expiry_str:
        return Response({"error": "Expiry date required"}, status=400)

    expiry_date = parse_datetime(expiry_str)
    if not expiry_date:
        return Response({"error": "Invalid expiry date format"}, status=400)

    # Create initial share link required by view
    share = ShareLink.objects.create(
        file=file_obj,
        token=uuid.uuid4(),
        expiry=expiry_date
    )

    shareable_link = request.build_absolute_uri(f"/api/share/{share.token}/")

    return Response({
        "message": "Uploaded successfully",
        "url": shareable_link,
        "token": str(share.token),
        "expiry": share.expiry
    })


# ---------------- LIST FILES ----------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):
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
            "share_links": share_links
        })

    return Response(data)


# ---------------- DELETE FILE ----------------
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user)
        file_name = file.name 
        file.file.delete()
        file.delete()

        # Trigger Delete Notification (Added type='WARNING')
        create_system_notification(
            user=request.user,
            title="File Deleted 🗑️",
            message=f"'{file_name}' has been permanently removed from your storage.",
            notification_type='WARNING'
        )

        return Response({"message": "Deleted"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


# ---------------- GENERATE SHARE LINK ----------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_share_link(request, file_id):
    expiry_str = request.data.get("expiry_date")
    if not expiry_str:
        return Response({"error": "Expiry date required"}, status=400)

    expiry_date = parse_datetime(expiry_str)
    if not expiry_date:
        return Response({"error": "Invalid expiry date"}, status=400)

    try:
        file = File.objects.get(id=file_id, user=request.user)
    except File.DoesNotExist:
        return Response({"error": "File not found"}, status=404)

    share = ShareLink.objects.create(
        file=file,
        token=uuid.uuid4(),
        expiry=expiry_date
    )

    # Trigger Share Link Notification (Added type='INFO')
    create_system_notification(
        user=request.user,
        title="Secure Link Generated 🔗",
        message=f"A new sharing link was created for '{file.name}'.",
        notification_type='INFO'
    )

    shareable_link = request.build_absolute_uri(f"/api/share/{share.token}/")
    return Response({"url": shareable_link, "expiry": share.expiry})


# ---------------- ACCESS SHARE LINK ----------------
@api_view(["GET"])
def access_shared_file(request, token):
    try:
        share = ShareLink.objects.get(token=token)

        if timezone.now() > share.expiry:
            return Response({"error": "This link has expired"}, status=403)

        return redirect(share.file.file.url)

    except ShareLink.DoesNotExist:
        return Response({"error": "Invalid link"}, status=404)