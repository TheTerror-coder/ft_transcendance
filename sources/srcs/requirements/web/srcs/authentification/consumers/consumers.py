from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
# from .models import FriendRequest
import json

class FriendInviteConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('friend_invite', self.channel_name)
        await self.accept()
        print("Connected to WebSocket", self.channel_name)

    async def disconnect(self, close_code):
        print("Disconnected from WebSocket")
        await self.channel_layer.group_discard('friend_invite', self.channel_name)

    async def receive(self, text_data=None):
        text_data_json = json.loads(text_data)
        print("caca", text_data_json)
        if text_data_json['type'] == 'invitation':
            await self.send_invitation(text_data_json['username'])

    @database_sync_to_async
    def send_invitation(self, username):
        user = self.get_user_by_username(username)
        print("user", user)
        # if user is not None:
        #     friend_request = FriendRequest(from_user=self.user, to_user=user, status='PENDING')
        #     friend_request.save()
        # else:
        #     print(f"No user with username {username}")

    
    def get_user_by_username(self, username):
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
            return user
        except User.DoesNotExist:
            return None

    async def send_message(self, event):
        # This method is called when a message is sent to the group
        print("send_message", event)
        await self.send_json(event["text"])