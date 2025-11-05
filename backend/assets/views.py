# backend/assets/views.py

from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.db.models import Q
import json

from .models import Asset
from .serializers import AssetSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# ============================================================================
# AUTHENTICATION ENDPOINTS (Unchanged)
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # ... (code is unchanged)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        if not username or not email or not password:
            return Response({'error': 'Username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password)
        token, created = Token.objects.get_or_create(user=user)
        return Response({'message': 'User registered successfully', 'user_id': user.id, 'username': user.username, 'email': user.email, 'token': token.key}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    # ... (code is unchanged)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        token, created = Token.objects.get_or_create(user=user)
        return Response({'message': 'Login successful', 'user_id': user.id, 'username': user.username, 'email': user.email, 'token': token.key}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    # ... (code is unchanged)
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    # ... (code is unchanged)
    user = request.user
    return Response({'user_id': user.id, 'username': user.username, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name,}, status=status.HTTP_200_OK)


# ============================================================================
# SEARCH ENDPOINTS (Updated)
# ============================================================================

class AssetSearchView(generics.ListAPIView):
    serializer_class = AssetSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Asset.objects.all()
        
        # Keyword search (title, description, tags, filename)
        keyword = self.request.query_params.get('keyword', '').strip()
        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) | 
                Q(description__icontains=keyword) |
                Q(tags__icontains=keyword) |
                Q(file__icontains=keyword)
            )
        
        # User-based filtering
        user_param = self.request.query_params.get('user', '').strip()
        if user_param:
            queryset = queryset.filter(modified_by__username__icontains=user_param)
        
        # Tag-based filtering
        tag_param = self.request.query_params.get('tag', '').strip()
        if tag_param:
            tags = [t.strip() for t in tag_param.split(',') if t.strip()]
            for tag in tags:
                queryset = queryset.filter(tags__icontains=tag)
        
        # Asset type filtering
        file_type = self.request.query_params.get('file_type', '').strip()
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        
        # Date range filtering
        date_from = self.request.query_params.get('date_from', '').strip()
        date_to = self.request.query_params.get('date_to', '').strip()
        
        if date_from:
            try:
                from django.utils.dateparse import parse_date
                from_date = parse_date(date_from)
                if from_date:
                    queryset = queryset.filter(uploaded_at__date__gte=from_date)
            except (ValueError, TypeError): pass
        
        if date_to:
            try:
                from django.utils.dateparse import parse_date
                to_date = parse_date(date_to)
                if to_date:
                    queryset = queryset.filter(uploaded_at__date__lte=to_date)
            except (ValueError, TypeError): pass
        
        queryset = queryset.distinct().order_by('-uploaded_at')
        return queryset


class AssetFilterOptionsView(generics.GenericAPIView):
    def get(self, request):
        queryset = Asset.objects.all()
        
        all_tags = set()
        for asset in queryset.values_list('tags', flat=True):
            if asset:
                tags = [tag.strip() for tag in asset.split(',') if tag.strip()]
                all_tags.update(tags)
        
        asset_types = [
            {'value': 'image', 'label': 'Image'},
            {'value': 'video', 'label': 'Video'},
            {'value': 'document', 'label': 'Document'},
            {'value': 'other', 'label': 'Other'},
        ]
        
        earliest_asset = queryset.order_by('uploaded_at').first()
        latest_asset = queryset.order_by('-uploaded_at').first()
        
        # Get all users who have modified at least one asset
        user_ids = Asset.objects.exclude(modified_by__isnull=True).values_list('modified_by_id', flat=True).distinct()
        users = User.objects.filter(id__in=user_ids).values_list('username', flat=True)

        data = {
            'tags': sorted(list(all_tags)),
            'asset_types': asset_types,
            'date_range': {
                'earliest': earliest_asset.uploaded_at if earliest_asset else None,
                'latest': latest_asset.uploaded_at if latest_asset else None,
            },
            'users': sorted(list(users)),
            'total_assets': queryset.count(),
        }
        
        return Response(data)


class AssetQuickSearchView(generics.GenericAPIView):
    serializer_class = AssetSerializer
    
    def get(self, request):
        # ... (code is unchanged)
        query = request.query_params.get('q', '').strip()
        if len(query) < 2:
            return Response({'results': [], 'message': 'Minimum 2 characters required for search', 'query_length': len(query)}, status=status.HTTP_400_BAD_REQUEST)
        queryset = Asset.objects.filter(Q(title__icontains=query) | Q(description__icontains=query) | Q(tags__icontains=query)).order_by('-uploaded_at')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data), 'query': query})