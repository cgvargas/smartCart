"""
SmartCart Shopping Admin
"""

from django.contrib import admin
from .models import ShoppingList, ShoppingItem


class ShoppingItemInline(admin.TabularInline):
    """Inline for showing items in list"""
    model = ShoppingItem
    extra = 0
    readonly_fields = ['subtotal', 'created_at']
    
    def subtotal(self, obj):
        return f"R$ {obj.subtotal:.2f}"


@admin.register(ShoppingList)
class ShoppingListAdmin(admin.ModelAdmin):
    """Admin for ShoppingList model"""
    
    list_display = [
        'user',
        'name',
        'planned_budget',
        'total_spent',
        'budget_percentage',
        'status',
        'items_count',
        'created_at',
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'name']
    ordering = ['-created_at']
    
    readonly_fields = ['total_spent', 'created_at', 'updated_at', 'completed_at']
    inlines = [ShoppingItemInline]
    
    def budget_percentage(self, obj):
        return f"{obj.budget_percentage}%"
    budget_percentage.short_description = '% Usado'


@admin.register(ShoppingItem)
class ShoppingItemAdmin(admin.ModelAdmin):
    """Admin for ShoppingItem model"""
    
    list_display = [
        'name',
        'shopping_list',
        'unit_price',
        'quantity',
        'subtotal_display',
        'is_checked',
        'created_at',
    ]
    list_filter = ['is_checked', 'created_at']
    search_fields = ['name', 'shopping_list__name']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at']
    
    def subtotal_display(self, obj):
        return f"R$ {obj.subtotal:.2f}"
    subtotal_display.short_description = 'Subtotal'
