from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
	@classmethod
	def get_token(cls, user):
		try:
			token = super().get_token(user)

			token['username'] = user.username if user.username else None
			token['firstname'] = user.first_name if user.first_name else None
			token['lastname'] = user.last_name if user.last_name else None
			token['email'] = user.email if user.email else None

			return token
		except Exception as e:
			return None