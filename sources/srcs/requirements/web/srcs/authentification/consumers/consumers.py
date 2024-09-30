        
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from authentification.models import FriendRequest
from asgiref.sync import sync_to_async

user_channels = {}

class FriendInviteConsumer(AsyncJsonWebsocketConsumer):
    
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
        else:
            self.room_group_name = f"friend_invite_{self.user.username}"
            print("Room group name:", self.room_group_name)
            print("nana:", self.channel_layer)
            print("nunu:", self.channel_name)
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            user_channels[self.user.username] = self.channel_name
            await self.accept()
            # print(f"User {self.user.username} joined room: {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # print(f"User {self.user.username} left room: {self.room_group_name}")

    async def receive(self, text_data=None):
        text_data_json = json.loads(text_data)
        # print("Received message:", text_data_json)
        # print("cououcaca:", self.channel_layer)

        if text_data_json['type'] == 'invitation':
            await self.send_invitation(text_data_json['username'])

        elif text_data_json['type'] == 'response.invitation':
            friend_request_id = text_data_json['friend_request_id']
            friend_request = await self.get_friend_request_by_id(friend_request_id)
            if friend_request:
                if text_data_json['response'] == 'accept':
                    await self.accept_friend_request(friend_request)
                elif text_data_json['response'] == 'reject':
                    await self.reject_friend_request(friend_request)

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
                'friend_request_id': friend_request.id
            }

            user_room_group_name = f"friend_invite_{username}"
            # print(f"Invitation créée: {invitation}")
            print("user =", username)
            print(f"Room group name:", user_room_group_name)
            print(f"Room group nameMe:", self.room_group_name)
            await self.channel_layer.group_send(
                user_room_group_name,
                {
                    "type": "send.message",
                    "text": json.dumps(invitation)
                }
            )
            # print(f"Sending invitation to group: {user_room_group_name}")
            # print(f"Sending invitation to group: {self.channel_layer}")
            # print(f"Invitation envoyée via le channel layer: {self.channel_layer}")
        else:
            print(f"No user with username {username}")

    async def send_message(self, event):
        message = event['text']
        # print(f"Message received in send_message: {message}")
        await self.send(text_data=message)

    @database_sync_to_async
    def get_user_by_username(self, username):
        User = get_user_model()
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_friend_request_by_id(self, friend_request_id):
        try:
            return FriendRequest.objects.get(id=friend_request_id)
        except FriendRequest.DoesNotExist:
            return None

    @database_sync_to_async
    def accept_friend_request(self, friend_request):
        friend_request.status = 'ACCEPTED'
        friend_request.save()

    @database_sync_to_async
    def reject_friend_request(self, friend_request):
        friend_request.status = 'REJECTED'
        friend_request.save()