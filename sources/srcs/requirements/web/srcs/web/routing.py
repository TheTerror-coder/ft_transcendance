from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from django.core.asgi import get_asgi_application
from authentification.consumers.consumers import FriendInviteConsumer

websocket_urlpatterns = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': URLRouter([
        re_path(r'ws/friend_invite/$', FriendInviteConsumer.as_asgi()),
    ]),
})