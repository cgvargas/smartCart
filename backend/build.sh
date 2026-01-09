#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Convert static assets
python manage.py collectstatic --no-input

# Apply any outstanding database migrations
python manage.py migrate

# TEMPORARY: Reset users and create superuser (remove after first run)
python manage.py reset_users --email=admin@smartcart.com --password=SmartCart2026! --no-confirm
