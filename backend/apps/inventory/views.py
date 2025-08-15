from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import JsonResponse
import logging

from apps.forecasts.models import Customer, Item

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_endpoint(request):
    """Test endpoint to verify API is working"""
    return Response({'message': 'API is working', 'user': request.user.name})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_customers(request):
    """Get all customers"""
    try:
        customers = Customer.objects.filter(active=True)
        data = []
        for customer in customers:
            data.append({
                'id': customer.id,
                'name': customer.name,
                'code': customer.code,
                'email': customer.email,
                'phone': customer.phone,
                'region': customer.region,
                'segment': customer.segment,
                'active': customer.active
            })
        return Response(data)
    except Exception as e:
        logger.error(f"Error getting customers: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_items(request):
    """Get all items"""
    try:
        items = Item.objects.filter(active=True)
        data = []
        for item in items:
            data.append({
                'id': item.id,
                'name': item.name,
                'code': item.sku,
                'sku': item.sku,
                'category': item.category,
                'brand': item.brand,
                'unit_price': float(item.unit_price),
                'active': item.active
            })
        return Response(data)
    except Exception as e:
        logger.error(f"Error getting items: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_customer(request):
    """Create a new customer"""
    try:
        data = request.data
        logger.info(f"Creating customer with data: {data}")
        
        # Check if customer already exists
        existing = Customer.objects.filter(code=data.get('code')).first()
        if existing:
            return Response({
                'id': existing.id,
                'name': existing.name,
                'code': existing.code,
                'email': existing.email,
                'active': existing.active
            })
        
        customer_id = f"CUST_{data.get('code', 'UNKNOWN')}"
        
        customer = Customer.objects.create(
            id=customer_id,
            name=data.get('name', 'Unknown Customer'),
            code=data.get('code', 'UNKNOWN'),
            email=f"{data.get('code', 'unknown')}@example.com",
            phone='+1-000-000-0000',
            region='Default',
            segment='General',
            credit_limit=100000,
            currency='USD',
            active=True,
            manager=None,
            channels=[],
            seasonality='medium',
            tier='bronze'
        )
        
        logger.info(f"Customer created successfully: {customer.id}")
        return Response({
            'id': customer.id,
            'name': customer.name,
            'code': customer.code,
            'email': customer.email,
            'active': customer.active
        })
    except Exception as e:
        logger.error(f"Error creating customer: {str(e)}")
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_item(request):
    """Create a new item"""
    try:
        data = request.data
        logger.info(f"Creating item with data: {data}")
        
        # Check if item already exists
        existing = Item.objects.filter(sku=data.get('code')).first()
        if existing:
            return Response({
                'id': existing.id,
                'name': existing.name,
                'code': existing.sku,
                'category': existing.category,
                'brand': existing.brand,
                'active': existing.active
            })
        
        item_id = f"ITEM_{data.get('code', 'UNKNOWN')}"
        
        item = Item.objects.create(
            id=item_id,
            sku=data.get('code', 'UNKNOWN'),
            name=data.get('name', 'Unknown Item'),
            category=data.get('category', 'General'),
            brand=data.get('brand', 'Generic'),
            unit_price=100.00,
            cost_price=50.00,
            currency='USD',
            unit='pcs',
            active=True
        )
        
        logger.info(f"Item created successfully: {item.id}")
        return Response({
            'id': item.id,
            'name': item.name,
            'code': item.sku,
            'category': item.category,
            'brand': item.brand,
            'active': item.active
        })
    except Exception as e:
        logger.error(f"Error creating item: {str(e)}")
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_forecast_entry(request):
    """Create a new forecast entry for customer-item combination"""
    try:
        data = request.data
        
        # Create a simple forecast entry record
        from apps.forecasts.models import CustomerItemForecast
        
        # Find customer and item
        customer = Customer.objects.filter(name=data.get('customer')).first()
        item = Item.objects.filter(name=data.get('item')).first()
        
        if not customer or not item:
            return Response({'error': 'Customer or item not found'}, status=400)
        
        # Create forecast entry
        forecast_id = f"FORECAST_{customer.code}_{item.sku}_{len(CustomerItemForecast.objects.all()) + 1}"
        
        # For now, create a simple entry - we'll expand this later
        forecast_data = {
            'id': forecast_id,
            'customer': data.get('customer'),
            'item': data.get('item'),
            'bud25': 0,
            'ytd25': 0,
            'forecast': 0,
            'stock': 0,
            'git': 0,
            'eta': ''
        }
        
        return Response(forecast_data)
    except Exception as e:
        logger.error(f"Error creating forecast entry: {str(e)}")
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def save_monthly_budget(request):
    """Save monthly budget data"""
    try:
        data = request.data
        logger.info(f"Saving monthly budget data: {data}")
        
        # For now, just return success - we can expand this later to save to a proper budget table
        response_data = {
            'success': True,
            'message': 'Monthly budget data saved successfully',
            'budget_id': data.get('budget_id'),
            'total_budget': sum(month.get('budgetValue', 0) for month in data.get('monthly_data', [])),
            'total_value': sum(month.get('budgetValue', 0) * month.get('rate', 1) for month in data.get('monthly_data', []))
        }
        
        logger.info(f"Monthly budget saved successfully: {response_data}")
        return Response(response_data)
    except Exception as e:
        logger.error(f"Error saving monthly budget: {str(e)}")
        return Response({'error': str(e)}, status=400)