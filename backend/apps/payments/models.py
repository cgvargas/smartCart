"""
SmartCart Payments Models
Payment methods management
"""

from django.db import models
from django.conf import settings


class PaymentMethod(models.Model):
    """
    Model for user payment methods
    Tracks available budget for shopping
    """
    
    PAYMENT_TYPE_CHOICES = [
        ('cash', 'Dinheiro'),
        ('debit', 'Cartão de Débito'),
        ('credit', 'Cartão de Crédito'),
        ('pix', 'PIX'),
        ('ticket', 'Ticket Alimentação'),
        ('paypal', 'PayPal'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_methods',
        verbose_name='Usuário',
    )
    
    payment_type = models.CharField(
        'Tipo de pagamento',
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
    )
    
    name = models.CharField(
        'Nome/Descrição',
        max_length=100,
        blank=True,
        help_text='Ex: Cartão Nubank, Dinheiro Vivo',
    )
    
    available_amount = models.DecimalField(
        'Valor disponível',
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    
    is_active = models.BooleanField(
        'Ativo',
        default=True,
    )
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Forma de Pagamento'
        verbose_name_plural = 'Formas de Pagamento'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_payment_type_display()} - R$ {self.available_amount}"
    
    def save(self, *args, **kwargs):
        # Auto-generate name if not provided
        if not self.name:
            self.name = self.get_payment_type_display()
        super().save(*args, **kwargs)
