import requests # Added for Mailgun
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer, GoogleAuthSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from rest_framework import generics
from .models import Event, Notification
from .serializers import EventSerializer

GOOGLE_CLIENT_ID = "781385776424-n8823en67ojbuq8jnhjude79pq9jl7c5.apps.googleusercontent.com"

# ==========================================
# GLOBAL NOTIFICATION HELPER (NEW!)
# ==========================================
def create_system_notification(user, title, message):
    """
    A globally reusable function to generate system alerts.
    """
    try:
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            is_read=False
        )
    except Exception as e:
        print(f"Failed to create notification: {e}")

# ==========================================
# AUTHENTICATION VIEWS
# ==========================================
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            # --- Trigger Welcome Notification ---
            create_system_notification(
                user=user,
                title="Welcome to CEYNOA!",
                message="Your account has been created successfully. Explore your dashboard to get started."
            )

            return Response({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
            })

        return Response(serializer.errors, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID
            )

            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])

            user, created = User.objects.get_or_create(
                email=email,
                defaults={"username": email}
            )

            if created:
                # --- Trigger Welcome Notification for Google Login ---
                create_system_notification(
                    user=user,
                    title="Welcome to CEYNOA!",
                    message="Your Google account was linked successfully. Explore your dashboard to get started."
                )

            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_new_user": created
            })

        except ValueError:
            return Response(
                {"detail": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST
            )


# ==========================================
# CALENDAR EVENT VIEWS
# ==========================================
class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user).order_by('start_time')

    def perform_create(self, serializer):
        # 1. Save the event to the database
        event = serializer.save(user=self.request.user)

        # 2. Generate a system notification in the Command Center (NEW!)
        create_system_notification(
            user=self.request.user,
            title="Meeting Scheduled",
            message=f"You successfully scheduled '{event.title}' for {event.start_time.strftime('%b %d at %I:%M %p')}."
        )

        # 3. Mailgun Email Automation (RESTORED!)
        attendee_email = self.request.data.get('attendee_email')
        
        if attendee_email:
            # IMPORTANT: Put your real Mailgun Sandbox Domain and API Key here!
            mailgun_domain = "YOUR_MAILGUN_SANDBOX_DOMAIN" 
            mailgun_api_key = "YOUR_MAILGUN_API_KEY"

            subject = f"Meeting Invitation: {event.title} (CEYNOA)"
            body = (
                f"Hello!\n\n"
                f"You have been invited to a meeting by {event.user.username}.\n\n"
                f"📌 Title: {event.title}\n"
                f"🕒 Start: {event.start_time.strftime('%b %d, %Y at %H:%M')}\n"
                f"🔗 Link: {event.meeting_link or 'No link provided'}\n\n"
                f"Description: {event.description}\n\n"
                f"Sent securely via CEYNOA Workspace."
            )

            try:
                requests.post(
                    f"https://api.mailgun.net/v3/{mailgun_domain}/messages",
                    auth=("api", mailgun_api_key),
                    data={"from": f"CEYNOA Scheduler <mailgun@{mailgun_domain}>",
                          "to": [attendee_email],
                          "subject": subject,
                          "text": body}
                )
                print(f"✅ Invite sent successfully to {attendee_email}")
            except Exception as e:
                print(f"❌ Mailgun error: {e}")


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)