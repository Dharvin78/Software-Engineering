from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from .models import Asset, AssetCategory, Tag
from .serializers import (
    AssetSerializer,
    AssetCreateSerializer,
    AssetCategorySerializer,
    TagSerializer,
)


# ---------------- REST API ViewSets ----------------
class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.filter(is_deleted=False)
    serializer_class = AssetSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AssetCreateSerializer
        return AssetSerializer

    def destroy(self, request, *args, **kwargs):
        asset = self.get_object()
        asset.is_deleted = True
        asset.save()
        return Response({'message': 'Asset marked as deleted'}, status=status.HTTP_200_OK)


class AssetCategoryViewSet(viewsets.ModelViewSet):
    queryset = AssetCategory.objects.all()
    serializer_class = AssetCategorySerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


# ---------------- HTML Views (Simple Upload + Listing) ----------------
@login_required
def upload_asset(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')
        desc = request.POST.get('description', '')

        if uploaded_file:
            asset = Asset.objects.create(
                asset_name=uploaded_file.name,
                description=desc,
                file_type=uploaded_file.content_type,
                file_size_bytes=uploaded_file.size,
                uploader_id=request.user.id,  # Use ID since model uses uploader_id field
                storage_path=f"uploads/{uploaded_file.name}",  # Save file path
            )
            asset.save()

            # Save file physically in media/uploads/
            with open(f"media/uploads/{uploaded_file.name}", 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            return redirect('asset_list')

    return render(request, 'assets/upload_asset.html')


@login_required
def asset_list(request):
    # Admin sees all assets; users only their own uploads
    if request.user.is_superuser:
        assets = Asset.objects.filter(is_deleted=False)
    else:
        assets = Asset.objects.filter(uploader_id=request.user.id, is_deleted=False)

    return render(request, 'assets/asset_list.html', {'assets': assets})
