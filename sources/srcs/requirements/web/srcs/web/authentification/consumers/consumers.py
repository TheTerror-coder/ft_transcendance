        
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from authentification.models import FriendRequest
from asgiref.sync import sync_to_async
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

user_sockets = {}

class FriendInviteConsumer(AsyncJsonWebsocketConsumer):
    
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
        else:
            self.room_group_name = f"friend_invite_{self.user.id}"
            await self.accept()
            user_sockets[self.user.username] = self.channel_name
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            print(f"User {self.user.username} joined room: {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if self.user.username in user_sockets:
            del user_sockets[self.user.username]
        print(f"User {self.user.username} left room: {self.room_group_name}")

    async def receive(self, text_data=None):
        text_data_json = json.loads(text_data)

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

            user_room_group_name = f"friend_invite_{user.id}"
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
        else:
            print(f"No user with username {username}")

    async def send_message(self, event):
        message = event['text']
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
    def accept_friend_request(request, friend_request):
        friend_request = get_object_or_404(FriendRequest, id=friend_request.id)
        friend_request.accept()
        return JsonResponse({'status': 'accepted'})

    @database_sync_to_async
    def decline_friend_request(request, friend_request):
        friend_request = get_object_or_404(FriendRequest, id=friend_request.id)
        friend_request.decline()
        return JsonResponse({'status': 'declined'})