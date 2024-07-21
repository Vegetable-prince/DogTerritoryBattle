from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DogViewSet, PlayerViewSet, DogTypeViewSet, GameViewSet, home_view, game_view

router = DefaultRouter()
router.register(r'dogs', DogViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'dog_types', DogTypeViewSet)
router.register(r'games', GameViewSet)

app_name = 'game'

urlpatterns = [
    path('', home_view, name='home'),
    path('api/', include(router.urls)),
    path('game/<int:game_id>/', game_view, name='game_view'),
]