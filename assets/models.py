import uuid
from django.db import models


class AssetCategory(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100)

    def __str__(self):
        return self.category_name


class Tag(models.Model):
    tag_id = models.AutoField(primary_key=True)
    tag_name = models.CharField(max_length=50)

    def __str__(self):
        return self.tag_name


class Asset(models.Model):
    asset_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True, null=True)
    file_extension = models.CharField(max_length=10, blank=True, null=True)
    storage_path = models.CharField(max_length=512, blank=True, null=True)
    file_size_bytes = models.BigIntegerField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    uploader_id = models.IntegerField()
    category = models.ForeignKey(AssetCategory, on_delete=models.SET_NULL, null=True)
    is_deleted = models.BooleanField(default=False)
    tags = models.ManyToManyField('Tag', through='AssetTag', related_name='assets')

    def __str__(self):
        return self.asset_name


class AssetTag(models.Model):
    asset_tag_id = models.AutoField(primary_key=True)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.asset.asset_name} - {self.tag.tag_name}"
