import os
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def list_users():
    users = User.objects.all().order_by('-date_joined')
    print(f"{'ID':<5} {'USERNAME':<20} {'EMAIL':<30} {'DATE JOINED'}")
    print("-" * 75)
    
    for user in users:
        date_joined = user.date_joined.strftime('%Y-%m-%d %H:%M') if user.date_joined else 'N/A'
        print(f"{user.id:<5} {user.username:<20} {user.email:<30} {date_joined}")

    print(f"\nTotal users: {users.count()}")

if __name__ == "__main__":
    list_users()
