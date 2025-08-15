#!/usr/bin/env python
import os
import django
from django.conf import settings
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from apps.budgets.models import YearlyBudget, MonthlyBudget
from apps.forecasts.models import Customer, Item, CustomerItemForecast, MonthlyForecast
from apps.users.models import User

def create_sample_data():
    # Clear existing data
    print("Clearing existing data...")
    MonthlyBudget.objects.all().delete()
    YearlyBudget.objects.all().delete()
    MonthlyForecast.objects.all().delete()
    CustomerItemForecast.objects.all().delete()
    Customer.objects.all().delete()
    Item.objects.all().delete()
    
    # Get or create a user
    try:
        user = User.objects.get(email='kaju@gmail.com')
    except User.DoesNotExist:
        user = User.objects.create_user(
            email='kaju@gmail.com',
            name='Kaju',
            password='123456@#',
            role='salesman'
        )

    # Sample data lists
    customers = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Global Industries', 'Smart Systems']
    items = ['Laptop Pro', 'Desktop Elite', 'Monitor 4K', 'Keyboard Wireless', 'Mouse Optical']
    categories = ['Electronics', 'Hardware', 'Accessories', 'Software', 'Services']
    brands = ['TechBrand', 'ProSeries', 'EliteMax', 'SmartTech', 'GlobalPro']

    print("Creating sample budget data...")
    
    # Create 20 yearly budgets
    for i in range(20):
        customer = random.choice(customers)
        item = random.choice(items)
        category = random.choice(categories)
        brand = random.choice(brands)
        
        total_budget_val = random.randint(10000, 100000)
        
        yearly_budget = YearlyBudget.objects.create(
            customer=customer,
            item=item,
            category=category,
            brand=brand,
            year=random.choice([2024, 2025]),
            total_budget=total_budget_val,
            status=random.choice(['draft', 'submitted', 'approved']),
            created_by=user
        )
        
        # Create monthly budgets for each yearly budget
        for month in range(1, 13):
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            budget_val = random.randint(500, 10000)
            actual_val = random.randint(400, 9000)
            
            MonthlyBudget.objects.create(
                yearly_budget=yearly_budget,
                month=month_names[month-1],
                month_number=month,
                budget_value=budget_val,
                actual_value=actual_val
            )
        
        print(f"Created budget {i+1}: {customer} - {item}")

    print("\nCreating sample forecast data...")
    
    # Create customers and items for forecasts
    forecast_customers = []
    forecast_items = []
    
    for customer_name in customers:
        customer_obj, created = Customer.objects.get_or_create(
            name=customer_name,
            defaults={
                'code': f'CUST{random.randint(100, 999)}',
                'email': f'{customer_name.lower().replace(" ", "")}@example.com',
                'region': random.choice(['North', 'South', 'East', 'West']),
                'segment': random.choice(['Enterprise', 'SMB', 'Retail']),
                'tier': random.choice(['Gold', 'Silver', 'Bronze']),
                'manager': user
            }
        )
        forecast_customers.append(customer_obj)
    
    for item_name in items:
        item_obj, created = Item.objects.get_or_create(
            name=item_name,
            defaults={
                'sku': f'SKU{random.randint(1000, 9999)}',
                'category': random.choice(categories),
                'brand': random.choice(brands),
                'unit_price': random.randint(100, 5000),
                'description': f'High quality {item_name.lower()}'
            }
        )
        forecast_items.append(item_obj)
    
    # Create 20 customer item forecasts
    for i in range(20):
        customer = random.choice(forecast_customers)
        item = random.choice(forecast_items)
        
        # Check if combination already exists
        if CustomerItemForecast.objects.filter(customer=customer, item=item).exists():
            continue
            
        forecast = CustomerItemForecast.objects.create(
            customer=customer,
            item=item,
            yearly_total=random.randint(1000, 50000),
            yearly_budget_impact=random.randint(50000, 500000),
            confidence=random.choice(['low', 'medium', 'high']),
            status=random.choice(['draft', 'submitted', 'approved']),
            created_by=user
        )
        
        # Create monthly forecasts
        for month in range(1, 13):
            month_names = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']
            
            quantity = random.randint(50, 1000)
            unit_price = item.unit_price
            
            MonthlyForecast.objects.create(
                customer_item_forecast=forecast,
                year=2024,
                month=month_names[month-1],
                month_index=month-1,
                quantity=quantity,
                unit_price=unit_price,
                total_value=quantity * unit_price
            )
        
        print(f"Created forecast {i+1}: {customer.name} - {item.name}")

    print(f"\n✅ Sample data created successfully!")
    print(f"📊 Created {YearlyBudget.objects.count()} yearly budgets")
    print(f"📅 Created {MonthlyBudget.objects.count()} monthly budgets")
    print(f"🏢 Created {Customer.objects.count()} customers")
    print(f"📦 Created {Item.objects.count()} items")
    print(f"📈 Created {CustomerItemForecast.objects.count()} forecasts")
    print(f"📊 Created {MonthlyForecast.objects.count()} monthly forecasts")

if __name__ == '__main__':
    create_sample_data()