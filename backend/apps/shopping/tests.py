"""
SmartCart Shopping Tests
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from .models import ShoppingList, ShoppingItem

User = get_user_model()


class ShoppingListModelTests(TestCase):
    """Tests for ShoppingList model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.shopping_list = ShoppingList.objects.create(
            user=self.user,
            name='Lista de Teste',
            planned_budget=100.00,
        )
    
    def test_create_shopping_list(self):
        """Test creating a shopping list"""
        self.assertEqual(self.shopping_list.status, 'active')
        self.assertEqual(self.shopping_list.total_spent, Decimal('0'))
    
    def test_remaining_budget(self):
        """Test remaining budget calculation"""
        self.assertEqual(
            self.shopping_list.remaining_budget,
            Decimal('100.00')
        )
    
    def test_budget_percentage(self):
        """Test budget percentage calculation"""
        self.shopping_list.total_spent = Decimal('50.00')
        self.shopping_list.save()
        self.assertEqual(self.shopping_list.budget_percentage, 50.0)


class ShoppingItemModelTests(TestCase):
    """Tests for ShoppingItem model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.shopping_list = ShoppingList.objects.create(
            user=self.user,
            planned_budget=100.00,
        )
    
    def test_create_item(self):
        """Test creating a shopping item"""
        item = ShoppingItem.objects.create(
            shopping_list=self.shopping_list,
            name='Arroz',
            unit_price=Decimal('5.99'),
            quantity=2,
        )
        
        self.assertEqual(item.subtotal, Decimal('11.98'))
    
    def test_item_updates_list_total(self):
        """Test that adding item updates list total"""
        ShoppingItem.objects.create(
            shopping_list=self.shopping_list,
            name='Feijão',
            unit_price=Decimal('7.50'),
            quantity=1,
        )
        
        self.shopping_list.refresh_from_db()
        self.assertEqual(self.shopping_list.total_spent, Decimal('7.50'))


class ShoppingAPITests(APITestCase):
    """Tests for Shopping API"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_shopping_list(self):
        """Test creating a shopping list via API"""
        data = {
            'name': 'Lista Semanal',
            'planned_budget': '200.00',
        }
        response = self.client.post('/api/shopping/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_list_shopping_lists(self):
        """Test listing shopping lists"""
        ShoppingList.objects.create(
            user=self.user,
            name='Lista 1',
            planned_budget=100.00,
        )
        
        response = self.client.get('/api/shopping/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
