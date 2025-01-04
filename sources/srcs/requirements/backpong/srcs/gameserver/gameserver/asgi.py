"""
ASGI config for gameserver project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gameserver.settings')

django.setup()

from socketio import ASGIApp
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from backgame import index

# sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = get_asgi_application()

application = ProtocolTypeRouter({
	"http": app,
	"websocket": ASGIApp(index.sio),
})

# @sio.event
# async def connect(sid, environ):
# 	print(f'**********DEBUG********** client connected {sid}', file=sys.stderr)

# @sio.event
# async def message(sid, data):
# 	print(f'**********DEBUG********** client message: {data}', file=sys.stderr)
# 	await sio.send(sid, "Hello from backpong server!")

# @sio.event
# async def disconnect(sid):
# 	print(f'**********DEBUG********** client disconnected {sid}', file=sys.stderr)