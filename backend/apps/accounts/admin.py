"""
SmartCart Accounts Admin
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    
    list_display = [
        'email',
        'username',
        'first_name',
        'last_name',
        'alert_percentage',
        'is_active',
        'created_at',
    ]
    list_filter = ['is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('SmartCart Settings', {
            'fields': ('phone', 'alert_percentage'),
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('SmartCart Settings', {
            'fields': ('email', 'phone', 'alert_percentage'),
        }),
    )
