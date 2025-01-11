from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import CustomUser, Game
from django.contrib.auth import authenticate
import sys


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
        if language not in ['fr', 'en', 'es']:
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

# class UpdateStatFrom(forms.ModelForm):
#     class Meta:
#         model = Game
#         fields = ['player', 'opponent', 'player_score', 'opponent_score']
#         widgets = {
#             'player': forms.Select(attrs={'class': 'form-control'}),
#             'opponent': forms.Select(attrs={'class': 'form-control'}),
#             'player_score': forms.NumberInput(attrs={'class': 'form-control'}),
#             'opponent_score': forms.NumberInput(attrs={'class': 'form-control'})
#         }

#     def clean_player_score(self):
#         score = self.cleaned_data.get('player_score')
#         if score < 0:
#             raise ValidationError("Le score du joueur ne peut pas être négatif.")
#         return score

#     def clean_opponent_score(self):
#         score = self.cleaned_data.get('opponent_score')
#         if score < 0:
#             raise ValidationError("Le score de l'adversaire ne peut pas être négatif.")
#         return score

