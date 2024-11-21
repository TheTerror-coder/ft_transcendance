from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError
from .models import CustomUser
from django.core.validators import FileExtensionValidator
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





class UpdateUsernameForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['username']
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if CustomUser.objects.filter(username=username).exclude(pk=self.instance.pk).exists():
            raise ValidationError("Ce nom d'utilisateur est déjà pris.")
        return username


class UpdatePhotoForm(forms.ModelForm):
    photo = forms.ImageField(
        validators=[FileExtensionValidator(allowed_extensions=['png', 'jpg', 'jpeg', 'webp'])]
    )

    class Meta:
        model = CustomUser
        fields = ['photo']

    def clean_photo(self):
        photo = self.cleaned_data.get('photo')
        if photo:
            extension = photo.name.split('.')[-1].lower()
            if extension not in ['png', 'jpg', 'jpeg', 'webp']:
                raise ValidationError("Extension de fichier non supportée. Veuillez télécharger un fichier avec une extension PNG, JPG, JPEG, ou WEBP.")
        return photo