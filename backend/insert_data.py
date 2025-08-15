#!/usr/bin/env python
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stm_budget.settings')
django.setup()

from apps.budgets.models import YearlyBudget
from apps.forecasts.models import Customer, Item, CustomerItemForecast
from apps.users.models import User

def insert_sample_data():
    # Clear existing data first
    print("Clearing existing data...")
    YearlyBudget.objects.all().delete()
    CustomerItemForecast.objects.all().delete()
    Customer.objects.all().delete()
    Item.objects.all().delete()
    
    # Get or create user
    try:
        user = User.objects.get(email='said@gmail.com')
    except User.DoesNotExist:
        user = User.objects.create_user(
            email='said@gmail.com',
            name='Said',
            password='123456@#',
            role='manager'
        )
        print(f'Created user: {user.name}')
    
    print("Inserting budget data...")
    
    # Budget data
    budgets = [
        ('ABC Corp', 'Laptop Pro', 'Electronics', 'TechBrand', 2024, 50000, 'draft'),
        ('XYZ Ltd', 'Desktop Elite', 'Hardware', 'ProSeries', 2024, 75000, 'submitted'),
        ('Tech Solutions', 'Monitor 4K', 'Electronics', 'EliteMax', 2024, 30000, 'approved'),
        ('Global Industries', 'Keyboard Wireless', 'Accessories', 'SmartTech', 2024, 15000, 'draft'),
        ('Smart Systems', 'Mouse Optical', 'Accessories', 'GlobalPro', 2024, 12000, 'submitted'),
        ('Digital Corp', 'Tablet Max', 'Electronics', 'TechBrand', 2024, 45000, 'approved'),
        ('Future Tech', 'Phone Smart', 'Electronics', 'ProSeries', 2024, 80000, 'draft'),
        ('Innovation Labs', 'Headset Pro', 'Accessories', 'EliteMax', 2024, 25000, 'submitted'),
        ('Prime Systems', 'Camera HD', 'Electronics', 'SmartTech', 2024, 60000, 'approved'),
        ('Elite Solutions', 'Printer Laser', 'Hardware', 'GlobalPro', 2024, 35000, 'draft'),
        ('Mega Corp', 'Scanner Pro', 'Hardware', 'TechBrand', 2025, 40000, 'submitted'),
        ('Super Tech', 'Router WiFi', 'Hardware', 'ProSeries', 2025, 20000, 'approved'),
        ('Ultra Systems', 'Switch Network', 'Hardware', 'EliteMax', 2025, 55000, 'draft'),
        ('Power Solutions', 'UPS Battery', 'Hardware', 'SmartTech', 2025, 30000, 'submitted'),
        ('Quick Tech', 'Server Rack', 'Hardware', 'GlobalPro', 2025, 90000, 'approved'),
        ('Fast Corp', 'Storage SSD', 'Hardware', 'TechBrand', 2025, 65000, 'draft'),
        ('Speed Systems', 'Memory RAM', 'Hardware', 'ProSeries', 2025, 25000, 'submitted'),
        ('Rapid Tech', 'Graphics Card', 'Hardware', 'EliteMax', 2025, 85000, 'approved'),
        ('Swift Solutions', 'Motherboard', 'Hardware', 'SmartTech', 2025, 45000, 'draft'),
        ('Agile Corp', 'Processor CPU', 'Hardware', 'GlobalPro', 2025, 70000, 'submitted'),
    ]
    
    for customer, item, category, brand, year, total_budget, status in budgets:
        YearlyBudget.objects.create(
            customer=customer,
            item=item,
            category=category,
            brand=brand,
            year=year,
            total_budget=total_budget,
            status=status,
            created_by=user
        )
    
    print(f"Created {len(budgets)} budget records")
    
    print("Inserting customer data...")
    
    # Customer data with all required fields
    customers_data = [
        ('Customer Alpha', 'CA001', 'alpha@example.com', 'North', 'Enterprise', 'Gold', 100000),
        ('Customer Beta', 'CB002', 'beta@example.com', 'South', 'SMB', 'Silver', 50000),
        ('Customer Gamma', 'CG003', 'gamma@example.com', 'East', 'Retail', 'Bronze', 25000),
        ('Customer Delta', 'CD004', 'delta@example.com', 'West', 'Enterprise', 'Gold', 150000),
        ('Customer Epsilon', 'CE005', 'epsilon@example.com', 'North', 'SMB', 'Silver', 75000),
        ('Customer Zeta', 'CZ006', 'zeta@example.com', 'South', 'Retail', 'Bronze', 30000),
        ('Customer Eta', 'CH007', 'eta@example.com', 'East', 'Enterprise', 'Gold', 200000),
        ('Customer Theta', 'CT008', 'theta@example.com', 'West', 'SMB', 'Silver', 60000),
        ('Customer Iota', 'CI009', 'iota@example.com', 'North', 'Retail', 'Bronze', 40000),
        ('Customer Kappa', 'CK010', 'kappa@example.com', 'South', 'Enterprise', 'Gold', 180000),
    ]
    
    customers = []
    for name, code, email, region, segment, tier, credit_limit in customers_data:
        customer = Customer.objects.create(
            name=name,
            code=code,
            email=email,
            region=region,
            segment=segment,
            tier=tier,
            credit_limit=credit_limit,
            manager=user
        )
        customers.append(customer)
    
    print(f"Created {len(customers)} customer records")
    
    print("Inserting item data...")
    
    # Item data
    items_data = [
        ('Product A', 'PA001', 'Electronics', 'TechBrand', 500, 'High-quality electronic product'),
        ('Product B', 'PB002', 'Hardware', 'ProSeries', 750, 'Professional hardware solution'),
        ('Product C', 'PC003', 'Accessories', 'EliteMax', 200, 'Premium accessory item'),
        ('Product D', 'PD004', 'Software', 'SmartTech', 1000, 'Advanced software package'),
        ('Product E', 'PE005', 'Services', 'GlobalPro', 300, 'Professional service offering'),
        ('Product F', 'PF006', 'Electronics', 'TechBrand', 600, 'Next-gen electronic device'),
        ('Product G', 'PG007', 'Hardware', 'ProSeries', 850, 'Industrial hardware component'),
        ('Product H', 'PH008', 'Accessories', 'EliteMax', 150, 'Essential accessory kit'),
        ('Product I', 'PI009', 'Software', 'SmartTech', 1200, 'Enterprise software suite'),
        ('Product J', 'PJ010', 'Services', 'GlobalPro', 400, 'Consulting service package'),
    ]
    
    items = []
    for name, sku, category, brand, unit_price, description in items_data:
        item = Item.objects.create(
            name=name,
            sku=sku,
            category=category,
            brand=brand,
            unit_price=unit_price,
            description=description
        )
        items.append(item)
    
    print(f"Created {len(items)} item records")
    
    print("Inserting forecast data...")
    
    # Forecast data
    forecasts_data = [
        (0, 0, 1000, 500000, 'high', 'approved'),
        (0, 1, 800, 600000, 'medium', 'submitted'),
        (1, 2, 1500, 300000, 'high', 'approved'),
        (1, 3, 500, 500000, 'low', 'draft'),
        (2, 4, 2000, 600000, 'medium', 'submitted'),
        (2, 5, 750, 450000, 'high', 'approved'),
        (3, 6, 600, 510000, 'medium', 'submitted'),
        (3, 7, 2500, 375000, 'high', 'approved'),
        (4, 8, 400, 480000, 'low', 'draft'),
        (4, 9, 1800, 720000, 'medium', 'submitted'),
        (5, 0, 900, 450000, 'high', 'approved'),
        (5, 1, 1200, 900000, 'medium', 'submitted'),
        (6, 2, 1600, 320000, 'high', 'approved'),
        (6, 3, 350, 350000, 'low', 'draft'),
        (7, 4, 2200, 660000, 'medium', 'submitted'),
        (7, 5, 850, 510000, 'high', 'approved'),
        (8, 6, 700, 595000, 'medium', 'submitted'),
        (8, 7, 2800, 420000, 'high', 'approved'),
        (9, 8, 450, 540000, 'low', 'draft'),
        (9, 9, 1950, 780000, 'medium', 'submitted'),
    ]
    
    for customer_idx, item_idx, yearly_total, yearly_budget_impact, confidence, status in forecasts_data:
        CustomerItemForecast.objects.create(
            customer=customers[customer_idx],
            item=items[item_idx],
            yearly_total=yearly_total,
            yearly_budget_impact=yearly_budget_impact,
            confidence=confidence,
            status=status,
            created_by=user
        )
    
    print(f"Created {len(forecasts_data)} forecast records")
    
    print("\n✅ Sample data inserted successfully!")
    print(f"📊 Total budgets: {YearlyBudget.objects.count()}")
    print(f"🏢 Total customers: {Customer.objects.count()}")
    print(f"📦 Total items: {Item.objects.count()}")
    print(f"📈 Total forecasts: {CustomerItemForecast.objects.count()}")

if __name__ == '__main__':
    insert_sample_data()