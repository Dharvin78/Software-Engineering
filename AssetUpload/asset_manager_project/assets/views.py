from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db.models import Sum
from .models import Asset
from .serializers import AssetSerializer

User = get_user_model()

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by('-uploaded_at')
    serializer_class = AssetSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated uploads for now

    def perform_create(self, serializer):
        # Calculate file size from uploaded file
        uploaded_file = self.request.FILES.get('file')
        file_size = uploaded_file.size if uploaded_file else 0
        
        # If user is authenticated, use that user, otherwise use admin
        if self.request.user.is_authenticated:
            serializer.save(uploaded_by=self.request.user, file_size=file_size)
        else:
            # Get or create a default admin user for unauthenticated uploads
            admin_user = User.objects.filter(is_superuser=True).first()
            if admin_user:
                serializer.save(uploaded_by=admin_user, file_size=file_size)
            else:
                # Create a default user if no admin exists
                default_user = User.objects.get_or_create(username='system', defaults={'is_staff': True})[0]
                serializer.save(uploaded_by=default_user, file_size=file_size)

    def list(self, request, *args, **kwargs):
        # Show all assets (not filtered by user for now)
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def storage_stats(self, request):
        """Return storage usage statistics"""
        total_size = Asset.objects.aggregate(total=Sum('file_size'))['total'] or 0
        total_count = Asset.objects.count()
        
        # Convert bytes to more readable format
        def format_size(bytes_size):
            if bytes_size >= 1024**3:  # GB
                return f"{bytes_size / (1024**3):.1f}GB"
            elif bytes_size >= 1024**2:  # MB
                return f"{bytes_size / (1024**2):.1f}MB"
            elif bytes_size >= 1024:  # KB
                return f"{bytes_size / 1024:.1f}KB"
            else:
                return f"{bytes_size}B"
        
        # Set storage limit (250GB in bytes)
        storage_limit = 250 * 1024**3  # 250GB
        
        return Response({
            'total_size_bytes': total_size,
            'total_size_formatted': format_size(total_size),
            'storage_limit_bytes': storage_limit,
            'storage_limit_formatted': format_size(storage_limit),
            'usage_percentage': (total_size / storage_limit * 100) if storage_limit > 0 else 0,
            'total_files': total_count
        })