"""
SmartCart Products Serializers
"""

from rest_framework import serializers
from .models import Product, PriceHistory


class PriceHistorySerializer(serializers.ModelSerializer):
    """Serializer for PriceHistory model"""
    
    class Meta:
        model = PriceHistory
        fields = [
            'id',
            'price',
            'store_name',
            'recorded_at',
        ]
        read_only_fields = ['id', 'recorded_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    
    price_history = PriceHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'barcode',
            'last_price',
            'category',
            'image',
            'times_purchased',
            'is_favorite',
            'price_history',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'times_purchased', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProductSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for product lists"""
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'last_price',
            'category',
            'times_purchased',
            'is_favorite',
        ]
