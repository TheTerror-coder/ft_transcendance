from typing import Any
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User

class LogInForm(AuthenticationForm):
	def __init__(self, request: Any = ..., *args, **kwargs):
		super().__init__(request, *args, **kwargs)
		self.fields['username'].widget.attrs.update({
			"class":"input100",
			"type":"text",
			"name":"username"
		})
		self.fields['password'].widget.attrs.update({
			"class":"input100",
			"type":"password",
			"name":"password"
		})

	class Meta:
		model = User
		fields = { 'username', 'password' }


class SignUpForm(UserCreationForm):

	email = forms.EmailField()
	
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.fields['username'].widget.attrs.update({
			"class":"input100",
			"type":"text",
			"name":"username"
		})
		self.fields['email'].widget.attrs.update({
			"class":"input100",
			"type":"text",
			"name":"email"
		})
		self.fields['password1'].widget.attrs.update({
			"class":"input100",
			"type":"password",
			"name":"username"
		})
		self.fields['password2'].widget.attrs.update({
			"class":"input100",
			"type":"password",
			"name":"username"
		})

		class Meta:
			model = User
			fields = {'username', 'email', 'password1', 'password2'}