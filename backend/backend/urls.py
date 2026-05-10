from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),
    
    # Accounts & Authentication
    path('api/accounts/', include('accounts.urls')),
    
    # 🔔 NEW: Notifications App
    # We mount it here so your React frontend doesn't have to change any API URLs!
    path('api/accounts/notifications/', include('notifications.urls')),
    
    # Subscriptions
    path('api/subscriptions/', include('subscriptions.urls')),
    
    # Chat System
    path('api/chat/', include('chat.urls')),
    path('api/', include('chat.api_urls')),
    
    # Storage (My Files)
    path('api/', include('storage.urls')),
    
    # Support Tickets
    path('api/', include('tickets.urls')),
]

# Serve media files locally in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)