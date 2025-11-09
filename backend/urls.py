from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from .views_auth import LoginView, SignupView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.asset_list, name='asset_list'),
    path('assets/', include('assets.urls')),
    path('accounts/', include('django.contrib.auth.urls')), 
    path('api/login/', LoginView.as_view(), name='api_login'),
    path('api/signup/', SignupView.as_view(), name='api_signup'),
]
