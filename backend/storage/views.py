import uuid
import logging

from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.shortcuts import redirect
from django.db.models import Sum

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import File, Folder
from sharing.models import FileShare
from notifications.utils import create_system_notification
from .glacier import upload_to_glacier


logger = logging.getLogger(__name__)


# =========================================================
# UPLOAD FILE
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response(
            {"error": "No file uploaded"},
            status=400
        )

    # -----------------------------------------------------
    # Folder
    # -----------------------------------------------------

    folder = None
    folder_id = request.data.get("folder_id")

    if folder_id:
        try:
            folder = Folder.objects.get(
                id=folder_id,
                user=request.user,
                is_deleted=False
            )
        except Folder.DoesNotExist:
            return Response(
                {"error": "Folder not found"},
                status=404
            )

    # -----------------------------------------------------
    # Create file
    # -----------------------------------------------------

    file_obj = File.objects.create(
        user=request.user,
        name=uploaded_file.name,
        file=uploaded_file,
        size=uploaded_file.size,
        folder=folder,
    )

    # -----------------------------------------------------
    # Upload notification
    # -----------------------------------------------------

    create_system_notification(
        user=request.user,
        title="Upload Complete 🚀",
        message=(
            f"'{file_obj.name}' was successfully "
            f"uploaded and securely stored."
        ),
        notification_type="INFO",
    )

    # -----------------------------------------------------
    # Storage capacity warning
    # -----------------------------------------------------

    total_used = (
        File.objects
        .filter(
            user=request.user,
            is_deleted=False
        )
        .aggregate(Sum("size"))["size__sum"]
        or 0
    )

    # Default 15 GB
    storage_limit = 15 * 1024 * 1024 * 1024

    warning_threshold = storage_limit * 0.90

    if total_used >= warning_threshold:
        create_system_notification(
            user=request.user,
            title="⚠️ Storage Warning",
            message=(
                "You have used over 90% of your total "
                "storage capacity. Please consider "
                "upgrading your plan."
            ),
            notification_type="WARNING",
        )

    # -----------------------------------------------------
    # Optional share link during upload
    # -----------------------------------------------------

    expiry_str = request.data.get("expiry_date")

    if expiry_str:
        expiry_date = parse_datetime(expiry_str)

        if not expiry_date:
            return Response(
                {
                    "error": "Invalid expiry date format",
                    "id": file_obj.id,
                },
                status=400,
            )

        share = FileShare.objects.create(
            file=file_obj,
            token=uuid.uuid4(),
            expiry=expiry_date,
        )

        create_system_notification(
            user=request.user,
            title="Secure Link Generated 🔗",
            message=(
                f"A new sharing link was created "
                f"for '{file_obj.name}'."
            ),
            notification_type="INFO",
        )

        shareable_link = request.build_absolute_uri(
            f"/api/share/{share.token}/"
        )

        return Response(
            {
                "message": "Uploaded successfully",
                "id": file_obj.id,
                "name": file_obj.name,
                "size": file_obj.size,
                "uploaded_at": file_obj.uploaded_at,
                "url": request.build_absolute_uri(
                    file_obj.file.url
                ),
                "share_url": shareable_link,
                "token": str(share.token),
                "expiry": share.expiry,
                "folder_id": file_obj.folder_id,
            },
            status=201,
        )

    return Response(
        {
            "message": "Uploaded successfully",
            "id": file_obj.id,
            "name": file_obj.name,
            "size": file_obj.size,
            "uploaded_at": file_obj.uploaded_at,
            "url": request.build_absolute_uri(
                file_obj.file.url
            ),
            "folder_id": file_obj.folder_id,
        },
        status=201,
    )


