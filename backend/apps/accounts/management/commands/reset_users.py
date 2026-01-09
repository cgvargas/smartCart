"""
Management command to reset all users and create a new superuser.
Run on Render Shell: python manage.py reset_users
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Delete all users and create a new superuser'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@smartcart.com',
            help='Email for the new superuser (default: admin@smartcart.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='SmartCart2026!',
            help='Password for the new superuser (default: SmartCart2026!)'
        )
        parser.add_argument(
            '--no-confirm',
            action='store_true',
            help='Skip confirmation prompt'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        no_confirm = options['no_confirm']

        # Count current users
        user_count = User.objects.count()
        self.stdout.write(f'\nCurrent users in database: {user_count}')

        if user_count > 0:
            # List existing users
            self.stdout.write('\nExisting users:')
            for user in User.objects.all()[:10]:  # Show max 10
                status = '(superuser)' if user.is_superuser else ''
                self.stdout.write(f'  - {user.email} {status}')
            if user_count > 10:
                self.stdout.write(f'  ... and {user_count - 10} more')

        if not no_confirm:
            self.stdout.write(
                self.style.WARNING(
                    f'\n⚠️  This will DELETE ALL {user_count} users and create a new superuser.'
                )
            )
            confirm = input('\nType "yes" to confirm: ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.ERROR('Aborted.'))
                return

        # Delete all users
        deleted_count, _ = User.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Deleted {deleted_count} users.')
        )

        # Create new superuser
        user = User.objects.create_superuser(
            email=email,
            username=email.split('@')[0],
            password=password,
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Created superuser:')
        )
        self.stdout.write(f'   Email: {email}')
        self.stdout.write(f'   Password: {password}')
        self.stdout.write(f'\n🔗 Admin URL: https://smartcart-cj79.onrender.com/admin/')
        self.stdout.write(f'\n📱 You can now login with these credentials in the mobile app too!')
