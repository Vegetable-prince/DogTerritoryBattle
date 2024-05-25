from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(('game.urls'), namespace='game')),
    path('', include(('game.urls', 'game'), namespace='game')),
]
