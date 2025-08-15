from django.core.management.base import BaseCommand
from apps.forecasts.models import Customer, Item
from apps.users.models import User


class Command(BaseCommand):
    help = 'Create sample customers and items for testing'

    def handle(self, *args, **options):
        # Create sample customers
        customers_data = [
            {
                'id': 'CUST_AAI001',
                'name': 'Action Aid International (Tz)',
                'code': 'AAI001',
                'email': 'orders@actionaid.tz',
                'phone': '+255-22-123-4567',
                'region': 'Africa',
                'segment': 'NGO',
                'credit_limit': 500000,
                'currency': 'USD',
                'active': True
            },
            {
                'id': 'CUST_ADV002',
                'name': 'ADVENT CONSTRUCTION LTD.',
                'code': 'ADV002',
                'email': 'orders@advent.com',
                'phone': '+1-555-0101',
                'region': 'North America',
                'segment': 'Enterprise',
                'credit_limit': 750000,
                'currency': 'USD',
                'active': True
            },
            {
                'id': 'CUST_TEC003',
                'name': 'Tech Solutions Inc.',
                'code': 'TEC003',
                'email': 'info@techsolutions.com',
                'phone': '+1-555-0202',
                'region': 'North America',
                'segment': 'Enterprise',
                'credit_limit': 300000,
                'currency': 'USD',
                'active': True
            }
        ]

        for customer_data in customers_data:
            customer, created = Customer.objects.get_or_create(
                code=customer_data['code'],
                defaults=customer_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created customer: {customer.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Customer already exists: {customer.name}')
                )

        # Create sample items
        items_data = [
            {
                'id': 'ITEM_BFG235',
                'sku': 'BFG235',
                'name': 'BF GOODRICH TYRE 235/85R16 120/116S TL ATT/A KO2 LRERWLGO',
                'category': 'TYRE SERVICE',
                'brand': 'BF GOODRICH',
                'unit_price': 250.00,
                'cost_price': 180.00,
                'currency': 'USD',
                'unit': 'pcs',
                'active': True,
                'description': 'All-terrain tire for heavy-duty vehicles'
            },
            {
                'id': 'ITEM_BFG265',
                'sku': 'BFG265',
                'name': 'BF GOODRICH TYRE 265/65R17 120/117S TL ATT/A KO2 LRERWLGO',
                'category': 'TYRE SERVICE',
                'brand': 'BF GOODRICH',
                'unit_price': 280.00,
                'cost_price': 200.00,
                'currency': 'USD',
                'unit': 'pcs',
                'active': True,
                'description': 'All-terrain tire for SUVs and light trucks'
            },
            {
                'id': 'ITEM_MICH265',
                'sku': 'MICH265',
                'name': 'MICHELIN TYRE 265/65R17 112T TL LTX TRAIL',
                'category': 'TYRE SERVICE',
                'brand': 'MICHELIN',
                'unit_price': 320.00,
                'cost_price': 240.00,
                'currency': 'USD',
                'unit': 'pcs',
                'active': True,
                'description': 'Premium highway tire for SUVs'
            },
            {
                'id': 'ITEM_WHEEL001',
                'sku': 'WHEEL001',
                'name': 'WHEEL BALANCE ALLOYD RIMS',
                'category': 'TYRE SERVICE',
                'brand': 'TYRE SERVICE',
                'unit_price': 150.00,
                'cost_price': 100.00,
                'currency': 'USD',
                'unit': 'pcs',
                'active': True,
                'description': 'Professional wheel balancing service for alloy rims'
            },
            {
                'id': 'ITEM_CONT225',
                'sku': 'CONT225',
                'name': 'CONTINENTAL TYRE 225/60R16 98H',
                'category': 'TYRE SERVICE',
                'brand': 'CONTINENTAL',
                'unit_price': 200.00,
                'cost_price': 150.00,
                'currency': 'USD',
                'unit': 'pcs',
                'active': True,
                'description': 'Premium passenger car tire'
            }
        ]

        for item_data in items_data:
            item, created = Item.objects.get_or_create(
                sku=item_data['sku'],
                defaults=item_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created item: {item.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Item already exists: {item.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Sample data creation completed!')
        )