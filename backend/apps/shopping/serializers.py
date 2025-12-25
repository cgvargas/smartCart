"""
SmartCart Shopping Serializers
"""

from rest_framework import serializers
from .models import ShoppingList, ShoppingItem
from apps.payments.serializers import PaymentMethodSerializer


class ShoppingItemSerializer(serializers.ModelSerializer):
    """Serializer for ShoppingItem model"""
    
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    
    class Meta:
        model = ShoppingItem
        fields = [
            'id',
            'name',
            'unit_price',
            'quantity',
            'subtotal',
            'image',
            'notes',
            'is_checked',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'subtotal', 'created_at', 'updated_at']
    
    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'O preço unitário deve ser maior que zero.'
            )
        return value
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'A quantidade deve ser maior que zero.'
            )
        return value


class ShoppingListSerializer(serializers.ModelSerializer):
    """Serializer for ShoppingList model"""
    
    items = ShoppingItemSerializer(many=True, read_only=True)
    remaining_budget = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    budget_percentage = serializers.FloatField(read_only=True)
    items_count = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True,
    )
    payment_methods_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    
    class Meta:
        model = ShoppingList
        fields = [
            'id',
            'name',
            'planned_budget',
            'total_spent',
            'remaining_budget',
            'budget_percentage',
            'status',
            'status_display',
            'payment_methods',
            'payment_methods_ids',
            'items',
            'items_count',
            'notes',
            'created_at',
            'updated_at',
            'completed_at',
        ]
        read_only_fields = [
            'id',
            'total_spent',
            'remaining_budget',
            'budget_percentage',
            'items_count',
            'created_at',
            'updated_at',
            'completed_at',
        ]
    
    def validate_planned_budget(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'O orçamento deve ser maior ou igual a zero.'
            )
        return value
    
    def create(self, validated_data):
        payment_methods_ids = validated_data.pop('payment_methods_ids', [])
        validated_data['user'] = self.context['request'].user
        
        shopping_list = super().create(validated_data)
        
        if payment_methods_ids:
            from apps.payments.models import PaymentMethod
            payment_methods = PaymentMethod.objects.filter(
                id__in=payment_methods_ids,
                user=self.context['request'].user,
                is_active=True,
            )
            shopping_list.payment_methods.set(payment_methods)
        
        return shopping_list


class ShoppingListSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    
    items_count = serializers.IntegerField(read_only=True)
    budget_percentage = serializers.FloatField(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True,
    )
    
    class Meta:
        model = ShoppingList
        fields = [
            'id',
            'name',
            'planned_budget',
            'total_spent',
            'budget_percentage',
            'status',
            'status_display',
            'items_count',
            'created_at',
        ]
