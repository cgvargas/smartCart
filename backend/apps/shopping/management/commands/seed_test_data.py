from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.shopping.models import ShoppingList, ShoppingItem
from apps.payments.models import PaymentMethod
from decimal import Decimal
from datetime import timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds test data for shopping lists and payments'

    def handle(self, *args, **kwargs):
        # Get first user
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR('No user found. Create a user first.'))
            return

        self.stdout.write(f'Seeding data for user: {user.email}')

        # Create Payment Methods if they don't exist
        methods = {
            'credit': 'Cartão Inteiron',
            'debit': 'Débito Banco',
            'ticket': 'Vale Alimentação',
            'cash': 'Dinheiro'
        }
        
        payment_objs = {}
        for type_key, name in methods.items():
            pm = PaymentMethod.objects.filter(
                user=user,
                payment_type=type_key
            ).first()
            
            if not pm:
                pm = PaymentMethod.objects.create(
                    user=user,
                    payment_type=type_key,
                    name=name,
                    available_amount=Decimal('1000.00')
                )
            payment_objs[type_key] = pm

        # Create Lists
        # 1. 3 Months Ago - Completed (Credit)
        date_3_months = timezone.now() - timedelta(days=90)
        self.create_list(user, "Compras Outubro", date_3_months, 850.50, payment_objs['credit'])

        # 2. 2 Months Ago - Completed (Ticket)
        date_2_months = timezone.now() - timedelta(days=60)
        self.create_list(user, "Churrasco Feriado", date_2_months, 320.00, payment_objs['ticket'])

        # 3. 1 Month Ago - Completed (Debit)
        date_1_month = timezone.now() - timedelta(days=30)
        self.create_list(user, "Presentes Natal", date_1_month, 540.00, payment_objs['debit'])

         # 4. Current Month - Completed (Cash) - To show current month data
        date_current = timezone.now() - timedelta(days=2)
        self.create_list(user, "Feira Semanal", date_current, 125.80, payment_objs['cash'])

        # 5. Active List (No Payment yet)
        self.create_active_list(user)

        self.stdout.write(self.style.SUCCESS('Successfully seeded test data!'))

    def create_list(self, user, name, date, total, payment_method):
        # Create List
        s_list = ShoppingList.objects.create(
            user=user,
            name=name,
            planned_budget=Decimal(str(total)) + Decimal('100.00'),
            total_spent=Decimal(str(total)),
            status='completed',
            # completed_at and created_at will be overwritten below
        )
        s_list.payment_methods.add(payment_method)
        
        # Add Items (Dummy items to match total roughly)
        ShoppingItem.objects.create(
            shopping_list=s_list,
            name=f"Itens Variados {name}",
            unit_price=Decimal(str(total)),
            quantity=1,
            is_checked=True
        )

        # Update dates using .update() to bypass auto_now
        ShoppingList.objects.filter(id=s_list.id).update(
            created_at=date,
            updated_at=date,
            completed_at=date
        )

    def create_active_list(self, user):
        s_list = ShoppingList.objects.create(
            user=user,
            name="Lista de Hoje",
            planned_budget=Decimal('500.00'),
            status='active'
        )
        ShoppingItem.objects.create(
            shopping_list=s_list,
            name="Arroz",
            unit_price=Decimal('25.90'),
            quantity=1
        )
        ShoppingItem.objects.create(
            shopping_list=s_list,
            name="Feijão",
            unit_price=Decimal('8.50'),
            quantity=2
        )
