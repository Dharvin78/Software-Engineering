from django.contrib import admin
from .models import Asset

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'size', 'uploader_id', 'is_deleted', 'timestamp')
    list_filter = ('category', 'is_deleted')
    search_fields = ('name', 'category', 'description')
