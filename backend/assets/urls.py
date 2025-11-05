from django.urls import path
from .views import (
    register, 
    login, 
    logout, 
    user_profile,
    AssetSearchView,
    AssetFilterOptionsView,
    AssetQuickSearchView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/profile/', user_profile, name='profile'),
    
    # Search endpoints
    path('search/', AssetSearchView.as_view(), name='asset-search'),
    path('quick-search/', AssetQuickSearchView.as_view(), name='asset-quick-search'),
    path('filter-options/', AssetFilterOptionsView.as_view(), name='asset-filter-options'),
]