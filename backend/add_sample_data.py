#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from apps.budgets.models import YearlyBudget, MonthlyBudget
from apps.forecasts.models import Customer, Item, CustomerItemForecast, MonthlyForecast
from apps.users.models import User
import random

def add_sample_data():
    # Get user
    try:
        user = User.objects.get(email='said@gmail.com')
        print(f"Using user: {user.name}")
    except User.DoesNotExist:
        print("User 'said@gmail.com' not found. Please create this user first.")
        return

    print("Adding sample budget data...")
    
    # Sample data
    customers = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Global Industries', 'Smart Systems', 
                'Digital Corp', 'Future Tech', 'Innovation Labs', 'Prime Systems', 'Elite Solutions']
    items = ['Laptop Pro', 'Desktop Elite', 'Monitor 4K', 'Keyboard Wireless', 'Mouse Optical',
            'Tablet Max', 'Phone Smart', 'Headset Pro', 'Camera HD', 'Printer Laser']
    categories = ['Electronics', 'Hardware', 'Accessories', 'Software', 'Services']
    brands = ['TechBrand', 'ProSeries', 'EliteMax', 'SmartTech', 'GlobalPro']

    # Create 20 yearly budgets
    for i in range(20):
        try:
            budget = YearlyBudget.objects.create(
                customer=f"{customers[i % len(customers)]} {i+1}",
                item=f"{items[i % len(items)]} Model-{i+1}",
                category=categories[i % len(categories)],
                brand=brands[i % len(brands)],
                year=2024 if i < 10 else 2025,
                total_budget=10000 + (i * 5000),
                status=['draft', 'submitted', 'approved'][i % 3],
                created_by=user
            )
            print(f"Created budget {i+1}: {budget.customer} - {budget.item}")
        except Exception as e:
            print(f"Error creating budget {i+1}: {e}")

    print(f"\nTotal budgets created: {YearlyBudget.objects.count()}")

    print("\nAdding sample forecast data...")
    
    # Create customers for forecasts
    forecast_customers = []
    for i in range(10):
        customer, created = Customer.objects.get_or_create(
            name=f"Forecast Customer {i+1}",
            defaults={
                'code': f'FC{i+1:03d}',
                'email': f'customer{i+1}@example.com',
                'region': ['North', 'South', 'East', 'West'][i % 4],
                'segment': ['Enterprise', 'SMB', 'Retail'][i % 3],
                'tier': ['Gold', 'Silver', 'Bronze'][i % 3],
                'manager': user
            }
        )
        forecast_customers.append(customer)
        if created:
            print(f"Created customer: {customer.name}")

    # Create items for forecasts
    forecast_items = []
    for i in range(10):
        item, created = Item.objects.get_or_create(
            name=f"Forecast Item {i+1}",
            defaults={
                'sku': f'FI{i+1:04d}',
                'category': categories[i % len(categories)],
                'brand': brands[i % len(brands)],
                'unit_price': 100 + (i * 50),
                'description': f'Quality forecast item {i+1}'
            }
        )
        forecast_items.append(item)
        if created:
            print(f"Created item: {item.name}")

    # Create 20 customer item forecasts
    for i in range(20):
        try:
            customer = forecast_customers[i % len(forecast_customers)]
            item = forecast_items[i % len(forecast_items)]
            
            # Create unique combination
            forecast_name = f"{customer.name} - {item.name} - Batch {i+1}"
            
            forecast = CustomerItemForecast.objects.create(
                customer=customer,
                item=item,
                yearly_total=1000 + (i * 200),
                yearly_budget_impact=50000 + (i * 10000),
                confidence=['low', 'medium', 'high'][i % 3],
                status=['draft', 'submitted', 'approved'][i % 3],
                created_by=user
            )
            print(f"Created forecast {i+1}: {forecast_name}")
            
        except Exception as e:
            print(f"Error creating forecast {i+1}: {e}")

    print(f"\nTotal forecasts created: {CustomerItemForecast.objects.count()}")
    print(f"Total customers: {Customer.objects.count()}")
    print(f"Total items: {Item.objects.count()}")
    
    print("\n✅ Sample data creation completed!")

if __name__ == '__main__':
    add_sample_data()