from rest_framework import serializers
from .models import Asset

class AssetSerializer(serializers.ModelSerializer):
    # Field to hold the file URL after upload
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = ('id', 'file', 'name', 'description', 'category', 'tags', 'uploaded_by', 'uploaded_at', 'file_url')
        read_only_fields = ('uploaded_by', 'uploaded_at', 'file_url')

    def get_file_url(self, obj):
        # The frontend needs a way to download the file
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None