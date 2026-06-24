from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),
    
    # Accounts & Authentication
    path('api/auth/', include('accounts.urls')),
    path('api/accounts/', include('accounts.urls')),
    
    # Notifications App
    path('api/accounts/notifications/', include('notifications.urls')),

    # Calendar Events App
    path('api/accounts/events/', include('events.urls')),
    
    # Subscriptions
    path('api/subscriptions/', include('subscriptions.urls')),
    
    # Chat System
    path('api/chat/', include('chat.urls')),
    path('api/', include('chat.api_urls')),
    
    # Storage & File Management
    path('api/files/', include('storage.urls')), 
    
    # Sharing API
    path('api/', include('sharing.urls')),
    
    # AI Assistant
    path('api/assistant/', include('assistant.urls')),
    
    # Support Tickets
    path('api/', include('tickets.urls')),
    
    # Admin Management
    path('api/', include('admin_management.urls')),
]

# Serve media files locally in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)