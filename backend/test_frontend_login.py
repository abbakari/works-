#!/usr/bin/env python
"""
Test frontend login flow
"""
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse

User = get_user_model()

def test_login_flow():
    """Test the complete login flow"""
    
    print("=== Testing Frontend Login Flow ===")
    
    # Get admin user
    admin_user = User.objects.filter(role='admin').first()
    if not admin_user:
        print("ERROR: No admin user found")
        return False
    
    print(f"Testing with admin user: {admin_user.email}")
    
    # Test login endpoint
    client = Client()
    
    login_data = {
        'email': admin_user.email,
        'password': 'admin123'
    }
    
    print(f"Attempting login with: {login_data}")
    
    try:
        response = client.post('/api/auth/login/', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        print(f"Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            access_token = data.get('access')
            
            if access_token:
                print(f"SUCCESS: Got access token: {access_token[:50]}...")
                
                # Test authenticated endpoint
                auth_headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
                
                # Test messages endpoint
                messages_response = client.get('/api/notifications/messages/', **auth_headers)
                print(f"Messages endpoint status: {messages_response.status_code}")
                
                if messages_response.status_code == 200:
                    messages_data = messages_response.json()
                    print(f"SUCCESS: Got {len(messages_data.get('results', messages_data))} messages")
                    return True
                else:
                    print(f"ERROR: Messages endpoint failed: {messages_response.content}")
                    
            else:
                print("ERROR: No access token in response")
                print(f"Response data: {data}")
        else:
            print(f"ERROR: Login failed: {response.content}")
            
    except Exception as e:
        print(f"ERROR: Exception during test: {e}")
    
    return False

if __name__ == "__main__":
    success = test_login_flow()
    if success:
        print("\n[SUCCESS] Login flow is working correctly!")
        print("Frontend should be able to authenticate and access messages.")
    else:
        print("\n[FAILED] Login flow has issues.")
    
    sys.exit(0 if success else 1)