from django.urls import path
from .views import AssetListView

urlpatterns = [
    path('products/', AssetListView.as_view(), name='asset-list'),
]
