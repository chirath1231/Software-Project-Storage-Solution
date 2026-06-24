from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Notification
from .serializers import NotificationSerializer
import traceback

class NotificationPagination(PageNumberPagination):
    page_size = 10 # Restrict the output to 10 alerts per page

    def get_paginated_response(self, data):
        # Calculate the TOTAL unread count so the Navbar Bell stays perfectly accurate!
        unread_total = self.request.user.notifications.filter(is_read=False).count()
        
        return Response({
            'unread_count': unread_total,
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination # Apply our 10-item limit

    def get_queryset(self):
        try:
            # Start with all of the user's notifications
            queryset = Notification.objects.filter(user=self.request.user)
            
            # Look for a '?sort=' parameter in the URL from React
            sort_by = self.request.query_params.get('sort', 'newest')
            
            # Apply the exact sorting rule requested by the frontend dropdown
            if sort_by == 'unread':
                return queryset.filter(is_read=False).order_by('-created_at')
            elif sort_by == 'oldest':
                return queryset.order_by('created_at')
            else: 
                # Default to Newest
                return queryset.order_by('-created_at')
        except Exception as e:
            print("ERROR IN GET_QUERYSET:")
            print(traceback.format_exc())
            return Notification.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            print("ERROR IN NOTIFICATIONS LIST VIEW:")
            print(traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"status": "success"})
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print("ERROR IN NOTIFICATION READ VIEW:")
            print(traceback.format_exc())
            return Response(
                {"error": str(e), "detail": traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )