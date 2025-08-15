from rest_framework import serializers
from apps.forecasts.models import Customer, Item
from .models import ItemCategory, ItemBrand


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for Customer model"""
    
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'code', 'email', 'phone', 'region', 'segment',
            'credit_limit', 'currency', 'active', 'created_at', 'last_activity'
        ]
        read_only_fields = ['id', 'created_at', 'last_activity']


class ItemSerializer(serializers.ModelSerializer):
    """Serializer for Item model"""
    code = serializers.CharField(source='sku', read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'sku', 'code', 'name', 'category', 'brand', 'unit_price', 'cost_price',
            'currency', 'unit', 'active', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']


class ItemCategorySerializer(serializers.ModelSerializer):
    """Serializer for ItemCategory model"""
    
    class Meta:
        model = ItemCategory
        fields = '__all__'


class ItemBrandSerializer(serializers.ModelSerializer):
    """Serializer for ItemBrand model"""
    
    class Meta:
        model = ItemBrand
        fields = '__all__'