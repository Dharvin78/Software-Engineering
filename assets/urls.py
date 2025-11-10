from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AssetViewSet,
    SignupView,
    CurrentUserView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    EmailTokenObtainPairView,  
    StorageStatsView,
    ProfileUpdateView,
    UserViewSet,
    ProductViewSet,
)
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register("assets", AssetViewSet, basename="assets")
router.register(r'users', UserViewSet, basename='user')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("current-user/", CurrentUserView.as_view(), name="current-user"),
    path("password-reset-request/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("api/token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),  
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('assets/storage_stats/', StorageStatsView.as_view(), name='storage-stats'),
    path('users/me/', ProfileUpdateView.as_view(), name='profile-update'),
    path("", include(router.urls)),
]