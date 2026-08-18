import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django_asgi_app = get_asgi_application()

# Reset any stale online flags on server startup
try:
    from accounts.models import Profile
    Profile.objects.update(is_online=False, online_connections_count=0)
except Exception:
    pass

import chat.routing
from chat.jwt_ws_middleware import JwtAuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddlewareStack(
        URLRouter(chat.routing.websocket_urlpatterns)
    ),
})
