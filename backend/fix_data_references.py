#!/usr/bin/env python
"""
Fix data references to match existing users
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.budgets.models import YearlyBudget
from apps.forecasts.models import CustomerItemForecast

User = get_user_model()

def fix_data_references():
    print("=== Fixing Data References ===")
    
    # Get an admin user to assign as creator
    admin_user = User.objects.filter(role='admin').first()
    if not admin_user:
        print("No admin user found!")
        return
    
    print(f"Using admin user: {admin_user.username} (ID: {admin_user.id})")
    
    # Fix budget references
    budgets = YearlyBudget.objects.all()
    print(f"Fixing {budgets.count()} budgets...")
    
    for budget in budgets:
        try:
            # Try to access created_by to see if it exists
            created_by = budget.created_by
            print(f"Budget {budget.id} - Created by: {created_by.username}")
        except User.DoesNotExist:
            print(f"Budget {budget.id} - Invalid created_by_id: {budget.created_by_id}")
            budget.created_by = admin_user
            budget.save()
            print(f"  Fixed: Assigned to {admin_user.username}")
    
    # Fix forecast references
    forecasts = CustomerItemForecast.objects.all()
    print(f"Fixing {forecasts.count()} forecasts...")
    
    for forecast in forecasts:
        try:
            # Try to access created_by to see if it exists
            created_by = forecast.created_by
            print(f"Forecast {forecast.id} - Created by: {created_by.username}")
        except User.DoesNotExist:
            print(f"Forecast {forecast.id} - Invalid created_by_id: {forecast.created_by_id}")
            forecast.created_by = admin_user
            forecast.save()
            print(f"  Fixed: Assigned to {admin_user.username}")
    
    print("Data references fixed!")

if __name__ == "__main__":
    fix_data_references()