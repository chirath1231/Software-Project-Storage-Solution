from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/', include('admin_management.urls')),
    path("api/", include("storage.urls")),
]

# Serve media files locally in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

   
