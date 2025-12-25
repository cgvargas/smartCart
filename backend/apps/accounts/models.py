"""
SmartCart Accounts Models
Custom User model with additional fields for the app
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model for SmartCart
    Uses email as the primary identifier
    """
    email = models.EmailField(
        'email address',
        unique=True,
        error_messages={
            'unique': 'Já existe um usuário com este email.',
        },
    )
    
    # Additional fields
    phone = models.CharField(
        'telefone',
        max_length=15,
        blank=True,
        null=True,
    )
    
    avatar = models.ImageField(
        'foto de perfil',
        upload_to='avatars/',
        null=True,
        blank=True,
    )

    # Budget alert settings
    alert_percentage = models.IntegerField(
        'percentual de alerta',
        default=80,
        help_text='Porcentagem do orçamento para disparar alerta (50-100)',
    )
    
    # Timestamps
    created_at = models.DateTimeField('criado em', auto_now_add=True)
    updated_at = models.DateTimeField('atualizado em', auto_now=True)
    
    # Use email as username for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        # Generate username from email if not provided
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)
