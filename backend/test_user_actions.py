#!/usr/bin/env python
"""
Test user management action endpoints
"""
import os
import django
from django.conf import settings
from django.test import Client
from django.contrib.auth import get_user_model
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

User = get_user_model()

def test_user_actions():
    print("=== Testing User Management Actions ===")
    
    client = Client()
    
    # Get admin user
    admin_user = User.objects.filter(role='admin').first()
    if not admin_user:
        print("No admin user found")
        return
    
    # Get a regular user to test actions on
    test_user = User.objects.filter(role='salesman').first()
    if not test_user:
        print("No test user found")
        return
    
    client.force_login(admin_user)
    print(f"Testing with admin: {admin_user.email}")
    print(f"Target user: {test_user.email} (ID: {test_user.id})")
    
    # Test activate action
    print("\n1. Testing activate action")
    response = client.post(f'/api/users/{test_user.id}/activate/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response: {data}")
    else:
        print(f"   Error: {response.content.decode()}")
    
    # Test deactivate action
    print("\n2. Testing deactivate action")
    response = client.post(f'/api/users/{test_user.id}/deactivate/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response: {data}")
    else:
        print(f"   Error: {response.content.decode()}")
    
    # Test reset password action
    print("\n3. Testing reset password action")
    response = client.post(f'/api/users/{test_user.id}/reset_password/', 
                          data=json.dumps({'password': 'newpassword123'}),
                          content_type='application/json')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response: {data}")
    else:
        print(f"   Error: {response.content.decode()}")
    
    # Test change role action
    print("\n4. Testing change role action")
    response = client.post(f'/api/users/{test_user.id}/change_role/', 
                          data=json.dumps({'role': 'manager'}),
                          content_type='application/json')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response: {data}")
    else:
        print(f"   Error: {response.content.decode()}")
    
    # Test user list to see available actions
    print("\n5. Testing user list endpoint")
    response = client.get('/api/users/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Total users: {data.get('count', 0)}")
        if data.get('results'):
            sample_user = data['results'][0]
            print(f"   Sample user fields: {list(sample_user.keys())}")

if __name__ == "__main__":
    test_user_actions()