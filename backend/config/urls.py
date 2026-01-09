"""
SmartCart URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from apps.accounts.serializers import EmailTokenObtainPairSerializer


# Custom token view that uses email instead of username
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # JWT Authentication (using email instead of username)
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Apps
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/shopping/', include('apps.shopping.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
