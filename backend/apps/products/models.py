"""
SmartCart Products Models
Product catalog and history
"""

from django.db import models
from django.conf import settings


class Product(models.Model):
    """
    Model for product catalog
    Stores products that have been scanned/added for reuse
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Usuário',
    )
    
    name = models.CharField(
        'Nome do produto',
        max_length=200,
    )
    
    barcode = models.CharField(
        'Código de barras',
        max_length=50,
        blank=True,
        null=True,
    )
    
    last_price = models.DecimalField(
        'Último preço',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    
    category = models.CharField(
        'Categoria',
        max_length=100,
        blank=True,
    )
    
    image = models.ImageField(
        'Imagem',
        upload_to='product_images/',
        blank=True,
        null=True,
    )
    
    times_purchased = models.IntegerField(
        'Vezes comprado',
        default=0,
    )
    
    is_favorite = models.BooleanField(
        'Favorito',
        default=False,
    )
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['-times_purchased', '-updated_at']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return self.name


class PriceHistory(models.Model):
    """
    Model for tracking product price history
    """
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='price_history',
        verbose_name='Produto',
    )
    
    price = models.DecimalField(
        'Preço',
        max_digits=10,
        decimal_places=2,
    )
    
    store_name = models.CharField(
        'Loja',
        max_length=100,
        blank=True,
    )
    
    recorded_at = models.DateTimeField('Registrado em', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Histórico de Preço'
        verbose_name_plural = 'Históricos de Preços'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.product.name} - R$ {self.price} em {self.recorded_at.strftime('%d/%m/%Y')}"
