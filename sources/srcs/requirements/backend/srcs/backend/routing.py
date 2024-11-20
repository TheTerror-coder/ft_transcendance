from django.urls import re_path
from usermanagement.consumers.consumers import FriendInviteConsumer

websocket_urlpatterns = [
    # re_path(r'websocket/friend_invite/$', FriendInviteConsumer.as_asgi()),
    re_path(r'ws/test/$', FriendInviteConsumer.as_asgi()),
]