from rest_framework.response import Response
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def csrf(request):
	payload = {}
	csrfToken = get_token(request)
	payload ["csrf_token"] = csrfToken if csrfToken else None
	return(Response(payload))
