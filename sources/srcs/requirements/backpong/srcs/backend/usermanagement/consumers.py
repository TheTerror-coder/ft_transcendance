        
import json
import bleach
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import FriendRequest
from asgiref.sync import sync_to_async
import sys
from channels.layers import get_channel_layer

user_sockets = {}


class FriendInviteConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        try:
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
        except Exception as e:
            print(f"Error connecting to WebSocket: {e}", file=sys.stderr)
            await self.close()


    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            if self.user.username in user_sockets:
                del user_sockets[self.user.username]
        except Exception as e:
            print(f"Error disconnecting from WebSocket: {e}", file=sys.stderr)
   
   
    async def receive(self, text_data=None):
        try:
            sanitized_text_data = bleach.clean(text_data)
            text_data_json = json.loads(sanitized_text_data)
            if text_data_json['type'] == 'invitation':
                await self.send_invitation(text_data_json['username'])
            elif text_data_json['type'] == 'response.invitation':
                friend_request_id = text_data_json['friend_request_id']
                friend_request = await self.get_friend_request_by_id(friend_request_id)
                if friend_request:
                    if text_data_json['response'] == 'accept':
                        friend_request = await self.accept_friend_request(friend_request, text_data_json['to_user'])
                    elif text_data_json['response'] == 'reject':
                        friend_request = await self.decline_friend_request(friend_request)
        except Exception as e:
            print(f"Error receiving WebSocket message: {e}", file=sys.stderr)

    async def send_invitation(self, username):
        try:
            user = await self.get_user_by_username(username)
            if user is not None:
                friend_request = FriendRequest(from_user=self.user, to_user=user, status='PENDING')
                await sync_to_async(friend_request.save)()
                invitation = {
                    'type': 'invited',
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
        except Exception as e:
            print(f"Error sending invitation: {e}", file=sys.stderr)


    async def send_message(self, event):
        try:
            message = event['text']
            await self.send(text_data=message)
        except Exception as e:
            print(f"Error sending WebSocket message: {e}", file=sys.stderr)



    async def update_username(self, event):
        try:
            new_username = event["new_username"]
            to_user = event["to_user"]
            from_user = event["from_user"]
            await self.notify_username_update()
        except Exception as e:
            print(f"Error updating username: {e}", file=sys.stderr)

    async def notify_username_update(self):
        try:
            channel_layer = get_channel_layer()
            invitation = {
                'type': 'update_name',
                'from': self.user.username,
            }
            await channel_layer.send(
                self.channel_name,
                {
                    'type': 'send.message',
                    'text': json.dumps(invitation),
                }
            )
        except Exception as e:
            print(f"Error notifying username update: {e}", file=sys.stderr)


    async def update_logout(self, event):
        try:
            user = event["from_user"]
            to_user = event["to_user"]
            if self.user.username != to_user:
                self.user.username = to_user
            channel_layer = get_channel_layer()
            invitation = {
                'type': 'update_name',
                'from': self.user.username,
            }
            await channel_layer.send(
                self.channel_name,
                {
                    'type': 'send.message',
                    'text': json.dumps(invitation),
                }
            )
        except Exception as e:
            print(f"Error updating logout: {e}", file=sys.stderr)

    async def update_login(self, event):
        try:
            to_user = event["to_user"]
            user = event["username"]
            for username, channel_name in user_sockets.items():
                if channel_name == self.channel_name:
                    invitation = {
                        'type': 'update_login',
                        'from': user,
                        'to': to_user,
                    }
                    await self.channel_layer.send(
                        channel_name,
                        {
                            'type': 'send.message',
                            'text': json.dumps(invitation),
                        }
                    )
        except Exception as e:
            print(f"Error updating login: {e}", file=sys.stderr)


    async def remove_friend(self, event):
        try:
            for username, channel_name in user_sockets.items():
                if channel_name == self.channel_name:
                    invitation = {
                        'type': 'remove_friend',
                        'from': self.user.username,
                        'to': username,
                    }
                    await self.channel_layer.send(
                        channel_name,
                        {
                            'type': 'send.message',
                            'text': json.dumps(invitation),
                        }
                    )
        except Exception as e:
            print(f"Error removing friend: {e}", file=sys.stderr)

    @database_sync_to_async
    def get_user_by_username(self, username):
        try:
            User = get_user_model()
            try:
                return User.objects.get(username=username)
            except User.DoesNotExist:
                return None
        except Exception as e:
            print(f"Error getting user by username: {e}", file=sys.stderr)
            return None


    @database_sync_to_async
    def get_friend_request_by_id(self, friend_request_id):
        try:
            return FriendRequest.objects.get(id=friend_request_id)
        except FriendRequest.DoesNotExist:
            return None


    async def accept_friend_request(self, friend_request, username):
        try:
            try:
                await database_sync_to_async(friend_request.accept)()
                await database_sync_to_async(friend_request.delete)()
            except Exception as e:
                print(f"Error accepting friend request: {e}", file=sys.stderr)
                return
            if not username:
                print("No username provided", file=sys.stderr)
                return

            for user, channel_name in user_sockets.items():
                if channel_name != self.channel_name:
                    if user == username:
                        invitation = {'type': 'remove_friend'}
                        try:
                            await self.channel_layer.send(
                                channel_name,
                                {
                                    'type': 'send.message',
                                    'text': json.dumps(invitation),
                                }
                            )
                        except Exception as e:
                            print(f"Error sending WebSocket message: {e}", file=sys.stderr)
        except Exception as e:
            print(f"Error accepting friend request: {e}", file=sys.stderr)


    @database_sync_to_async
    def decline_friend_request(request, friend_request):
        try:
            friend_request.decline()
            friend_request.delete()
            return None
        except Exception as e:
            print(f"Error declining friend request: {e}", file=sys.stderr)
            return None
