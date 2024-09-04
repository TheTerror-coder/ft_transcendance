from django.urls import re_path
from authentification.consumers.consumers import FriendInviteConsumer

websocket_urlpatterns = [
    re_path(r'ws/friend_invite/$', FriendInviteConsumer.as_asgi()),
]