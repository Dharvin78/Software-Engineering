import os
import mimetypes
from django.http import FileResponse
from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, BasePermission
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from uuid import UUID
from django.db.models import Q
from .models import Asset, User
from .serializers import UserSerializer, SignupSerializer, AssetSerializer, ProductSerializer, ProfileUpdateSerializer

User = get_user_model()

# -------------------- JWT Login using Email --------------------
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        if not email or not password:
            raise AuthenticationFailed("Email and password required")
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid credentials")
        user = authenticate(username=user_obj.username, password=password)
        if not user:
            raise AuthenticationFailed("Invalid credentials")
        # Call parent with username/password to create tokens
        data = super().validate({"username": user.username, "password": password})
        data["user"] = UserSerializer(user).data
        return data

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

# -------------------- Signup --------------------
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------- Current User --------------------
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# -------------------- Password Reset Request --------------------
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)

        uidb64 = urlsafe_base64_encode(force_bytes(user.id))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset_password?uidb64={uidb64}&token={token}"

        send_mail(
            "Password Reset Request",
            f"Hello {user.username},\n\nReset your password using this link:\n{reset_link}\n\nIf you did not request this, ignore this email.",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({"message": "Password reset link has been sent to your email."})

# -------------------- Password Reset Confirm --------------------
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uidb64")
        token = request.data.get("token")
        password = request.data.get("password")

        if not uidb64 or not token or not password:
            return Response({"error": "uidb64, token, and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Invalid link"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()
        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)

# ---------------- Custom Permissions ----------------
class IsEditorOrAdmin(BasePermission):
    """Allow access only to editor or admin users."""
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'editor']


# ---------------- AssetViewSet ----------------
class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by('-uploaded_at')
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        serializer.save(
            uploaded_by=self.request.user,
            file_size=file_obj.size if file_obj else 0
        )

    @action(detail=False, methods=['get'], url_path='filter-options')
    def filter_options(self, request):
        # Tags
        all_tags = Asset.objects.values_list('tags', flat=True)
        tags_set = set()
        for tag_str in all_tags:
            if tag_str:
                tags_set.update([t.strip() for t in tag_str.split(',')])
        tags = list(tags_set)
        categories = list(Asset.objects.values_list('category', flat=True).distinct())
        users = list(User.objects.values('username', 'role','id'))

        return Response({'tag': tags, 'users': users})

    @action(detail=False, methods=['get'], url_path='search')
    def search_assets(self, request):
        qs = self.queryset
        user = request.user
        keyword = request.query_params.get('keyword')
        category = request.query_params.get('category')
        tags = request.query_params.get('tag')
        selected_user = request.query_params.get('user')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        # Keyword
        if keyword:
            qs = qs.filter(Q(name__icontains=keyword) | Q(description__icontains=keyword))
        # Category
        if category == 'all' or category is None:
            qs = Asset.objects.all()  
        else:
            qs = Asset.objects.filter(category=category)

        # Tags
        if tags:
            tag_list = [t.strip() for t in tags.split(',')]
            tag_filter = Q()
            for t in tag_list:
                tag_filter |= Q(tags__icontains=t)
            qs = qs.filter(tag_filter)
        # Date filters
        if date_from:
            qs = qs.filter(uploaded_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(uploaded_at__date__lte=date_to)

        # Role-based access
        if selected_user:
            qs = qs.filter(uploaded_by__username=selected_user)

        serializer = self.get_serializer(qs, many=True)
        return Response({'results': serializer.data})
    
    @action(detail=True, methods=['get'], url_path='download')
    def download_asset(self, request, pk=None):
        try:
            asset = self.get_object()
            file_path = asset.file.path

            if not os.path.exists(file_path):
                return Response({'detail': 'File does not exist'}, status=404)

            f = open(file_path, 'rb')
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'

            response = FileResponse(f, content_type=mime_type)
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response

        except Exception as e:
            print("❌ Download error:", str(e))
            return Response({'detail': str(e)}, status=500)
    
    @action(detail=True, methods=['get'], url_path='preview')
    def preview_asset(self, request, pk=None):
        try:
            asset = self.get_object()
            file_path = asset.file.path

            if not os.path.exists(file_path):
                return Response({'detail': 'File does not exist'}, status=404)

            f = open(file_path, 'rb')
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'

            response = FileResponse(f, content_type=mime_type)
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
            return response

        except Exception as e:
            print("❌ Preview error:", str(e))
            return Response({'detail': str(e)}, status=500)


# ---------------- Storage Stats ----------------
class StorageStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_size = sum(a.file.size for a in Asset.objects.all() if a.file)
        storage_limit = 250 * 1024 * 1024 * 1024
        usage_percentage = round((total_size / storage_limit) * 100, 2)
        return Response({
            "total_size_formatted": f"{total_size // (1024*1024)} MB",
            "storage_limit_formatted": "250 GB",
            "usage_percentage": usage_percentage
        })

# ---------------- UserViewSet ----------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]  # Only admin

    @action(detail=True, methods=['patch'], url_path='change-role')
    def change_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('role')
        if new_role not in ['admin', 'editor', 'viewer', 'user']:
            return Response({'detail': 'Invalid role'}, status=400)
        if user == request.user and new_role != 'admin':
            return Response({'detail': 'Cannot remove your own admin role'}, status=403)
        user.role = new_role
        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': 'Cannot deactivate yourself'}, status=403)
        user.is_active = not user.is_active
        user.save()
        return Response(UserSerializer(user).data)

# ---------------- Product / Metadata ----------------
class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    queryset = Asset.objects.all().order_by('-uploaded_at') 

    def partial_update(self, request, *args, **kwargs):
        asset = self.get_object()
        user = request.user

        # Only admin/editor can update
        if user.role not in ['admin', 'editor']:
            return Response({'detail': 'Permission denied'}, status=403)

        serializer = AssetSerializer(asset, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # Override destroy to allow delete only for admin/editor
    def destroy(self, request, *args, **kwargs):
        asset = self.get_object()
        user = request.user
        if user.role not in ['admin', 'editor']:
            return Response({'detail': 'Permission denied'}, status=403)
        asset.delete()
        return Response({'detail': 'Deleted successfully'})

class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"message": "Profile updated successfully",
        "data": serializer.data},status=200)  
        