from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("dog_territory_battle_game.api_urls")),  # API用のURLを別ファイルに分離
    path(
        "", TemplateView.as_view(template_name="index.html"), name="home"
    ),  # Reactアプリを提供
    path("list_folder", include("file_viewer.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
