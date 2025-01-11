
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, FriendRequest, Game
from django.utils.html import format_html
from django.urls import reverse


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Ajout des nouveaux champs à afficher dans la liste
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'photo_tag', 'friends_list', 'victories', 'prime', 'games_played')

    # Changer les champs en lecture seule si nécessaire
    readonly_fields = ('photo_tag', 'friends_list')

    # Ajout des nouveaux champs au formulaire d'administration
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('photo', 'friend_list', 'victories', 'prime', 'games_played')}),
    )

    # Méthodes pour afficher les valeurs de `victories`, `prime`, et `games_played` dans la liste
    def victories(self, obj):
        return obj.victories

    def prime(self, obj):
        return obj.prime

    def games_played(self, obj):
        return obj.games_played
    
    def games_link(self, obj):
        return format_html('<a href="{}">Voir les jeux</a>', reverse('admin:appname_game_changelist') + f'?player__id={obj.id}')
    
    games_link.short_description = "Games"

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


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    # Affichage des champs dans la liste
    list_display = ('player', 'opponent', 'player_score', 'opponent_score', 'date', 'game_result')
    
    # Rendre la date en lecture seule
    readonly_fields = ('date',)

    fieldsets = (
        (None, {
            'fields': ('player', 'opponent', 'player_score', 'opponent_score', 'date')
        }),
    )

    # Méthode pour afficher un résultat du jeu sous forme lisible
    def game_result(self, obj):
        if obj.player_score > obj.opponent_score:
            return "Player Wins"
        elif obj.player_score < obj.opponent_score:
            return "Opponent Wins"
        else:
            return "Draw"
    game_result.admin_order_field = 'player_score'  # Permet de trier par le score du joueur
    game_result.short_description = 'Game Result'  # Titre de la colonne dans l'admin

    # Ajouter un filtre pour les jeux d'un utilisateur en particulier
    list_filter = ('player', 'opponent', 'date')

    # Si vous souhaitez filtrer par joueur ou adversaire, vous pouvez ajouter une recherche
    search_fields = ['player__username', 'opponent__username']

