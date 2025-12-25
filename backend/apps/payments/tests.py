"""
SmartCart Payments Tests
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from .models import PaymentMethod

User = get_user_model()


class PaymentMethodModelTests(TestCase):
    """Tests for PaymentMethod model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_payment_method(self):
        """Test creating a payment method"""
        pm = PaymentMethod.objects.create(
            user=self.user,
            payment_type='cash',
            available_amount=100.00,
        )
        
        self.assertEqual(pm.payment_type, 'cash')
        self.assertEqual(pm.available_amount, Decimal('100.00'))
        self.assertTrue(pm.is_active)
    
    def test_auto_generate_name(self):
        """Test auto-generation of name"""
        pm = PaymentMethod.objects.create(
            user=self.user,
            payment_type='pix',
            available_amount=50.00,
        )
        
        self.assertEqual(pm.name, 'PIX')


class PaymentMethodAPITests(APITestCase):
    """Tests for Payments API"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_payment_method(self):
        """Test creating a payment method via API"""
        data = {
            'payment_type': 'debit',
            'name': 'Cartão Nubank',
            'available_amount': '250.00',
        }
        response = self.client.post('/api/payments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_payment_methods(self):
        """Test listing payment methods"""
        PaymentMethod.objects.create(
            user=self.user,
            payment_type='cash',
            available_amount=100.00,
        )
        
        response = self.client.get('/api/payments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
