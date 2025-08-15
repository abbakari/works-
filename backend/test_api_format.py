#!/usr/bin/env python
"""
Test script to check API data format compatibility
"""
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from apps.budgets.models import YearlyBudget
from apps.forecasts.models import CustomerItemForecast
from apps.budgets.serializers import YearlyBudgetSerializer
from apps.forecasts.serializers import CustomerItemForecastSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def test_budget_serializer():
    print("=== Testing Budget Serializer ===")
    
    # Get a sample budget
    budget = YearlyBudget.objects.first()
    if not budget:
        print("No budget data found in database")
        return
    
    # Create a mock request object
    class MockRequest:
        def __init__(self, user):
            self.user = user
    
    user = User.objects.first()
    mock_request = MockRequest(user)
    
    # Serialize the budget
    serializer = YearlyBudgetSerializer(budget, context={'request': mock_request})
    data = serializer.data
    
    print(f"Budget ID: {data.get('id')}")
    print(f"Customer: {data.get('customer')}")
    print(f"Item: {data.get('item')}")
    print(f"Budget 2025: {data.get('budget_2025')}")
    print(f"Actual 2025: {data.get('actual_2025')}")
    print(f"Budget 2026: {data.get('budget_2026')}")
    print(f"Rate: {data.get('rate')}")
    print(f"Stock: {data.get('stock')}")
    print(f"Git: {data.get('git')}")
    print(f"Yearly Budgets: {data.get('yearly_budgets')}")
    print(f"Yearly Actuals: {data.get('yearly_actuals')}")
    print()

def test_forecast_serializer():
    print("=== Testing Forecast Serializer ===")
    
    # Get a sample forecast
    forecast = CustomerItemForecast.objects.first()
    if not forecast:
        print("No forecast data found in database")
        return
    
    # Create a mock request object
    class MockRequest:
        def __init__(self, user):
            self.user = user
    
    user = User.objects.first()
    mock_request = MockRequest(user)
    
    # Serialize the forecast
    serializer = CustomerItemForecastSerializer(forecast, context={'request': mock_request})
    data = serializer.data
    
    print(f"Forecast ID: {data.get('id')}")
    print(f"Customer: {data.get('customer')}")
    print(f"Item: {data.get('item')}")
    print(f"Forecast: {data.get('forecast')}")
    print(f"Stock: {data.get('stock')}")
    print(f"Git: {data.get('git')}")
    print(f"ETA: {data.get('eta')}")
    print(f"Bud25: {data.get('bud25')}")
    print(f"Ytd25: {data.get('ytd25')}")
    print(f"Yearly Budgets: {data.get('yearly_budgets')}")
    print(f"Yearly Actuals: {data.get('yearly_actuals')}")
    print()

def check_database_data():
    print("=== Database Data Check ===")
    
    budget_count = YearlyBudget.objects.count()
    forecast_count = CustomerItemForecast.objects.count()
    user_count = User.objects.count()
    
    print(f"Total Budgets: {budget_count}")
    print(f"Total Forecasts: {forecast_count}")
    print(f"Total Users: {user_count}")
    
    if budget_count > 0:
        sample_budget = YearlyBudget.objects.first()
        print(f"Sample Budget: {sample_budget.customer} - {sample_budget.item}")
        print(f"  Yearly Budgets JSON: {sample_budget.yearly_budgets}")
        print(f"  Yearly Actuals JSON: {sample_budget.yearly_actuals}")
    
    if forecast_count > 0:
        sample_forecast = CustomerItemForecast.objects.first()
        print(f"Sample Forecast: {sample_forecast.customer.name} - {sample_forecast.item.name}")
        print(f"  Yearly Total: {sample_forecast.yearly_total}")
    
    print()

if __name__ == "__main__":
    print("STM Budget API Format Test")
    print("=" * 50)
    
    check_database_data()
    test_budget_serializer()
    test_forecast_serializer()
    
    print("Test completed!")