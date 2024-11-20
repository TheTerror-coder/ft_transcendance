
# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser  # Importe ton modèle utilisateur personnalisé

# Enregistrement de CustomUser dans l'admin avec UserAdmin
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    pass
