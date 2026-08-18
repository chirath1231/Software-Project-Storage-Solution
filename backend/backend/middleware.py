from django.conf import settings


class MediaFrameOptionsMiddleware:
    """Allow /media/ files (e.g. PDFs) to be embedded in an <iframe> for preview.

    Django's XFrameOptionsMiddleware sets X-Frame-Options: DENY on every
    response by default, which blocks the frontend's file-preview iframe
    even though it's just displaying the user's own uploaded file.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith(settings.MEDIA_URL):
            response.headers.pop("X-Frame-Options", None)
        return response
