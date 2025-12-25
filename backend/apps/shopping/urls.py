"""
SmartCart Shopping URLs
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import ShoppingListViewSet, ShoppingItemViewSet

app_name = 'shopping'

# Main router for shopping lists
router = DefaultRouter()
router.register('', ShoppingListViewSet, basename='shopping')

# Nested router for items within a shopping list
shopping_router = routers.NestedDefaultRouter(router, '', lookup='shopping_list')
shopping_router.register('items', ShoppingItemViewSet, basename='shopping-items')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(shopping_router.urls)),
]
