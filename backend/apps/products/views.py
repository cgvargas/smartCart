"""
SmartCart Products Views
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, PriceHistory
from .serializers import (
    ProductSerializer,
    ProductSummarySerializer,
    PriceHistorySerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations
    """
    
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductSummarySerializer
        return ProductSerializer
    
    def get_queryset(self):
        """Return only user's products"""
        queryset = Product.objects.filter(user=self.request.user)
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        # Filter favorites
        favorites_only = self.request.query_params.get('favorites')
        if favorites_only == 'true':
            queryset = queryset.filter(is_favorite=True)
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """
        GET /api/products/favorites/
        Get favorite products
        """
        favorites = self.get_queryset().filter(is_favorite=True)
        serializer = ProductSummarySerializer(favorites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def frequent(self, request):
        """
        GET /api/products/frequent/
        Get most frequently purchased products
        """
        frequent = self.get_queryset().order_by('-times_purchased')[:10]
        serializer = ProductSummarySerializer(frequent, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """
        POST /api/products/{id}/toggle_favorite/
        Toggle product favorite status
        """
        product = self.get_object()
        product.is_favorite = not product.is_favorite
        product.save()
        
        return Response(ProductSerializer(product).data)
    
    @action(detail=True, methods=['post'])
    def add_price(self, request, pk=None):
        """
        POST /api/products/{id}/add_price/
        Add a new price record to product history
        """
        product = self.get_object()
        
        price = request.data.get('price')
        store_name = request.data.get('store_name', '')
        
        try:
            price = float(price)
            if price <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            return Response(
                {'error': 'Preço inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create price history record
        PriceHistory.objects.create(
            product=product,
            price=price,
            store_name=store_name,
        )
        
        # Update last price
        product.last_price = price
        product.save()
        
        return Response(ProductSerializer(product).data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        GET /api/products/categories/
        Get list of unique categories
        """
        categories = self.get_queryset().values_list(
            'category', flat=True
        ).distinct().exclude(category='')
        
        return Response(list(categories))
