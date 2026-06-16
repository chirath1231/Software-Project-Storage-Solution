# backend/storage/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import redirect
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from .models import File, ShareLink
import uuid


# ---------------- UPLOAD FILE ----------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

    # Save file only — no share link created here
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

    return Response({
        "message": "Uploaded successfully",
        "id": file_obj.id,
        "name": file_obj.name,
        "size": file_obj.size,
        "uploaded_at": file_obj.uploaded_at,
    }, status=201)


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
            "url": request.build_absolute_uri(f.file.url),
            "share_links": share_links,
        })
    return Response(data)


# ---------------- DELETE FILE ----------------
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_file(request, id):
    try:
        file = File.objects.get(id=id, user=request.user)
        file.file.delete()
        file.delete()
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
        return Response({"error": "Invalid expiry date format"}, status=400)

    try:
        file = File.objects.get(id=file_id, user=request.user)
    except File.DoesNotExist:
        return Response({"error": "File not found"}, status=404)

    share = ShareLink.objects.create(
        file=file,
        token=uuid.uuid4(),
        expiry=expiry_date
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