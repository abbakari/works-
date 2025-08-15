#!/usr/bin/env python3
"""
Django Server Startup Script
This script starts the Django development server for the STM Budget application.
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    print("🚀 Starting STM Budget Django Server...")
    print("=" * 50)
    
    # Check if database exists and migrations are applied
    print("📊 Checking database...")
    try:
        result = subprocess.run([sys.executable, "manage.py", "check"], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Django check failed:")
            print(result.stderr)
            return
        print("✅ Django check passed")
    except Exception as e:
        print(f"❌ Error checking Django: {e}")
        return
    
    # Start the server
    print("\n🌐 Starting Django development server...")
    print("📍 Server will be available at: http://127.0.0.1:8000")
    print("🔐 Admin panel: http://127.0.0.1:8000/admin/")
    print("\n👤 Superuser credentials:")
    print("   Username: admin")
    print("   Password: admin123")
    print("   Email: admin@example.com")
    print("\n" + "=" * 50)
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        subprocess.run([sys.executable, "manage.py", "runserver", "127.0.0.1:8000"])
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")

if __name__ == "__main__":
    main()