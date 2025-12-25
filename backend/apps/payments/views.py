"""
SmartCart Payments Views
"""

from decimal import Decimal, InvalidOperation
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import PaymentMethod
from .serializers import PaymentMethodSerializer


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PaymentMethod CRUD operations
    
    list:   GET /api/payments/
    create: POST /api/payments/
    retrieve: GET /api/payments/{id}/
    update: PUT /api/payments/{id}/
    partial_update: PATCH /api/payments/{id}/
    destroy: DELETE /api/payments/{id}/
    """
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only user's payment methods"""
        return PaymentMethod.objects.filter(
            user=self.request.user,
            is_active=True,
        )
    
    def perform_destroy(self, instance):
        """Soft delete - just deactivate"""
        instance.is_active = False
        instance.save()
    
    @action(detail=False, methods=['get'])
    def total_available(self, request):
        """
        GET /api/payments/total_available/
        Return total available budget from all active payment methods
        """
        total = sum(
            pm.available_amount 
            for pm in self.get_queryset()
        )
        return Response({
            'total_available': float(total),
            'payment_methods_count': self.get_queryset().count(),
        })
    
    @action(detail=True, methods=['post'])
    def add_funds(self, request, pk=None):
        """
        POST /api/payments/{id}/add_funds/
        Add funds to a payment method
        """
        payment_method = self.get_object()
        amount_data = request.data.get('amount', 0)
        
        try:
            # Convert to float first to handle inputs like "50.00" strings or numbers safely
            # Then stringify for Decimal to avoid float precision issues
            # Or direct conversion if string
            amount = Decimal(str(amount_data))
            if amount <= 0:
                raise ValueError()
        except (TypeError, ValueError, InvalidOperation):
            return Response(
                {'error': 'Valor inválido. Informe um número positivo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_method.available_amount += amount
        payment_method.save()
        
        return Response(PaymentMethodSerializer(payment_method).data)
