#!/usr/bin/env python
"""
Test script for message API endpoints
"""
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.notifications.models import Message

User = get_user_model()

def test_message_api():
    """Test the message API endpoints"""
    
    # First, let's check if we have users
    users = User.objects.all()
    print(f"Found {users.count()} users in database:")
    for user in users:
        print(f"  - {user.name} ({user.email}) - Role: {user.role}")
    
    if users.count() < 2:
        print("Need at least 2 users to test messaging")
        return
    
    # Get admin and regular user
    admin_user = users.filter(role='admin').first()
    regular_user = users.exclude(role='admin').first()
    
    if not admin_user or not regular_user:
        print("Need both admin and regular user")
        return
    
    print(f"\nTesting with Admin: {admin_user.name}, Regular: {regular_user.name}")
    
    # Test 1: Create a message directly in database
    print("\n1. Creating message directly in database...")
    message = Message.objects.create(
        from_user=admin_user,
        to_user=regular_user,
        subject="Test Message",
        message="This is a test message from admin to user",
        priority="medium",
        category="general"
    )
    print(f"Created message: {message}")
    
    # Test 2: Check if we can retrieve messages
    print("\n2. Retrieving messages from database...")
    messages = Message.objects.all()
    print(f"Found {messages.count()} messages:")
    for msg in messages:
        print(f"  - {msg.from_user.name} -> {msg.to_user.name}: {msg.subject}")
    
    # Test 3: Test API login (get token)
    print("\n3. Testing API login...")
    login_url = "http://localhost:8000/api/auth/login/"
    login_data = {
        "email": admin_user.email,
        "password": "admin123"  # Default password from our setup
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login response status: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print(f"Got access token: {access_token[:50]}...")
            
            # Test 4: Test message API with token
            print("\n4. Testing message API...")
            messages_url = "http://localhost:8000/api/notifications/messages/"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # GET messages
            response = requests.get(messages_url, headers=headers)
            print(f"GET messages status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"API returned {len(data.get('results', data))} messages")
            else:
                print(f"GET failed: {response.text}")
            
            # POST new message
            new_message_data = {
                "to_user": regular_user.id,
                "subject": "API Test Message",
                "message": "This message was sent via API",
                "priority": "high",
                "category": "general"
            }
            
            response = requests.post(messages_url, json=new_message_data, headers=headers)
            print(f"POST message status: {response.status_code}")
            if response.status_code == 201:
                print("Message sent successfully via API!")
            else:
                print(f"POST failed: {response.text}")
                
        else:
            print(f"Login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to Django server. Make sure it's running on port 8000")
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_message_api()