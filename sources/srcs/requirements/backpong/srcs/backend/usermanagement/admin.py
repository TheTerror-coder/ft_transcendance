
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, FriendRequest


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'photo_tag', 'friends_list')
    readonly_fields = ('photo_tag', 'friends_list')

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('photo', 'friend_list')}),
    )

@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    # Afficher certains champs dans la liste
    list_display = ('from_user', 'to_user', 'status')
    
    # Filtrer les demandes d'amis en attente
    list_filter = ('status',)
    
    # Ajouter une action pour marquer les invitations comme acceptées ou refusées
    actions = ['accept_invitations', 'decline_invitations']
    
    def accept_invitations(self, request, queryset):
        """
        Accepter les demandes d'amis sélectionnées.
        """
        queryset.update(status='ACCEPTED')
        for friend_request in queryset:
            friend_request.accept()  # Appeler la méthode `accept()` pour ajouter les amis.
    
    def decline_invitations(self, request, queryset):
        """
        Refuser les demandes d'amis sélectionnées.
        """
        queryset.update(status='DECLINED')
        for friend_request in queryset:
            friend_request.decline()  # Appeler la méthode `decline()` pour rejeter les demandes.
    
    # Définir des filtres par défaut pour afficher uniquement les invitations en attente
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.filter(status='PENDING')