from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import File

@api_view(["POST"])
@permission_classes([IsAuthenticated])  # require login
def upload_file(request):
    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

    file_obj = File.objects.create(
        user=request.user,  # assign logged-in user
        name=uploaded_file.name,
        file=uploaded_file,
        size=uploaded_file.size
    )

    return Response({
        "message": "Uploaded successfully",
        "url": file_obj.file.url
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])  # only return files of this user
def list_files(request):
    files = File.objects.filter(user=request.user)  # filter by user

    data = []
    for f in files:
        data.append({
            "id": f.id,
            "name": f.name,
            "size": f.size,
            "uploaded_at": f.uploaded_at,
            "url": f.file.url
        })

    return Response(data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])  # only allow deletion by owner
def delete_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user)  # ensure user owns it
        file.file.delete()   # delete from storage
        file.delete()
        return Response({"message": "Deleted"})
    except File.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
