from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('game.urls')),  # APIのルートを追加
    path('', include('game.urls')),  # ゲームのルートを追加
    path('', include(('game.urls'), namespace='game')),
    path('', include(('game.urls', 'game'), namespace='game')),
]