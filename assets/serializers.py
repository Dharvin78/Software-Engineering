from rest_framework import serializers
from .models import Asset, AssetCategory, Tag, AssetTag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['tag_id', 'tag_name']


class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = ['category_id', 'category_name']


class AssetSerializer(serializers.ModelSerializer):
    category = AssetCategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'


class AssetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'asset_name', 'description', 'file_type', 'file_extension',
            'storage_path', 'file_size_bytes', 'uploader_id',
            'category', 'is_deleted'
        ]
