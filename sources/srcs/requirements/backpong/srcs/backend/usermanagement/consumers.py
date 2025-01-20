        
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import FriendRequest
from asgiref.sync import sync_to_async
# from django.http import JsonResponse
# from django.shortcuts import get_object_or_404
# from django.db.models import Q
import sys

user_sockets = {}

# from channels.generic.websocket import AsyncWebsocketConsumer

class FriendInviteConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        sys.stderr.write("*****************connected" + '\n')
        self.user = self.scope['user']
        sys.stderr.write(str(self.user.id) + '\n')
        sys.stderr.write(str(self.user.username) + '\n')
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
        sys.stderr.write("*****************disconnected" + '\n')
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if self.user.username in user_sockets:
            del user_sockets[self.user.username]
        print(f"User {self.user.username} left room: {self.room_group_name}")
   
   
    async def receive(self, text_data=None):
        sys.stderr.write("*****************receive" + '\n')
        text_data_json = json.loads(text_data)
        if text_data_json['type'] == 'invitation':
            await self.send_invitation(text_data_json['username'])
        elif text_data_json['type'] == 'response.invitation':
            friend_request_id = text_data_json['friend_request_id']
            friend_request = await self.get_friend_request_by_id(friend_request_id)
            if friend_request:
                if text_data_json['response'] == 'accept':
                    friend_request = await self.accept_friend_request(friend_request)
                elif text_data_json['response'] == 'reject':
                    friend_request = await self.decline_friend_request(friend_request)


    async def send_invitation(self, username):
        sys.stderr.write("*****************send_invitation " + username + "\n")
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



    async def update_username(self, event):
        new_username = event["new_username"]
        del user_sockets[self.user.username]
        user_sockets[new_username] = self.channel_name
        self.user.username = new_username
        print(f"WebSocket updated username to {new_username}", file=sys.stderr)
        await self.notify_username_update(new_username)

    async def notify_username_update(self, new_username):
        # Envoyer un message à tous les utilisateurs connectés pour leur dire de mettre à jour leur nom d'utilisateur
        for username, channel_name in user_sockets.items():
            # if channel_name != self.channel_name:
            print(f"WebSocket sending update_username to pipi {new_username}, {channel_name}, {username}", file=sys.stderr)
            invitation = {
                'type': 'invitation',
                'from': self.user.username,
                'to': username,
                'text': f"{self.user.username} wants to be your friend",
                'friend_request_id': friend_request.id
            }

            await self.channel_layer.send(
                channel_name,
                {
                    'type': 'send.message',
                    'text': json.dumps(invitation),
                    'new_username': new_username
                }
            )





    # async def update_username(self, event):
    #     new_username = event["new_username"]
    #     del user_sockets[self.user.username]
    #     user_sockets[new_username] = self.channel_name
    #     self.user.username = new_username
    #     print(f"WebSocket updated username to {new_username}", file=sys.stderr)

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
        friend_request.accept()
        friend_request.delete()
        return None


    @database_sync_to_async
    def decline_friend_request(request, friend_request):
        friend_request.decline()
        friend_request.delete()
        return None
