from django.contrib import admin
from .models import Asset, Tag, AssetTag

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('asset_id', 'asset_name', 'file_type', 'upload_date', 'uploader_id', 'category', 'is_deleted')
    search_fields = ('asset_name', 'file_type', 'category__name')
    list_filter = ('file_type', 'upload_date', 'category')
    ordering = ('-upload_date',)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('tag_id', 'tag_name')
    search_fields = ('tag_name',)


@admin.register(AssetTag)
class AssetTagAdmin(admin.ModelAdmin):
    list_display = ('asset_tag_id', 'asset', 'tag')
