from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser
from django.contrib.auth import authenticate

class CustomUserCreationForm(UserCreationForm):
    def __init__(self, *args, **kwargs): # print value in the form
        super().__init__(*args, **kwargs)
        print("icietla", self.data)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2')


class CustomAuthenticationForm(AuthenticationForm):
    print("custom")
    username = forms.CharField(max_length=254, widget=forms.TextInput(attrs={'autofocus': True}))
    password = forms.CharField(label="Password", strip=False, widget=forms.PasswordInput)

class UpdateUsernameForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['username']

class UpdatePhotoForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['photo']
