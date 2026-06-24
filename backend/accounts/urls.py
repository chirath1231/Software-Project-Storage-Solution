from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, 
    LoginAPIView, 
    GoogleLoginAPIView, 
   
)

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path('login/', LoginAPIView.as_view(), name="login"),
<<<<<<< HEAD
    path("google/", GoogleLoginAPIView.as_view()),
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    # path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    # path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
]
=======
    path("google/", GoogleLoginAPIView.as_view(), name="google_login"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    
]
>>>>>>> Sahas
