from rest_framework import generics
from .models import Asset
from .serializers import AssetSerializer

class AssetListView(generics.ListAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
