from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Asset(models.Model):
    # This stores the file itself. `upload_to` defines the sub-directory
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50) # Image, PDF, Video, Document, Other
    tags = models.CharField(max_length=255, blank=True, help_text="Comma separated tags")
    file_size = models.BigIntegerField(help_text="File size in bytes")
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Run migrations
# python manage.py makemigrations assets
# python manage.py migrate