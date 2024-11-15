from io import BytesIO
from qrcode import make
from qrcode.image.svg import SvgPathImage

from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from web import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response


# @api_view(['GET'])
# def getIsAuthenticated(request):
# 	res = {}
# 	user = request.user
# 	res['is_authenticated'] = 'false'
# 	if user.is_authenticated:
# 		res['is_authenticated'] = 'true'
# 	return (Response(res))

@csrf_protect
@api_view(['GET','POST'])
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

@csrf_protect
@api_view(['POST'])
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