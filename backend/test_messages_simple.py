#!/usr/bin/env python
"""
Simple test for message functionality without external dependencies
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.notifications.models import Message
from apps.notifications.serializers import MessageSerializer

User = get_user_model()

def test_messages():
    """Test message functionality"""
    
    print("=== Testing Message Functionality ===")
    
    # Check users
    users = User.objects.all()
    print(f"\n1. Found {users.count()} users:")
    for user in users:
        print(f"   - {user.name} ({user.email}) - Role: {user.role}")
    
    if users.count() < 2:
        print("ERROR: Need at least 2 users to test messaging")
        return False
    
    # Get admin and regular user
    admin_user = users.filter(role='admin').first()
    regular_user = users.exclude(role='admin').first()
    
    if not admin_user:
        print("ERROR: No admin user found")
        return False
    if not regular_user:
        print("ERROR: No regular user found")
        return False
    
    print(f"\n2. Testing with:")
    print(f"   Admin: {admin_user.name} (ID: {admin_user.id})")
    print(f"   User: {regular_user.name} (ID: {regular_user.id})")
    
    # Test message creation
    print(f"\n3. Creating test message...")
    try:
        message = Message.objects.create(
            from_user=admin_user,
            to_user=regular_user,
            subject="Test Message",
            message="This is a test message",
            priority="medium",
            category="general"
        )
        print(f"   [OK] Message created: ID {message.id}")
    except Exception as e:
        print(f"   [ERROR] Error creating message: {e}")
        return False
    
    # Test serializer
    print(f"\n4. Testing serializer...")
    try:
        serializer = MessageSerializer(message)
        data = serializer.data
        print(f"   [OK] Serializer works")
        print(f"   Data keys: {list(data.keys())}")
        print(f"   From: {data.get('from_user_name')} -> To: {data.get('to_user_name')}")
    except Exception as e:
        print(f"   [ERROR] Serializer error: {e}")
        return False
    
    # Test message retrieval
    print(f"\n5. Testing message retrieval...")
    try:
        messages = Message.objects.all()
        print(f"   [OK] Found {messages.count()} total messages")
        for msg in messages:
            print(f"     - {msg.from_user.name} -> {msg.to_user.name}: {msg.subject}")
    except Exception as e:
        print(f"   [ERROR] Error retrieving messages: {e}")
        return False
    
    print(f"\n[SUCCESS] All tests passed! Message functionality is working.")
    return True

if __name__ == "__main__":
    success = test_messages()
    sys.exit(0 if success else 1)