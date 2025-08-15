#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from apps.users.models import User

# Fix existing user password
try:
    user = User.objects.get(email='billy@gmail.com')
    user.set_password('123456@#')
    user.save()
    print(f"Password updated for user: {user.email}")
    print("User can now login with:")
    print("Email: billy@gmail.com")
    print("Password: 123456@#")
except User.DoesNotExist:
    print("User billy@gmail.com not found")