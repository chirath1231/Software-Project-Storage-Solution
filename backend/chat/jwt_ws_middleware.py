from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.authentication import JWTAuthentication


@database_sync_to_async
def get_user_from_token(token: str):
    """
    Validate JWT token and return a Django user.
    If invalid, return AnonymousUser.
    """
    try:
        jwt_auth = JWTAuthentication()
        validated = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated)
        return user
    except Exception:
        return AnonymousUser()


class JwtAuthMiddleware:
    """
    Custom middleware for Channels that takes JWT token from query string.
    Example:
      ws://127.0.0.1:8000/ws/chat/1/?token=<JWT>
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token_list = params.get("token", [])
        token = token_list[0] if token_list else None

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    """
    Same idea as AuthMiddlewareStack, but for JWT via querystring token.
    """
    return JwtAuthMiddleware(inner)
