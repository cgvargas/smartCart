"""
SmartCart Products Admin
"""

from django.contrib import admin
from .models import Product, PriceHistory


class PriceHistoryInline(admin.TabularInline):
    """Inline for showing price history"""
    model = PriceHistory
    extra = 0
    readonly_fields = ['recorded_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin for Product model"""
    
    list_display = [
        'name',
        'user',
        'last_price',
        'category',
        'times_purchased',
        'is_favorite',
        'updated_at',
    ]
    list_filter = ['category', 'is_favorite', 'created_at']
    search_fields = ['name', 'barcode', 'user__email']
    ordering = ['-times_purchased']
    
    readonly_fields = ['times_purchased', 'created_at', 'updated_at']
    inlines = [PriceHistoryInline]


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    """Admin for PriceHistory model"""
    
    list_display = [
        'product',
        'price',
        'store_name',
        'recorded_at',
    ]
    list_filter = ['recorded_at', 'store_name']
    search_fields = ['product__name']
    ordering = ['-recorded_at']
