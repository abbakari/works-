#!/usr/bin/env python
"""
Debug user permissions and data access
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

def debug_permissions():
    print("=== Debug User Permissions ===")
    
    # Check users
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    
    for user in users:
        print(f"\nUser: {user.username} ({user.email})")
        print(f"  Role: {user.role}")
        print(f"  Is active: {user.is_active}")
        print(f"  Is staff: {user.is_staff}")
        print(f"  Is superuser: {user.is_superuser}")
    
    # Check budgets
    budgets = YearlyBudget.objects.all()
    print(f"\nTotal budgets: {budgets.count()}")
    
    for budget in budgets:
        print(f"Budget: {budget.id} - {budget.customer}")
        print(f"  Created by: {budget.created_by.username} ({budget.created_by.role})")
        print(f"  Status: {budget.status}")
    
    # Check forecasts
    forecasts = CustomerItemForecast.objects.all()
    print(f"\nTotal forecasts: {forecasts.count()}")
    
    for forecast in forecasts:
        print(f"Forecast: {forecast.id} - {forecast.customer.name}")
        print(f"  Created by: {forecast.created_by.username} ({forecast.created_by.role})")
        print(f"  Status: {forecast.status}")
    
    # Test admin user access
    admin_user = User.objects.filter(role='admin').first()
    if admin_user:
        print(f"\n=== Testing Admin User Access ===")
        print(f"Admin user: {admin_user.username}")
        
        # Test budget queryset filtering
        from apps.budgets.views import YearlyBudgetViewSet
        budget_viewset = YearlyBudgetViewSet()
        budget_viewset.request = type('MockRequest', (), {'user': admin_user})()
        
        budget_queryset = budget_viewset.get_queryset()
        print(f"Admin can see {budget_queryset.count()} budgets")
        
        # Test forecast queryset filtering
        from apps.forecasts.views import CustomerItemForecastViewSet
        forecast_viewset = CustomerItemForecastViewSet()
        forecast_viewset.request = type('MockRequest', (), {'user': admin_user})()
        
        forecast_queryset = forecast_viewset.get_queryset()
        print(f"Admin can see {forecast_queryset.count()} forecasts")

if __name__ == "__main__":
    debug_permissions()