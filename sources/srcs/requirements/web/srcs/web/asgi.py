from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import web.routing

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'web.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            web.routing.websocket_urlpatterns
        )
    ),
})