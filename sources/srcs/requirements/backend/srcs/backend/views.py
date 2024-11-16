from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect

@api_view(['GET'])
def hello(request):
	return(Response(data={"msg": "Hello World, you're at hello endpoint!"}))

@api_view(['GET'])
def csrf(request):
	payload = {}
	csrfToken = get_token(request)
	payload ["csrf_token"] = csrfToken if csrfToken else None
	return(Response(payload))

@csrf_protect
@api_view(['POST'])
def ping(request):
	payload = {}
	payload ["result"] = 'ok'
	return(Response(payload))
