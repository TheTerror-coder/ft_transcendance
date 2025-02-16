import sys
from allauth.mfa.totp.forms import ActivateTOTPForm
from allauth.mfa.totp.internal import auth
from allauth.mfa.adapter import get_adapter

class MyCustomActivateTOTPForm(ActivateTOTPForm):
	def clean_code(self):
		try:
			code = self.cleaned_data["code"]
			if not auth.validate_totp_code(self.secret, code):
				raise get_adapter().validation_error("incorrect_code")
			return code
		except Exception as e:
			return None