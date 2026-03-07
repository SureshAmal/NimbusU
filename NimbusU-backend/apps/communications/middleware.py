"""
Custom JWT authentication middleware for Django Channels WebSocket connections.

Usage in asgi.py:
    from apps.communications.middleware import JWTAuthMiddleware
    application = ProtocolTypeRouter({
        "websocket": JWTAuthMiddleware(URLRouter(routing.websocket_urlpatterns)),
    })

The frontend passes the JWT token as a query parameter:
    ws://localhost:8000/ws/chat/?token=<jwt_access_token>
"""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async  # type: ignore
from channels.middleware import BaseMiddleware  # type: ignore
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_user_from_token(token: str):
    """Validate a JWT access token and return the corresponding user."""
    try:
        from rest_framework_simplejwt.tokens import AccessToken  # type: ignore

        validated = AccessToken(token)
        from django.contrib.auth import get_user_model

        User = get_user_model()
        return User.objects.get(id=validated["user_id"])
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware that reads a JWT token from the WebSocket query string
    (?token=...) and attaches the authenticated user to scope["user"].
    Falls back to AnonymousUser if no token or invalid token.
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
