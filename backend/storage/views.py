from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import File


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
    return Response({"message": "Uploaded successfully", "url": file_obj.file.url})


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
        file.deleted_at = None  # ✅ clear
        file.save()

        return Response({"message": "Restored"})
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
        return Response({"error": "Not found"}, status=404)