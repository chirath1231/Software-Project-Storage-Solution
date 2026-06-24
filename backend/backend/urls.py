from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),   
     path('api/accounts/', include('accounts.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),  # keep this only once
    path('api/chat/', include('chat.urls')),  # add this line for chat API
    path("api/", include("chat.api_urls")),
    path("api/", include("storage.urls")),
     path('api/', include('tickets.urls')),
     path('api/', include('admin_management.urls')),
     path("api/files/", include("storage.urls")),  # was: path("api/", include("storage.urls"))
    path('api/assistant/', include('assistant.urls')),
    path('api/', include('sharing.urls')),  # add this line for sharing API
]

# Serve media files locally in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

   


