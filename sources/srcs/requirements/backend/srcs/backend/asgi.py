
import os
import django
from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from .routing import websocket_urlpatterns
from usermanagement.consumers import FriendInviteConsumer
# from usermanagement.consumers import ChatConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            # path('websocket/friend_invite/', ChatConsumer.as_asgi()),
            path("websocket/friend_invite/", FriendInviteConsumer.as_asgi()),
        ])
    ),
})