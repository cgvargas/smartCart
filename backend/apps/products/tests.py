"""
SmartCart Products Tests
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from .models import Product, PriceHistory

User = get_user_model()


class ProductModelTests(TestCase):
    """Tests for Product model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_product(self):
        """Test creating a product"""
        product = Product.objects.create(
            user=self.user,
            name='Arroz Integral',
            last_price=Decimal('12.99'),
            category='Grãos',
        )
        
        self.assertEqual(product.name, 'Arroz Integral')
        self.assertEqual(product.times_purchased, 0)
        self.assertFalse(product.is_favorite)
    
    def test_product_string_representation(self):
        """Test product string representation"""
        product = Product.objects.create(
            user=self.user,
            name='Feijão Preto',
        )
        self.assertEqual(str(product), 'Feijão Preto')


class ProductAPITests(APITestCase):
    """Tests for Products API"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_product(self):
        """Test creating a product via API"""
        data = {
            'name': 'Leite Integral',
            'last_price': '5.49',
            'category': 'Laticínios',
        }
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_products(self):
        """Test listing products"""
        Product.objects.create(
            user=self.user,
            name='Pão de Forma',
        )
        
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
