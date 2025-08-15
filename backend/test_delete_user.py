#!/usr/bin/env python
"""
Test user deletion endpoint
"""
import os
import django
from django.conf import settings
from django.test import Client
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

User = get_user_model()

def test_delete_user():
    client = Client()
    
    # Get admin user
    admin_user = User.objects.filter(role='admin').first()
    client.force_login(admin_user)
    
    # Get a test user to delete
    test_user = User.objects.filter(role='salesman').first()
    if not test_user:
        print("No test user found")
        return
    
    print(f"Deleting user: {test_user.email} (ID: {test_user.id})")
    
    # Test delete
    response = client.delete(f'/api/users/{test_user.id}/')
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.get('Content-Type', 'Not set')}")
    print(f"Content: {response.content}")
    
    if response.status_code == 204:
        print("Delete successful (no content)")
    elif response.status_code == 200:
        try:
            data = response.json()
            print(f"JSON Response: {data}")
        except:
            print("Failed to parse JSON")

if __name__ == "__main__":
    test_delete_user()