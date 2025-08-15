#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Update existing superuser or create new one
try:
    user = User.objects.get(username='admin')
    user.email = 'admin@example.com'
    user.save()
    print("Updated existing superuser email")
except User.DoesNotExist:
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )
    print("Created new superuser")

print("\nSuperuser credentials:")
print("   Email: admin@example.com")
print("   Username: admin") 
print("   Password: admin123")
print("\nFrontend can now login with:")
print("   Email: admin@example.com")
print("   Password: admin123")