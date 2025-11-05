from django.db import models
from django.contrib.auth.models import User

class Asset(models.Model):
    ASSET_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_type = models.CharField(max_length=20, choices=ASSET_TYPES, default='other')
    tags = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='assets/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    uploaded_by = models.ForeignKey(User, related_name='uploaded_assets', null=True, blank=True, on_delete=models.SET_NULL)
    modified_by = models.ForeignKey(User, related_name='modified_assets', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.title