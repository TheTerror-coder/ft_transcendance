from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from authentification.models import FriendRequest
from asgiref.sync import sync_to_async, async_to_sync
import json

class FriendInviteConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('friend_invite', self.channel_name)

    async def receive(self, text_data=None):
        text_data_json = json.loads(text_data)
        if 'room_name' in text_data_json:
            self.room_group_name = text_data_json['room_name']

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            print(f"salut: {self.channel_name} from {self.room_group_name}")
        if text_data_json['type'] == 'invitation':
            await self.send_invitation(text_data_json['username'])
        if text_data_json['type'] == 'response.invitation':
            print("ici")
            if text_data_json['response'] == 'accept':
                await self.accept_friend_request(friend_request)
            elif text_data_json['response'] == 'reject':
                print("reject")

    async def send_invitation(self, username):
        user = await self.get_user_by_username(username)
        if user is not None:
            friend_request = FriendRequest(from_user=self.user, to_user=user, status='PENDING')
            await sync_to_async(friend_request.save)()
            invitation = {
                'type': 'invitation',
                'from': self.user.username,
                'to': username,
                'text': f"{self.user.username} wants to be your friend",
            }
            channel_layer = get_channel_layer()
            print(f"chat_{channel_layer}")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "send.message",
                    "text": json.dumps(invitation)
                }
            )
        else:
            print(f"No user with username {username}")

    @database_sync_to_async
    def get_user_by_username(self, username):
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
            return user
        except User.DoesNotExist:
            return None

    async def send_message(self, event):
        print("send_message", event)
        await self.send(text_data=event["text"])

        
    @database_sync_to_async
    def accept_friend_request(self, friend_request):
        friend_request.accept()