# =========================================================
# LIST FILES
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):

    folder_id = request.query_params.get("folder")
    all_files = request.query_params.get("all")

    if all_files:

        files = File.objects.filter(
            user=request.user,
            is_deleted=False
        )

    elif folder_id:

        files = File.objects.filter(
            user=request.user,
            is_deleted=False,
            folder_id=folder_id
        )

    else:

        files = File.objects.filter(
            user=request.user,
            is_deleted=False,
            folder__isnull=True
        )

    data = []

    for file_obj in files:

        share_links = []

        # Get existing FileShare links
        try:
            shares = FileShare.objects.filter(
                file=file_obj
            )

            for share in shares:
                share_links.append(
                    request.build_absolute_uri(
                        f"/api/share/{share.token}/"
                    )
                )

        except Exception:
            pass

        data.append(
            {
                "id": file_obj.id,
                "name": file_obj.name,
                "size": file_obj.size,
                "uploaded_at": file_obj.uploaded_at,
                "url": request.build_absolute_uri(
                    file_obj.file.url
                ),
                "folder_id": file_obj.folder_id,
                "share_links": share_links,
            }
        )

    return Response(data)


# =========================================================
# MOVE FILE TO TRASH
# =========================================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def move_to_trash(request, id):

    try:

        file_obj = File.objects.get(
            id=id,
            user=request.user,
            is_deleted=False
        )

        file_obj.is_deleted = True
        file_obj.deleted_at = timezone.now()

        file_obj.save(
            update_fields=[
                "is_deleted",
                "deleted_at"
            ]
        )

        return Response(
            {"message": "Moved to trash"}
        )

    except File.DoesNotExist:

        return Response(
            {"error": "File not found"},
            status=404
        )


# =========================================================
# LIST TRASH
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_trash(request):

    files = File.objects.filter(
        user=request.user,
        is_deleted=True
    )

    data = [
        {
            "id": file_obj.id,
            "name": file_obj.name,
            "size": file_obj.size,
            "uploaded_at": file_obj.uploaded_at,
            "deleted_at": file_obj.deleted_at,
            "url": request.build_absolute_uri(
                file_obj.file.url
            ),
            "folder_id": file_obj.folder_id,
        }
        for file_obj in files
    ]

    return Response(data)


# =========================================================
# RESTORE FILE
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def restore_file(request, id):

    try:

        file_obj = File.objects.get(
            id=id,
            user=request.user,
            is_deleted=True
        )

        file_obj.is_deleted = False
        file_obj.deleted_at = None

        file_obj.save(
            update_fields=[
                "is_deleted",
                "deleted_at"
            ]
        )

        return Response(
            {"message": "File restored successfully"}
        )

    except File.DoesNotExist:

        return Response(
            {"error": "File not found"},
            status=404
        )


# =========================================================
# GENERATE SHARE LINK
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_share_link(request, file_id):

    expiry_str = request.data.get("expiry_date")

    if not expiry_str:
        return Response(
            {"error": "Expiry date required"},
            status=400
        )

    expiry_date = parse_datetime(expiry_str)

    if not expiry_date:
        return Response(
            {"error": "Invalid expiry date format"},
            status=400
        )

    try:

        file_obj = File.objects.get(
            id=file_id,
            user=request.user,
            is_deleted=False
        )

    except File.DoesNotExist:

        return Response(
            {"error": "File not found"},
            status=404
        )

    share = FileShare.objects.create(
        file=file_obj,
        token=uuid.uuid4(),
        expiry=expiry_date,
    )

    create_system_notification(
        user=request.user,
        title="Secure Link Generated 🔗",
        message=(
            f"A new sharing link was created "
            f"for '{file_obj.name}'."
        ),
        notification_type="INFO",
    )

    shareable_link = request.build_absolute_uri(
        f"/api/share/{share.token}/"
    )

    return Response(
        {
            "message": "Share link generated",
            "url": shareable_link,
            "token": str(share.token),
            "expiry": share.expiry,
        },
        status=201,
    )


# =========================================================
# ACCESS SHARED FILE
# =========================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def access_shared_file(request, token):

    try:

        share = FileShare.objects.get(
            token=token
        )

    except FileShare.DoesNotExist:

        return Response(
            {"error": "Invalid link"},
            status=404
        )

    if timezone.now() > share.expiry:

        return Response(
            {"error": "This link has expired"},
            status=403
        )

    return redirect(
        share.file.file.url
    )


