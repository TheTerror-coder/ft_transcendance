
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, FriendRequest, Game
from django.utils.html import format_html
from django.urls import reverse


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'photo_tag', 'friends_list', 'victories', 'prime', 'games_played')

    readonly_fields = ('photo_tag', 'friends_list')

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('photo', 'friend_list', 'victories', 'prime', 'games_played')}),
    )

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
    list_display = ('from_user', 'to_user', 'status')

    list_filter = ('status',)
    
    actions = ['accept_invitations', 'decline_invitations']
    
    def accept_invitations(self, request, queryset):
        """
        Accepter les demandes d'amis sélectionnées.
        """
        queryset.update(status='ACCEPTED')
        for friend_request in queryset:
            friend_request.accept()
    
    def decline_invitations(self, request, queryset):
        """
        Refuser les demandes d'amis sélectionnées.
        """
        queryset.update(status='DECLINED')
        for friend_request in queryset:
            friend_request.decline()

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.filter(status='PENDING')


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('player', 'opponent', 'player_score', 'opponent_score', 'date', 'game_result')
    
    readonly_fields = ('date',)

    fieldsets = (
        (None, {
            'fields': ('player', 'opponent', 'player_score', 'opponent_score', 'date')
        }),
    )

    def game_result(self, obj):
        if obj.player_score > obj.opponent_score:
            return "Player Wins"
        elif obj.player_score < obj.opponent_score:
            return "Opponent Wins"
        else:
            return "Draw"
    game_result.admin_order_field = 'player_score'
    game_result.short_description = 'Game Result'

    list_filter = ('player', 'opponent', 'date')
    search_fields = ['player__username', 'opponent__username']

