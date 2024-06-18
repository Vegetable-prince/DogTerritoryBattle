from django.contrib import admin
from .models import Player, DogType, Game, Dog

admin.site.register(Player)
admin.site.register(DogType)
admin.site.register(Game)
admin.site.register(Dog)