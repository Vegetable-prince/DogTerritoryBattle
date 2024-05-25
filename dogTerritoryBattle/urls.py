from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(('game.urls'), namespace='game')),
    path('game/', include('game.urls')),
]
