        
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import FriendRequest
from asgiref.sync import sync_to_async
import sys

user_sockets = {}


class FriendInviteConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        print("*****************connected", file=sys.stderr)
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
        else:
            self.room_group_name = f"friend_invite_{self.user.id}"
            print(f"At-connection*******DEBUG**********username:{self.user.username} user_id:{self.user.id}  room_group_name:{self.room_group_name}", file=sys.stderr)
            print(f"At-connection*******DEBUG**********username:{self.user.username} user_id:{self.user.id}  channel_name:{self.channel_name}", file=sys.stderr)
            await self.accept()
            user_sockets[self.user.username] = self.channel_name
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.send(text_data=json.dumps(
                {
                    'type': 'you_online',
                }
            ))

            print(f"User {self.user.username} joined room: {self.room_group_name}")

            for username in  await self.get_friend_list():
                channel_name = user_sockets.get(username)
                print(f"In connect()*********DEBUG******** username:{username} channel_name:{channel_name}", file=sys.stderr)
                try:
                    await self.channel_layer.send(
                        channel_name,
                        {
                            'type': 'friend.connected',
                            'subject': self.user.username
                        }
                    )
                except Exception as e:
                    print(f"In connect()*********DEBUG******** {e}", file=sys.stderr)


    async def disconnect(self, close_code):
        print("*****************disconnected", file=sys.stderr)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if self.user.username in user_sockets:
            print(f"User {self.user.username} left room: {self.room_group_name}")
            del user_sockets[self.user.username]

   
    async def receive(self, text_data=None):
        print(f"*******debug****** In receive: {json.loads(text_data)}", file=sys.stderr)
        text_data_json = json.loads(text_data)
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
        elif text_data_json['type'] == 'my_friends':
            await self.my_friends()
        elif text_data_json['type'] == 'my.test':
            await self.my_test()
            


    async def my_test(self):
        print(f"*******debug******* my test", file=sys.stderr)
        i = 0
        for username in  await self.get_friend_list():
            print(f"*********DEBUG********* friend_{i} -> {username}", file=sys.stderr)
            i += 1

    async def my_friends(self):
        print(f"In my_friends()*********DEBUG********", file=sys.stderr)
        payload = {
            'type': 'my_friends',
            'friends': [],
        }
        i = 0
        for username in  await self.get_friend_list():
            user = await self.get_user_by_username(username)
            user_id = user.id
            payload['friends'].append({
                'username': username,
                'status': 'online' if username in user_sockets else 'offline',
                'id': f'{user_id}',
            })
            print(f"*********DEBUG********* friend_{i} -> {username}", file=sys.stderr)
            i += 1
        try:
            await self.send(text_data=json.dumps(payload))
        except Exception as e:
            print(f"In my_friends()*********DEBUG******** {e}", file=sys.stderr)

    async def send_invitation(self, username):
        user = await self.get_user_by_username(username)
        if user is not None:
            friend_request = FriendRequest(from_user=self.user, to_user=user, status='PENDING')
            print(f"*******Friend request from {self.user.username} to {username}", file=sys.stderr)
            await sync_to_async(friend_request.save)()
            invitation = {
                'type': 'invited',
                'from': self.user.username,
                'to': username, 
                'msg': f"{self.user.username} wants to be your friend",
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
        # print(f"*******In send_message,  message:{json.loads(message)}", file=sys.stderr)



    async def update_username(self, event):
        new_username = event["new_username"]
        if self.user.username in user_sockets:
            user_sockets[new_username] = user_sockets.pop(self.user.username)
        self.user.username = new_username
        await self.notify_username_update(new_username)

    async def notify_username_update(self, new_username):
        print(f"User {self.user.username} changed username to {new_username}", file=sys.stderr)
        for username, channel_name in user_sockets.items():
            if channel_name != self.channel_name:
                print(f"channel_name {channel_name} username {username}", file=sys.stderr)
                invitation = {
                    'type': 'update_name',
                    'from': self.user.username,
                    'to': username,
                    'new_username': new_username
                }
                await self.channel_layer.send(
                    channel_name,
                    {
                        'type': 'send.message',
                        'text': json.dumps(invitation),
                    }
                )


    async def update_logout(self, event):
        user = event["username"]
        for username, channel_name in user_sockets.items():
            if channel_name == self.channel_name:
                invitation = {
                    'type': 'update_logout',
                    'from': self.user.username,
                    'to': user,
                }
                await self.channel_layer.send(
                    channel_name,
                    {
                        'type': 'send.message',
                        'text': json.dumps(invitation),
                    }
                )
        # if user in user_sockets:
        #     del user_sockets[user]

    async def friend_disconnected(self, event):
        username = event['subject']
        print(f"In friend_disconnected()*********DEBUG******** username:{username}", file=sys.stderr)
        payload = {
            'type': 'friend_disconnected',
            'from': username,
        }
        await self.send(text_data=json.dumps(payload))
    
    async def friend_connected(self, event):
        username = event['subject']
        print(f"In friend_connected()*********DEBUG******** username:{username}", file=sys.stderr)
        payload = {
            'type': 'friend_connected',
            'from': username,
        }
        await self.send(text_data=json.dumps(payload))

    async def update_login(self, event):
        to_user = event["to_user"]
        user = event["username"]
        for username, channel_name in user_sockets.items():
            print(f"Username {username} chanel_name {channel_name}", file=sys.stderr)
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


    async def remove_friend(self, event):
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

    @database_sync_to_async
    def get_user_by_username(self, username):
        User = get_user_model()
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_friend_list(self):
        return [friend.username for friend in self.user.friend_list.all()]
    
    @database_sync_to_async
    def add_to_friend_list(self, user):
        self.user.friend_list.add(user)
        return

    @database_sync_to_async
    def get_friend_request_by_id(self, friend_request_id):
        try:
            return FriendRequest.objects.get(id=friend_request_id)
        except FriendRequest.DoesNotExist:
            return None


    async def accept_friend_request(self, friend_request, username):
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
                    invitation = {
                            'type': 'invitation_accepted',
                            'msg': f'{self.user.username} accepted your invitation',
                        }
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


    @database_sync_to_async
    def decline_friend_request(request, friend_request):
        friend_request.decline()
        friend_request.delete()
        return None
