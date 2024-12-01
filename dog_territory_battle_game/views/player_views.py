from rest_framework import viewsets
from ..models import Player
from ..serializers import PlayerSerializer

class PlayerViewSet(viewsets.ModelViewSet):
    """
    プレイヤーのCRUD操作を提供するViewSet。
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    