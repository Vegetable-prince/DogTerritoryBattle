from rest_framework import viewsets
from ..models import DogType
from ..serializers import DogTypeSerializer


class DogTypeViewSet(viewsets.ModelViewSet):
    """
    犬の種類のCRUD操作を提供するViewSet。
    """

    queryset = DogType.objects.all()
    serializer_class = DogTypeSerializer
