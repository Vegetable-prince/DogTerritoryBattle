from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DogViewSet, game_view, move_dog

router = DefaultRouter()
router.register(r'dogs', DogViewSet)

app_name = 'game'

urlpatterns = [
    path('', include(router.urls)),
    path('game/<int:game_id>/', game_view, name='game_view'),
    path('move_dog/', move_dog, name='move_dog'),
]