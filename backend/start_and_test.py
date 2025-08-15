#!/usr/bin/env python
"""
Start Django server and test API endpoints
"""
import os
import sys
import django
import subprocess
import time
import threading

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import execute_from_command_line

User = get_user_model()

def start_server():
    """Start Django development server"""
    print("Starting Django development server...")
    try:
        execute_from_command_line(['manage.py', 'runserver', '8000'])
    except KeyboardInterrupt:
        print("Server stopped.")

def test_endpoints():
    """Test API endpoints"""
    import urllib.request
    import urllib.parse
    import json
    
    time.sleep(3)  # Wait for server to start
    
    print("Testing API endpoints...")
    
    # Test health check
    try:
        response = urllib.request.urlopen('http://localhost:8000/api/health/')
        data = json.loads(response.read().decode())
        print(f"Health check: {data['status']}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return
    
    # Test login
    try:
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            print("No admin user found")
            return
            
        login_data = {
            'email': admin_user.email,
            'password': 'admin123'  # Default password
        }
        
        req = urllib.request.Request(
            'http://localhost:8000/api/auth/login/',
            data=json.dumps(login_data).encode(),
            headers={'Content-Type': 'application/json'}
        )
        
        response = urllib.request.urlopen(req)
        token_data = json.loads(response.read().decode())
        access_token = token_data.get('access')
        
        if access_token:
            print(f"Login successful, got token")
            
            # Test messages endpoint
            req = urllib.request.Request(
                'http://localhost:8000/api/notifications/messages/',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
            )
            
            response = urllib.request.urlopen(req)
            messages_data = json.loads(response.read().decode())
            print(f"Messages endpoint works: {len(messages_data.get('results', messages_data))} messages")
            
        else:
            print("Login failed - no token received")
            
    except Exception as e:
        print(f"API test failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        # Just run tests
        test_endpoints()
    else:
        # Start server in background and run tests
        server_thread = threading.Thread(target=start_server, daemon=True)
        server_thread.start()
        
        test_endpoints()
        
        print("Press Ctrl+C to stop server")
        try:
            server_thread.join()
        except KeyboardInterrupt:
            print("Stopping...")