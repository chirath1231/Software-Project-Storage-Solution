from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
<<<<<<< HEAD
from django.shortcuts import redirect
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.db.models import Sum # --- NEW: Needed to calculate total storage ---
from .models import File, ShareLink
import uuid

# --- 1. IMPORT OUR GLOBAL NOTIFICATION HELPER ---
from accounts.views import create_system_notification 

# ---------------- UPLOAD FILE ----------------
=======
from .models import File


>>>>>>> 033a4415673509957acf845880283bc658bc5224
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

    file_obj = File.objects.create(
        user=request.user,
        name=uploaded_file.name,
        file=uploaded_file,
        size=uploaded_file.size
    )
<<<<<<< HEAD

    # --- NEW: Trigger Upload Success Notification ---
    create_system_notification(
        user=request.user,
        title="Upload Complete",
        message=f"'{file_obj.name}' was successfully uploaded and securely stored."
    )

    # --- NEW: Storage Capacity Warning Logic ---
    # Calculate total bytes used by the user
    total_used = File.objects.filter(user=request.user).aggregate(Sum('size'))['size__sum'] or 0
    
    # Let's assume a default 15GB limit for now (15 * 1024 * 1024 * 1024 bytes)
    # If you have a Subscription model, you can replace this hardcoded limit later!
    storage_limit = 15 * 1024 * 1024 * 1024 
    warning_threshold = storage_limit * 0.90 # 90%

    if total_used >= warning_threshold:
        create_system_notification(
            user=request.user,
            title="⚠️ Storage Warning",
            message="You have used over 90% of your total storage capacity. Please consider upgrading your plan."
        )
    # -------------------------------------------

    # Get expiry date from frontend (ISO format: YYYY-MM-DDTHH:MM)
    expiry_str = request.data.get("expiry_date")
    if not expiry_str:
        return Response({"error": "Expiry date required"}, status=400)

    expiry_date = parse_datetime(expiry_str)
    if not expiry_date:
        return Response({"error": "Invalid expiry date format"}, status=400)

    # Create share link
    share = ShareLink.objects.create(
        file=file_obj,
        token=uuid.uuid4(),
        expiry=expiry_date
    )

    # Build the shareable URL
    shareable_link = request.build_absolute_uri(f"/api/share/{share.token}/")

    return Response({
        "message": "Uploaded successfully",
        "url": shareable_link,
        "token": str(share.token),
        "expiry": share.expiry
    })
=======
    return Response({"message": "Uploaded successfully", "url": file_obj.file.url})
>>>>>>> 033a4415673509957acf845880283bc658bc5224


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
<<<<<<< HEAD
        file = File.objects.get(id=id, user=request.user)
        file_name = file.name # Save name before deleting
        file.file.delete()
        file.delete()

        # --- NEW: Trigger Delete Notification ---
        create_system_notification(
            user=request.user,
            title="File Deleted",
            message=f"'{file_name}' has been permanently removed from your storage."
        )

        return Response({"message": "Deleted"})
=======
        file = File.objects.get(id=id, user=request.user, is_deleted=True)

        file.is_deleted = False
        file.deleted_at = None  # ✅ clear
        file.save()

        return Response({"message": "Restored"})
>>>>>>> 033a4415673509957acf845880283bc658bc5224
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def permanent_delete_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user, is_deleted=True)
        file.file.delete()  # removes from Digital Ocean Spaces
        file.delete()
        return Response({"message": "Permanently deleted"})
    except File.DoesNotExist:
<<<<<<< HEAD
        return Response({"error": "File not found"}, status=404)

    share = ShareLink.objects.create(
        file=file,
        token=uuid.uuid4(),
        expiry=expiry_date
    )

    # --- NEW: Trigger Share Link Notification ---
    create_system_notification(
        user=request.user,
        title="Secure Link Generated",
        message=f"A new sharing link was created for '{file.name}'."
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
=======
        return Response({"error": "Not found"}, status=404)
>>>>>>> 033a4415673509957acf845880283bc658bc5224
