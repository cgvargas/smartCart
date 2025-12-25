"""
SmartCart Payments Admin
"""

from django.contrib import admin
from .models import PaymentMethod


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    """Admin for PaymentMethod model"""
    
    list_display = [
        'user',
        'payment_type',
        'name',
        'available_amount',
        'is_active',
        'created_at',
    ]
    list_filter = ['payment_type', 'is_active', 'created_at']
    search_fields = ['user__email', 'name']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at']
