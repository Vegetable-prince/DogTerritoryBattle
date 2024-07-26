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
    path('api/dogs/<int:pk>/move/', DogViewSet.as_view({'post': 'move'}), name='dog-move'),
    path('api/dogs/<int:pk>/remove_from_board/', DogViewSet.as_view({'post': 'remove_from_board'}), name='dog-remove-from-board'),
    path('api/dogs/<int:pk>/place_on_board/', DogViewSet.as_view({'post': 'place_on_board'}), name='dog-place-on-board'),
]
