import os
import django
import time
from django.db import connections
from django.db.utils import OperationalError

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

def check_db_connection():
    db_conn = connections['default']
    try:
        print("Attempting to connect to database...")
        start_time = time.time()
        db_conn.cursor()
        end_time = time.time()
        print(f"Connection successful! Time taken: {end_time - start_time:.4f} seconds")
        return True
    except OperationalError as e:
        print(f"OperationalError: {e}")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

if __name__ == "__main__":
    check_db_connection()
