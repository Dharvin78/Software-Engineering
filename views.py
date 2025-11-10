# backend/assets/views.py
from rest_framework import serializers
from rest_framework import generics, viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.db.models import Q
import json
from django.contrib.auth.forms import PasswordResetForm
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

# --- UPDATED IMPORTS ---
from .models import Asset, AssetCategory, AssetTag
from .serializers import (
    AssetSerializer, 
    AssetCreateUpdateSerializer,
    UserSerializer, 
    TagSerializer,
    AssetCategorySerializer
)
# -------------------------
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# ============================================================================
# AUTHENTICATION & USER ENDPOINTS (Unchanged)
# ============================================================================

# The 'register', 'login', 'logout', 'user_profile', and 'UserViewSet' views
# are all correct and do not need to be changed. I am omitting them here
# for brevity, but you should KEEP THEM in your file.

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # ... (code is unchanged)
    try:
        data = json.loads(request.body)
        username, email, password = data.get('username'), data.get('email'), data.get('password')
        if not all([username, email, password]):
            return Response({'error': 'Username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, email=email, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'message': 'User registered successfully', 'user_id': user.id, 'username': user.username, 'email': user.email, 'token': token.key, 'is_superuser': user.is_superuser}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    # ... (code is unchanged)
    try:
        data = json.loads(request.body)
        username, password = data.get('username'), data.get('password')
        if not all([username, password]):
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'message': 'Login successful', 'user_id': user.id, 'username': user.username, 'email': user.email, 'token': token.key, 'is_superuser': user.is_superuser}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    # ... (code is unchanged)
    request.user.auth_token.delete()
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    # ... (code is unchanged)
    user = request.user
    return Response({'user_id': user.id, 'username': user.username, 'email': user.email})

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal that the user does not exist
        return Response({"status": "password reset email sent"}, status=status.HTTP_200_OK)

    # Use Django's built-in PasswordResetForm to do the heavy lifting
    form = PasswordResetForm(request.data)
    if form.is_valid():
        opts = {
            "use_https": request.is_secure(),
            "token_generator": default_token_generator,
            "from_email": settings.DEFAULT_FROM_EMAIL,
            "email_template_name": "registration/password_reset_email.html",
            "subject_template_name": "registration/password_reset_subject.txt",
            "request": request,
        }
        # This will generate the email and print it to your console
        form.save(**opts)
        
    return Response({"status": "password reset email sent"}, status=status.HTTP_200_OK)
class UserViewSet(viewsets.ModelViewSet):
    # ... (code is unchanged)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object(); user.is_active = True; user.save(); return Response({'status': 'user activated'})
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object(); user.is_active = False; user.save(); return Response({'status': 'user deactivated'})
    @action(detail=True, methods=['post'], url_path='set-role')
    def set_role(self, request, pk=None):
        """
        Sets the role (group) for a user. Expects {'group': 'GroupName'} in the request body.
        """
        user = self.get_object()
        group_name = request.data.get('group')

        if not group_name:
            return Response({'error': 'A "group" field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_group = Group.objects.get(name=group_name)
        except Group.DoesNotExist:
            return Response({'error': f'Group "{group_name}" does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        # Safety check: prevent changing the role of a superuser
        if user.is_superuser:
            return Response({'error': 'Cannot change the role of a superuser.'}, status=status.HTTP_403_FORBIDDEN)

        # Clear existing groups and add the new one
        user.groups.clear()
        user.groups.add(new_group)

        # Return the updated user data
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ============================================================================
# ASSET ENDPOINTS (Completely Rewritten)
# ============================================================================

class AssetViewSet(viewsets.ModelViewSet):
    """
    A full ViewSet for viewing, creating, updating and deleting Assets.
    """
    queryset = Asset.objects.all().order_by('-uploaded_at')
    permission_classes = [IsAuthenticated] # All asset actions require login

    def get_serializer_class(self):
        # Use the simple serializer for writing (create/update)
        if self.action in ['create', 'update', 'partial_update']:
            return AssetCreateUpdateSerializer
        # Use the detailed serializer for reading (list/retrieve)
        return AssetSerializer

    def perform_create(self, serializer):
        # Automatically set the uploader to the current user
        serializer.save(uploaded_by=self.request.user, modified_by=self.request.user)

    def perform_update(self, serializer):
        # Automatically set the modifier to the current user
        serializer.save(modified_by=self.request.user)


class AssetSearchView(generics.ListAPIView):
    """
    The main search view, now with updated filtering logic.
    """
    serializer_class = AssetSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Asset.objects.all()

        # Keyword search
        keyword = self.request.query_params.get('keyword', '').strip()
        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) | 
                Q(description__icontains=keyword) |
                Q(tags__name__icontains=keyword) | # <-- UPDATED: Search in tag names
                Q(file__icontains=keyword)
            )
        
        # User-based filtering
        user_param = self.request.query_params.get('user', '').strip()
        if user_param:
            queryset = queryset.filter(modified_by__username__icontains=user_param)
        
        # Tag-based filtering
        tag_param = self.request.query_params.get('tag', '').strip()
        if tag_param:
            tag_names = [t.strip() for t in tag_param.split(',') if t.strip()]
            # <-- UPDATED: Filter by tag names in the many-to-many relationship
            queryset = queryset.filter(tags__name__in=tag_names)
        
        # Asset type filtering
        file_type = self.request.query_params.get('file_type', '').strip()
        if file_type:
            queryset = queryset.filter(file_type=file_type)

        # Category filtering
        category_id = self.request.query_params.get('category', '').strip()
        if category_id:
            queryset = queryset.filter(category__id=category_id)

        # Date range filtering
        date_from = self.request.query_params.get('date_from', '').strip()
        if date_from:
            queryset = queryset.filter(uploaded_at__date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to', '').strip()
        if date_to:
            queryset = queryset.filter(uploaded_at__date__lte=date_to)
        
        # Use .distinct() to avoid duplicates when filtering across relationships
        return queryset.distinct().order_by('-uploaded_at')


class AssetFilterOptionsView(generics.GenericAPIView):
    """
    Provides the frontend with all available filter options.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # <-- UPDATED: Get tags and categories from their respective models
        all_tags = AssetTag.objects.all().order_by('name')
        all_categories = AssetCategory.objects.all().order_by('name')

        user_ids = Asset.objects.exclude(modified_by__isnull=True).values_list('modified_by_id', flat=True).distinct()
        users = User.objects.filter(id__in=user_ids).values_list('username', flat=True).order_by('username')
        
        asset_types = [
            {'value': 'image', 'label': 'Image'},
            {'value': 'video', 'label': 'Video'},
            {'value': 'document', 'label': 'Document'},
            {'value': 'other', 'label': 'Other'},
        ]

        data = {
            'tags': TagSerializer(all_tags, many=True).data,
            'categories': AssetCategorySerializer(all_categories, many=True).data,
            'users': sorted(list(users)),
            'asset_types': asset_types,
        }
        
        return Response(data)

class AssetCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing asset categories.
    """
    queryset = AssetCategory.objects.all()
    serializer_class = AssetCategorySerializer
    permission_classes = [IsAuthenticated] # Only logged-in users can see/edit

class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing tags.
    """
    queryset = AssetTag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated] # Only logged-in users can see/edit