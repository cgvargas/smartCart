"""
SmartCart Shopping Views
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import ShoppingList, ShoppingItem
from .serializers import (
    ShoppingListSerializer,
    ShoppingListSummarySerializer,
    ShoppingItemSerializer,
)


class ShoppingListViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ShoppingList CRUD operations
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ShoppingListSummarySerializer
        return ShoppingListSerializer
    
    def get_queryset(self):
        """Return only user's shopping lists"""
        queryset = ShoppingList.objects.filter(user=self.request.user)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        GET /api/shopping/active/
        Get current active shopping list
        """
        active_list = self.get_queryset().filter(status='active').first()
        
        if not active_list:
            return Response(
                {'message': 'Nenhuma lista ativa encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ShoppingListSerializer(active_list)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        GET /api/shopping/history/
        Get completed shopping lists
        """
        completed = self.get_queryset().filter(status='completed')
        serializer = ShoppingListSummarySerializer(completed, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        POST /api/shopping/{id}/complete/
        Mark shopping list as completed
        """
        shopping_list = self.get_object()
        
        # Link payment method if provided
        payment_method_id = request.data.get('payment_method_id')
        if payment_method_id:
            from apps.payments.models import PaymentMethod
            try:
                pm = PaymentMethod.objects.get(id=payment_method_id, user=request.user)
                shopping_list.payment_methods.add(pm)
                
                # Deduct from balance
                if pm.available_amount >= shopping_list.total_spent:
                    pm.available_amount -= shopping_list.total_spent
                    pm.save()
            except PaymentMethod.DoesNotExist:
                pass

        shopping_list.status = 'completed'
        shopping_list.completed_at = timezone.now()
        shopping_list.save()
        
        return Response(ShoppingListSerializer(shopping_list).data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        POST /api/shopping/{id}/cancel/
        Cancel shopping list
        """
        shopping_list = self.get_object()
        shopping_list.status = 'cancelled'
        shopping_list.save()
        
        return Response(ShoppingListSerializer(shopping_list).data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """
        POST /api/shopping/{id}/duplicate/
        Create a new list based on an existing one
        """
        original = self.get_object()
        
        # Create new list
        new_name = original.name or "Nova Lista"
        if not new_name.startswith("Cópia de"):
            new_name = f"Cópia de {new_name}"
        
        new_list = ShoppingList.objects.create(
            user=request.user,
            name=new_name,
            planned_budget=original.planned_budget,
            status='active',
        )
        
        # Copy items (without images)
        for item in original.items.all():
            ShoppingItem.objects.create(
                shopping_list=new_list,
                name=item.name,
                unit_price=item.unit_price,
                quantity=item.quantity,
                notes=item.notes,
            )
        
        return Response(
            ShoppingListSerializer(new_list).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def budget_status(self, request, pk=None):
        """
        GET /api/shopping/{id}/budget_status/
        Get detailed budget status and alert info
        """
        shopping_list = self.get_object()
        user = request.user
        
        should_alert = shopping_list.budget_percentage >= user.alert_percentage
        
        return Response({
            'planned_budget': float(shopping_list.planned_budget),
            'total_spent': float(shopping_list.total_spent),
            'remaining_budget': float(shopping_list.remaining_budget),
            'budget_percentage': shopping_list.budget_percentage,
            'alert_percentage': user.alert_percentage,
            'should_alert': should_alert,
            'items_count': shopping_list.items_count,
        })

    @action(detail=False, methods=['get'])
    def product_history(self, request):
        """
        GET /api/shopping/product_history/?name=Arroz
        Find history of specific product
        """
        query = request.query_params.get('name', '').strip()
        if len(query) < 2:
            return Response([])

        # Find completed items matching name
        items = ShoppingItem.objects.filter(
            shopping_list__user=request.user,
            shopping_list__status='completed',
            name__icontains=query
        ).select_related('shopping_list').order_by('-shopping_list__completed_at')[:5]

        history_data = []
        for item in items:
            history_data.append({
                'date': item.shopping_list.completed_at,
                'price': item.unit_price,
                'list_name': item.shopping_list.name,
                'quantity': item.quantity
            })
            
        return Response(history_data)


class ShoppingItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ShoppingItem CRUD operations
    """
    
    serializer_class = ShoppingItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only items from user's shopping lists"""
        shopping_list_id = self.kwargs.get('shopping_list_pk')
        return ShoppingItem.objects.filter(
            shopping_list_id=shopping_list_id,
            shopping_list__user=self.request.user,
        )
    
    def perform_create(self, serializer):
        shopping_list_id = self.kwargs.get('shopping_list_pk')
        shopping_list = ShoppingList.objects.get(
            id=shopping_list_id,
            user=self.request.user,
        )
        serializer.save(shopping_list=shopping_list)
    
    @action(detail=True, methods=['post'])
    def toggle_check(self, request, shopping_list_pk=None, pk=None):
        """
        POST /api/shopping/{list_id}/items/{id}/toggle_check/
        Toggle item checked status
        """
        item = self.get_object()
        item.is_checked = not item.is_checked
        item.save()
        
        return Response(ShoppingItemSerializer(item).data)
