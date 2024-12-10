from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import CustomUser
from django.contrib.auth import authenticate


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'photo', 'email', 'password1', 'password2')


class CustomAuthenticationForm(forms.Form):
    email = forms.EmailField(
        max_length=254,
        widget=forms.EmailInput(attrs={'autofocus': True}),
        label="Email"
    )
    password = forms.CharField(
        label="Password",
        strip=False,
        widget=forms.PasswordInput
    )

    def clean(self):
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')

        if email and password:
            self.user_cache = authenticate(email=email, password=password)
            if self.user_cache is None:
                raise forms.ValidationError(
                    "Invalid email or password."
                )
        return self.cleaned_data

    def get_user(self):
        return self.user_cache

class UpdateUserLanguageForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['language']
        
    def clean_language(self):
        language = self.cleaned_data.get('language')
        if language not in ['FR', 'EN', 'ES']:
            raise forms.ValidationError("cette langue n'est pas valide.")
        return language

class UpdateUsernameForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['username']
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if CustomUser.objects.filter(username=username).exclude(pk=self.instance.pk).exists():
            raise ValidationError("Ce nom d'utilisateur est déjà pris.")
        return username
