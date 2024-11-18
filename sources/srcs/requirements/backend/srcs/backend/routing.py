from django.urls import re_path
from usermanagement.consumers.consumers import FriendInviteConsumer

websocket_urlpatterns = [
    re_path(r'ws/friend_invite/$', FriendInviteConsumer.as_asgi()),
]