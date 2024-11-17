from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect

@api_view(['GET'])
def csrf(request):
	payload = {}
	csrfToken = get_token(request)
	payload ["csrf_token"] = csrfToken if csrfToken else None
	return(Response(payload))
