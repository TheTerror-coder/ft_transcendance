from io import BytesIO
import json
import sys
from qrcode import make
from qrcode.image.svg import SvgPathImage

from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from allauth.headless.account.views import SessionView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

class accountJWT(SessionView):
	permission_classes = [IsAuthenticated]
	
	def get(self, request, *args, **kwargs):
		try:
			jwt = {}
			access_token = request.session.get('jwt_access_token')
			refresh_token = request.session.get('jwt_refresh_token')
			
			response = super().get(
				request=request, args=args, kwargs=kwargs
				)
			
			if not (access_token and refresh_token):
				sys.stderr.write("*******DEBUG******* accountJWT exited!!" + '\n')
				return response
			
			current_content = json.loads(response.content.decode('utf-8'))
			
			status = current_content['status']
			if status != 200 and status != 401 :
				return response
			jwt['access_token'] = access_token
			jwt['refresh_token'] = refresh_token
			current_content['jwt'] = jwt

			response.content = json.dumps(current_content)

			# clear tokens from the session
			if access_token:
				del request.session['jwt_access_token']
			if refresh_token:
				del request.session['jwt_refresh_token']
			
			return response
		except Exception as e:
			return Response({"error": str(e)})

@csrf_protect
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
	res = {}
	user = request.user
	res['status'] = None
	if user.is_authenticated:
		res['status'] = 'connected'
		res['username'] = user.username
		res['firstname'] = user.first_name
		res['lastname'] = user.last_name
		res['email'] = user.email
		return (Response(res))
	res['status'] = 'disconnected'
	return (Response(res))

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
def generateTotpQrCode(request):
	try:
		totp_url = request.data.get('totp_url');
		res = {}
		if (totp_url) :
			res['status'] = 200
		else :
			res['status'] = 400
		buffer = BytesIO()
		image = make(totp_url, image_factory=SvgPathImage)
		image.save(buffer)
		res['totp_qrcode'] = buffer.getvalue()
		return (Response(res))
	except Exception as e:
		return Response({"error": str(e)})