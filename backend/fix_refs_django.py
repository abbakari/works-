#!/usr/bin/env python
"""
Fix user references using Django ORM with raw SQL
"""
import os
import django
from django.conf import settings
from django.db import connection

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def fix_user_references():
    print("=== Fixing User References ===")
    
    # Get admin user
    admin_user = User.objects.filter(role='admin').first()
    if not admin_user:
        print("No admin user found!")
        return
    
    print(f"Using admin user ID: {admin_user.id}")
    
    # Use raw SQL to update references
    with connection.cursor() as cursor:
        # Update budgets
        cursor.execute("UPDATE yearly_budgets SET created_by_id = %s", [admin_user.id])
        budget_count = cursor.rowcount
        print(f"Updated {budget_count} budgets")
        
        # Update forecasts
        cursor.execute("UPDATE customer_item_forecasts SET created_by_id = %s", [admin_user.id])
        forecast_count = cursor.rowcount
        print(f"Updated {forecast_count} forecasts")
    
    print("User references fixed!")

if __name__ == "__main__":
    fix_user_references()