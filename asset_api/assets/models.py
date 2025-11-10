from django.db import models

class Asset(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    size = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    uploader_id = models.IntegerField()
    is_deleted = models.BooleanField(default=False)
    storage_path = models.CharField(max_length=255)

    def __str__(self):
        return self.name
