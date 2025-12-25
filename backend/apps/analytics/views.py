from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
import calendar

from apps.shopping.models import ShoppingList
from apps.payments.models import PaymentMethod

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for Dashboard Analytics
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        GET /api/analytics/dashboard/summary/
        Returns aggregated stats for the dashboard
        """
        user = request.user
        now = timezone.now()
        
        # 1. Total Spent this Month
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_lists = ShoppingList.objects.filter(
            user=user,
            status='completed',
            completed_at__gte=current_month_start
        )
        spent_this_month = monthly_lists.aggregate(total=Sum('total_spent'))['total'] or 0
        
        # 2. Monthly History (Last 6 months)
        history = []
        for i in range(5, -1, -1):
            date = now - timedelta(days=i*30) # Approximate month
            month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            # End of month logic simplified: just filter year/month matches
            
            # Better approach: Iterate months
            # Actually simplest is using trunc_month if using postgres, but for sqlite manual range is safer
            
            # Let's do a simpler python loop for the last 6 months based on month/year
            month_date = date
            
            qs = ShoppingList.objects.filter(
                user=user,
                status='completed',
                completed_at__year=month_date.year,
                completed_at__month=month_date.month
            )
            total = qs.aggregate(total=Sum('total_spent'))['total'] or 0
            
            month_name = calendar.month_name[month_date.month][:3] # Jan, Feb
            history.append({
                'month': f"{month_name}",
                'full_date': month_date.strftime('%Y-%m'),
                'total': float(total)
            })
            
        # Reverse to show oldest first? currently loop goes 5->0 (months ago), so oldest is first.
        # i=5 is 5 months ago. i=0 is today.
        
        # 3. Spending by Payment Method
        # This is tricky because lists can have items or multiple methods.
        # We will approximate: Sum of lists associated with each method
        payment_stats = []
        payment_methods = PaymentMethod.objects.filter(user=user, is_active=True)
        
        for pm in payment_methods:
            # Find lists where this is a payment method
            pm_lists = ShoppingList.objects.filter(
                user=user,
                status='completed',
                payment_methods=pm
            )
            pm_total = pm_lists.aggregate(total=Sum('total_spent'))['total'] or 0
            
            if pm_total > 0:
                payment_stats.append({
                    'name': pm.name,
                    'total': float(pm_total),
                    'color': self._get_color_for_method(pm.payment_type),
                    'legendFontColor': '#7F7F7F',
                    'legendFontSize': 15
                })
        
        return Response({
            'spent_this_month': float(spent_this_month),
            'lists_this_month': monthly_lists.count(),
            'history': history,
            'payment_distribution': payment_stats
        })

    def _get_color_for_method(self, type):
        colors = {
            'cash': '#4CAF50',    # Green
            'debit': '#2196F3',   # Blue
            'credit': '#F44336',  # Red
            'pix': '#00BCD4',     # Cyan
            'ticket': '#FF9800',  # Orange
            'paypal': '#3F51B5'   # Indigo
        }
        return colors.get(type, '#9E9E9E') # Grey default
