"""
SmartCart Payments URLs
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentMethodViewSet

app_name = 'payments'

router = DefaultRouter()
router.register('', PaymentMethodViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
