"""
SmartCart Accounts Tests
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class UserModelTests(TestCase):
    """Tests for User model"""
    
    def test_create_user(self):
        """Test creating a user with email"""
        email = 'test@example.com'
        password = 'testpass123'
        user = User.objects.create_user(username='testuser', email=email, password=password)
        
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        email = 'admin@example.com'
        password = 'adminpass123'
        user = User.objects.create_superuser(username='admin', email=email, password=password)
        
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
    
    def test_user_string_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(str(user), user.email)


class AccountsAPITests(APITestCase):
    """Tests for Accounts API"""
    
    def test_register_user(self):
        """Test user registration"""
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }
        response = self.client.post('/api/accounts/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_register_invalid_password_mismatch(self):
        """Test registration fails with password mismatch"""
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'SecurePass123!',
            'password_confirm': 'DifferentPass123!',
        }
        response = self.client.post('/api/accounts/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
