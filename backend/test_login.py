#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import authenticate
from apps.users.models import User

# Test authentication
print("Testing authentication...")

# Check if user exists
try:
    user = User.objects.get(email='admin@example.com')
    print(f"User found: {user.username}, {user.email}")
    print(f"User is active: {user.is_active}")
except User.DoesNotExist:
    print("User not found!")

# Test authentication
auth_user = authenticate(email='admin@example.com', password='admin123')
if auth_user:
    print(f"Authentication successful: {auth_user.email}")
else:
    print("Authentication failed")

# Test with username
auth_user2 = authenticate(username='admin@example.com', password='admin123')
if auth_user2:
    print(f"Username auth successful: {auth_user2.email}")
else:
    print("Username auth failed")