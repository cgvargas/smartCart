"""
SmartCart Shopping Models
Shopping lists and cart items
"""

from django.db import models
from django.conf import settings
from decimal import Decimal


class ShoppingList(models.Model):
    """
    Model for shopping lists
    Tracks budget and shopping session
    """
    
    STATUS_CHOICES = [
        ('active', 'Em Andamento'),
        ('completed', 'Finalizada'),
        ('cancelled', 'Cancelada'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shopping_lists',
        verbose_name='Usuário',
    )
    
    name = models.CharField(
        'Nome da lista',
        max_length=100,
        blank=True,
        default='',
    )
    
    planned_budget = models.DecimalField(
        'Orçamento planejado',
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    
    total_spent = models.DecimalField(
        'Total gasto',
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
    )
    
    payment_methods = models.ManyToManyField(
        'payments.PaymentMethod',
        related_name='shopping_lists',
        verbose_name='Formas de pagamento',
        blank=True,
    )
    
    notes = models.TextField(
        'Notas',
        blank=True,
    )
    
    receipt_pdf = models.FileField(
        'Nota Fiscal (PDF)',
        upload_to='receipts/',
        blank=True,
        null=True,
    )
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    completed_at = models.DateTimeField('Finalizado em', null=True, blank=True)
    
    class Meta:
        verbose_name = 'Lista de Compras'
        verbose_name_plural = 'Listas de Compras'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name or 'Lista'} - {self.created_at.strftime('%d/%m/%Y')}"
    
    @property
    def remaining_budget(self):
        """Calculate remaining budget"""
        return self.planned_budget - self.total_spent
    
    @property
    def budget_percentage(self):
        """Calculate percentage used"""
        if self.planned_budget == 0:
            return 0
        return round((self.total_spent / self.planned_budget) * 100, 1)
    
    @property
    def items_count(self):
        """Get total items count"""
        return self.items.count()
    
    def update_total(self):
        """Recalculate total from items"""
        total = sum(
            item.subtotal for item in self.items.all()
        )
        self.total_spent = total
        self.save(update_fields=['total_spent', 'updated_at'])


class ShoppingItem(models.Model):
    """
    Model for items in a shopping list
    """
    
    shopping_list = models.ForeignKey(
        ShoppingList,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Lista de compras',
    )
    
    name = models.CharField(
        'Nome do produto',
        max_length=200,
    )
    
    unit_price = models.DecimalField(
        'Preço unitário',
        max_digits=10,
        decimal_places=2,
    )
    
    quantity = models.DecimalField(
        'Quantidade',
        max_digits=10,
        decimal_places=3,
        default=1,
    )
    
    image = models.ImageField(
        'Imagem',
        upload_to='product_images/',
        blank=True,
        null=True,
    )
    
    notes = models.CharField(
        'Observações',
        max_length=200,
        blank=True,
    )
    
    is_checked = models.BooleanField(
        'Marcado',
        default=False,
        help_text='Indica se o item foi colocado no carrinho',
    )
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Item da Lista'
        verbose_name_plural = 'Itens da Lista'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.quantity}x R$ {self.unit_price}"
    
    @property
    def subtotal(self):
        """Calculate subtotal for this item"""
        return Decimal(str(self.unit_price)) * Decimal(str(self.quantity))
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update shopping list total
        self.shopping_list.update_total()
    
    def delete(self, *args, **kwargs):
        shopping_list = self.shopping_list
        super().delete(*args, **kwargs)
        # Update shopping list total after deletion
        shopping_list.update_total()
