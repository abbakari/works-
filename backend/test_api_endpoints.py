#!/usr/bin/env python
"""
Test API endpoints directly
"""
import os
import sys
import django
from django.conf import settings
from django.test import Client
from django.contrib.auth import get_user_model
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

User = get_user_model()

def test_api_endpoints():
    print("=== Testing API Endpoints ===")
    
    # Create a test client
    client = Client()
    
    # Get a user for authentication
    user = User.objects.filter(is_active=True).first()
    if not user:
        print("No active user found")
        return
    
    print(f"Testing with user: {user.username}")
    
    # Test login first
    login_data = {
        'username': user.username,
        'password': 'password123'  # Default password from our sample data
    }
    
    # Test budget endpoint
    print("\n--- Testing Budget Endpoint ---")
    try:
        # Force login the user
        client.force_login(user)
        
        response = client.get('/api/budgets/')
        print(f"Budget API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Budget API Response Keys: {list(data.keys())}")
            if 'results' in data and data['results']:
                sample = data['results'][0]
                print(f"Sample Budget Fields: {list(sample.keys())}")
                print(f"Sample Budget Customer: {sample.get('customer')}")
                print(f"Sample Budget Item: {sample.get('item')}")
                print(f"Sample Budget 2025: {sample.get('budget_2025')}")
        else:
            print(f"Budget API Error: {response.content.decode()}")
    
    except Exception as e:
        print(f"Budget API Exception: {str(e)}")
    
    # Test forecast endpoint
    print("\n--- Testing Forecast Endpoint ---")
    try:
        response = client.get('/api/forecasts/')
        print(f"Forecast API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Forecast API Response Keys: {list(data.keys())}")
            if 'results' in data and data['results']:
                sample = data['results'][0]
                print(f"Sample Forecast Fields: {list(sample.keys())}")
                print(f"Sample Forecast Customer: {sample.get('customer')}")
                print(f"Sample Forecast Item: {sample.get('item')}")
                print(f"Sample Forecast Value: {sample.get('forecast')}")
        else:
            print(f"Forecast API Error: {response.content.decode()}")
    
    except Exception as e:
        print(f"Forecast API Exception: {str(e)}")

def check_url_patterns():
    print("\n=== Checking URL Patterns ===")
    
    from django.urls import reverse
    from django.core.exceptions import NoReverseMatch
    
    # Test URL patterns
    url_patterns = [
        'budgets:yearlybudget-list',
        'forecasts:customeritemforecast-list',
    ]
    
    for pattern in url_patterns:
        try:
            url = reverse(pattern)
            print(f"✓ {pattern}: {url}")
        except NoReverseMatch:
            print(f"✗ {pattern}: Not found")

if __name__ == "__main__":
    print("STM Budget API Endpoint Test")
    print("=" * 50)
    
    check_url_patterns()
    test_api_endpoints()
    
    print("\nTest completed!")