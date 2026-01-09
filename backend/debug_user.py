from django.contrib.auth import get_user_model
import inspect

User = get_user_model()
print("User Manager:", User.objects)
print("create_user signature:", inspect.signature(User.objects.create_user))

try:
    User.objects.create_user(username='testuser', email='test@test.com', password='password')
    print("create_user with username kwarg: SUCCESS")
except Exception as e:
    print(f"create_user with username kwarg: FAILED - {e}")
