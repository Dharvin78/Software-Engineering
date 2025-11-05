from rest_framework import serializers
from .models import Asset

class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField()
    modified_by = serializers.StringRelatedField()

    class Meta:
        model = Asset
        fields = [
            'id', 'title', 'description', 'file_type', 'tags', 'file', 
            'uploaded_at', 'uploaded_by', 'modified_by'
        ]