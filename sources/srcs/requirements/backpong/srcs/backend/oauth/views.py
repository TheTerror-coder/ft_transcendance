from io import BytesIO
import json
import sys
from qrcode import make
from qrcode.image.svg import SvgPathImage

from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from backend import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from typing import Any, Dict, Optional
from allauth.headless.tokens.base import AbstractTokenStrategy
from django.http import HttpRequest
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialLogin
from allauth.headless.account.views import SessionView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from backend import parameters

class socilaJwtToken(SessionView):
	permission_classes = [IsAuthenticated]
	
	def get(self, request, *args, **kwargs):
		# return super().get(request=request, args=args, kwargs=kwargs)
		jwt = {}
		access_token = request.session.get('jwt_access_token')
		refresh_token = request.session.get('jwt_refresh_token')
		
		response = super().get(
			request=request, args=args, kwargs=kwargs
			)
		# sys.stderr.write("*******DEBUG******* sociallogin: " + '\n')
		# sys.stderr.write(str(request))
		# sys.stderr.write(str(self))
		sys.stderr.write("*******DEBUG******* socilaJwtToken access token: " + (access_token or 'null') + '\n')
		sys.stderr.write("*******DEBUG******* socilaJwtToken refresh token: " + (refresh_token or 'null') + '\n')
		
		if not (access_token and refresh_token):
			sys.stderr.write("*******DEBUG******* socilaJwtToken exited!!" + '\n')
			return response
		
		# sys.stderr.write("*******DEBUG******* socilaJwtToken current content: " + str(response.content) + '\n')
		current_content = json.loads(response.content.decode('utf-8'))
		# sys.stderr.write("*******DEBUG******* socilaJwtToken current content: " + str(current_content) + '\n')
		
		status = current_content['status']
		if status != 200 and status != 401 :
			sys.stderr.write("*******DEBUG******* socilaJwtToken exited with current content status=" + str(current_content['status']) + '\n')
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
		
		sys.stderr.write("*******DEBUG******* socilaJwtToken succeeded" + '\n')
		return response

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
		# res['profile_image'] = user.email
		return (Response(res))
	res['status'] = 'disconnected'
	return (Response(res))

# @csrf_protect
# @api_view(['POST'])
# def jwtToken(request):
# 	sys.stderr.write("************ display" + str(request.user.is_authenticated) + '\n')
# 	sociallogin = SocialLogin.objects.get(user=request.user)  # Assuming user is authenticated
# 	refresh = RefreshToken.for_user(sociallogin.user)
# 	access_token = str(refresh.access_token)
# 	return Response({
# 		'access_token': access_token,
# 		'refresh_token': str(refresh),
# 	})
	# res = {}
	# refresh = RefreshToken.for_user(request.user)
	# if not refresh:
	# 	res['status'] = 400
	# 	return Response(res)
	
	# res['status'] = 200
	# res['access'] = str(refresh.access_token)
	# res['refresh'] = str(refresh)
	# return (Response(res))

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
def generateTotpQrCode(request):
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