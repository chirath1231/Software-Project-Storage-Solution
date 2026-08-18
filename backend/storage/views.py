from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import File, Folder


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

    folder = None
    folder_id = request.data.get("folder_id")
    if folder_id:
        try:
            folder = Folder.objects.get(id=folder_id, user=request.user, is_deleted=False)
        except Folder.DoesNotExist:
            return Response({"error": "Folder not found"}, status=404)

    file_obj = File.objects.create(
        user=request.user,
        name=uploaded_file.name,
        file=uploaded_file,
        size=uploaded_file.size,
        folder=folder,
    )
    return Response({"message": "Uploaded successfully", "url": file_obj.file.url})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):
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
def restore_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user, is_deleted=True)
        file.is_deleted = False
        file.deleted_at = None
        file.save()
        return Response({"message": "Restored"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def permanent_delete_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user, is_deleted=True)
        file.file.delete()
        file.delete()
        return Response({"message": "Permanently deleted"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


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
