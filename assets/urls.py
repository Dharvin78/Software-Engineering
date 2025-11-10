from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, AssetCategoryViewSet, TagViewSet

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'categories', AssetCategoryViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = router.urls
