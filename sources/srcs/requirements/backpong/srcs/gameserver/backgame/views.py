# from django.shortcuts import render
# from rest_framework.response import Response
# from rest_framework.decorators import api_view
# from ../../../usermanagement.models import CustomUser, Game
# from ../../../usermanagement.forms import UpdateStatFrom
# # Create your views here.

# @api_view(['GET'])
# def hello(request):
#     return Response({"message": "Hello, World!"})


# def set_stat(request):
#     username = request.data.get('username')
#     user = CustomUser.objects.get(username=username)
#     form = UpdateStatFrom(request.POST, instance=user)
    
#     if form.is_valide():
#         user.victories = form.cleaned_data['victories']
#         user.prime = form.cleaned_data['prime']
#         user.games_played = form.cleaned_data['games_played']
#         user.save()

