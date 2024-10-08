from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DogViewSet, PlayerViewSet, DogTypeViewSet, GameViewSet

router = DefaultRouter()
router.register(r'dogs', DogViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'dog_types', DogTypeViewSet)
router.register(r'games', GameViewSet)

app_name = 'dog_territory_battle_game_api'

urlpatterns = [
    path('', include(router.urls)),
]