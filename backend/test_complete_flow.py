#!/usr/bin/env python
"""
Test complete data flow - frontend to backend
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

def test_complete_flow():
    print("=== Testing Complete Data Flow ===")
    
    client = Client()
    admin_user = User.objects.filter(role='admin').first()
    client.force_login(admin_user)
    
    print(f"Testing with admin: {admin_user.email}")
    
    # Test 1: Budget API
    print("\n1. Testing Budget API")
    response = client.get('/api/budgets/')
    print(f"   GET /api/budgets/ - Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Budget count: {data.get('count', 0)}")
    
    # Test 2: Forecast API
    print("\n2. Testing Forecast API")
    response = client.get('/api/forecasts/')
    print(f"   GET /api/forecasts/ - Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Forecast count: {data.get('count', 0)}")
    
    # Test 3: User API
    print("\n3. Testing User API")
    response = client.get('/api/users/')
    print(f"   GET /api/users/ - Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   User count: {data.get('count', 0)}")
    
    # Test 4: Create User
    print("\n4. Testing User Creation")
    new_user_data = {
        'name': 'Test User',
        'email': 'testuser@example.com',
        'role': 'salesman',
        'department': 'Sales',
        'password': 'testpass123'
    }
    response = client.post('/api/users/', 
                          data=json.dumps(new_user_data),
                          content_type='application/json')
    print(f"   POST /api/users/ - Status: {response.status_code}")
    if response.status_code == 201:
        print("   User created successfully")
    else:
        print(f"   Error: {response.content.decode()}")
    
    # Test 5: Create Budget
    print("\n5. Testing Budget Creation")
    new_budget_data = {
        'customer': 'Test Customer',
        'item': 'Test Item',
        'category': 'Test Category',
        'brand': 'Test Brand',
        'year': '2025',
        'total_budget': 10000,
        'yearly_budgets': {'2025': 10000},
        'yearly_actuals': {'2025': 0},
        'yearly_values': {'2025': 10000}
    }
    response = client.post('/api/budgets/', 
                          data=json.dumps(new_budget_data),
                          content_type='application/json')
    print(f"   POST /api/budgets/ - Status: {response.status_code}")
    if response.status_code == 201:
        print("   Budget created successfully")
    else:
        print(f"   Error: {response.content.decode()}")
    
    # Test 6: Health Check
    print("\n6. Testing Health Check")
    response = client.get('/api/health/')
    print(f"   GET /api/health/ - Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Health status: {data.get('status')}")

if __name__ == "__main__":
    test_complete_flow()