# =========================================================
# PERMANENT DELETE / ARCHIVE TO GLACIER
# =========================================================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def permanent_delete_file(request, id):

    try:

        file_obj = File.objects.get(
            id=id,
            user=request.user,
            is_deleted=True
        )

        file_name = file_obj.name

        # Upload to AWS Glacier
        upload_to_glacier(file_obj)

        # Remove file from DigitalOcean Spaces
        file_obj.file.delete(save=False)

        # Remove database record
        file_obj.delete()

        create_system_notification(
            user=request.user,
            title="File Archived 📦",
            message=(
                f"'{file_name}' was archived to AWS "
                f"Glacier and removed from active storage."
            ),
            notification_type="INFO",
        )

        return Response(
            {"message": "Archived successfully"}
        )

    except File.DoesNotExist:

        return Response(
            {"error": "File not found"},
            status=404
        )

    except Exception as e:

        logger.exception(
            "Permanent file deletion failed"
        )

        return Response(
            {"error": str(e)},
            status=500
        )


# =========================================================
# FOLDERS - LIST / CREATE
# =========================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def folder_list(request):

    # -----------------------------------------------------
    # GET
    # -----------------------------------------------------

    if request.method == "GET":

        parent_id = request.query_params.get(
            "parent"
        )

        folders = Folder.objects.filter(
            user=request.user,
            is_deleted=False
        )

        if parent_id:

            folders = folders.filter(
                parent_id=parent_id
            )

        else:

            folders = folders.filter(
                parent__isnull=True
            )

        data = [
            {
                "id": folder.id,
                "name": folder.name,
                "created_at": folder.created_at,
                "parent": folder.parent_id,
            }
            for folder in folders
        ]

        return Response(data)

    # -----------------------------------------------------
    # POST
    # -----------------------------------------------------

    name = request.data.get(
        "name",
        ""
    ).strip()

    if not name:

        return Response(
            {"error": "Name is required."},
            status=400
        )

    parent = None

    parent_id = request.data.get(
        "parent"
    )

    if parent_id:

        try:

            parent = Folder.objects.get(
                id=parent_id,
                user=request.user,
                is_deleted=False
            )

        except Folder.DoesNotExist:

            return Response(
                {
                    "error":
                    "Parent folder not found."
                },
                status=404
            )

    duplicate_exists = Folder.objects.filter(
        user=request.user,
        name=name,
        parent=parent,
        is_deleted=False
    ).exists()

    if duplicate_exists:

        return Response(
            {
                "error":
                "A folder with this name "
                "already exists here."
            },
            status=400
        )

    folder = Folder.objects.create(
        user=request.user,
        name=name,
        parent=parent
    )

    return Response(
        {
            "id": folder.id,
            "name": folder.name,
            "created_at": folder.created_at,
            "parent": folder.parent_id,
        },
        status=201,
    )


# =========================================================
# FOLDER DETAIL - RENAME / DELETE
# =========================================================

@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def folder_detail(request, id):

    try:

        folder = Folder.objects.get(
            id=id,
            user=request.user,
            is_deleted=False
        )

    except Folder.DoesNotExist:

        return Response(
            {"error": "Folder not found"},
            status=404
        )

    # -----------------------------------------------------
    # RENAME
    # -----------------------------------------------------

    if request.method == "PATCH":

        name = request.data.get(
            "name",
            ""
        ).strip()

        if not name:

            return Response(
                {"error": "Name is required."},
                status=400
            )

        duplicate_exists = Folder.objects.filter(
            user=request.user,
            name=name,
            parent=folder.parent,
            is_deleted=False
        ).exclude(
            id=folder.id
        ).exists()

        if duplicate_exists:

            return Response(
                {
                    "error":
                    "A folder with this name "
                    "already exists here."
                },
                status=400
            )

        folder.name = name

        folder.save(
            update_fields=["name"]
        )

        return Response(
            {
                "id": folder.id,
                "name": folder.name,
            }
        )

    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    folder.is_deleted = True
    folder.deleted_at = timezone.now()

    folder.save(
        update_fields=[
            "is_deleted",
            "deleted_at"
        ]
    )

    return Response(
        {"message": "Folder deleted"}
    )
