from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Asset
from django.contrib.auth.models import User

User = get_user_model()

# -------------------------
# User Serializer
# -------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "role", "is_active", "is_staff", "date_joined")
# -------------------------
# JWT Login Serializer (Email-based)
# -------------------------
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        # Authenticate using email
        user = authenticate(self.context['request'], username=email, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        # Use parent to generate tokens
        data = super().validate({'username': user.username, 'password': password})

        # Add user info in response
        data['user'] = UserSerializer(user).data

        # Update last login
        update_last_login(None, user)
        return data

# -------------------------
# Signup Serializer
# -------------------------
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

# -------------------------
# Password Reset Serializers
# -------------------------
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

# -------------------------
# Asset Serializer
# -------------------------
class AssetSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True) 
    tags = serializers.CharField(required=False, allow_blank=True)
    file_size = serializers.IntegerField(read_only=True)  # mark read-only

    class Meta:
        model = Asset
        fields = (
            "id",
            "name",
            "description",
            "file",
            "category",
            "tags",
            "file_size",
            "uploaded_by",
            "uploaded_at",
        )
        read_only_fields = ("uploaded_by", "uploaded_at", "file_size")  # add file_size here too

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email") 

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError
        return value