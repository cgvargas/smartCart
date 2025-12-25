"""
SmartCart Payments Serializers
"""

from rest_framework import serializers
from .models import PaymentMethod


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for PaymentMethod model"""
    
    payment_type_display = serializers.CharField(
        source='get_payment_type_display',
        read_only=True,
    )
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id',
            'payment_type',
            'payment_type_display',
            'name',
            'available_amount',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_available_amount(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'O valor disponível deve ser maior ou igual a zero.'
            )
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
