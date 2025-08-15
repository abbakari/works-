#!/usr/bin/env python
"""
Simple API test to check endpoints
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

def test_endpoints():
    print("=== Testing API Endpoints ===")
    
    client = Client()
    user = User.objects.filter(is_active=True).first()
    
    if not user:
        print("No active user found")
        return
    
    # Force login
    client.force_login(user)
    print(f"Testing with user: {user.username}")
    
    # Test budget endpoint
    print("\n1. Testing /api/budgets/")
    response = client.get('/api/budgets/')
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"   Response type: {type(data)}")
            print(f"   Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            if isinstance(data, dict) and 'results' in data:
                results = data['results']
                print(f"   Results count: {len(results)}")
                if results:
                    sample = results[0]
                    print(f"   Sample fields: {list(sample.keys())}")
                    print(f"   Sample customer: {sample.get('customer')}")
                    print(f"   Sample budget_2025: {sample.get('budget_2025')}")
            elif isinstance(data, list):
                print(f"   Direct list with {len(data)} items")
                if data:
                    sample = data[0]
                    print(f"   Sample fields: {list(sample.keys())}")
        except Exception as e:
            print(f"   JSON parse error: {e}")
            print(f"   Raw content: {response.content[:200]}")
    else:
        print(f"   Error: {response.content.decode()[:200]}")
    
    # Test forecast endpoint
    print("\n2. Testing /api/forecasts/")
    response = client.get('/api/forecasts/')
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"   Response type: {type(data)}")
            print(f"   Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            if isinstance(data, dict) and 'results' in data:
                results = data['results']
                print(f"   Results count: {len(results)}")
                if results:
                    sample = results[0]
                    print(f"   Sample fields: {list(sample.keys())}")
                    print(f"   Sample customer: {sample.get('customer')}")
                    print(f"   Sample forecast: {sample.get('forecast')}")
            elif isinstance(data, list):
                print(f"   Direct list with {len(data)} items")
                if data:
                    sample = data[0]
                    print(f"   Sample fields: {list(sample.keys())}")
        except Exception as e:
            print(f"   JSON parse error: {e}")
            print(f"   Raw content: {response.content[:200]}")
    else:
        print(f"   Error: {response.content.decode()[:200]}")

if __name__ == "__main__":
    test_endpoints()