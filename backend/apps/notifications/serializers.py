from rest_framework import serializers
from .models import Message
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    from_user_name = serializers.CharField(source='from_user.name', read_only=True)
    to_user_name = serializers.CharField(source='to_user.name', read_only=True)
    from_user_role = serializers.CharField(source='from_user.role', read_only=True)
    to_user_role = serializers.CharField(source='to_user.role', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'from_user', 'to_user', 'from_user_name', 'to_user_name',
            'from_user_role', 'to_user_role', 'subject', 'message', 
            'priority', 'category', 'status', 'is_read', 'reply_to',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['from_user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['from_user'] = self.context['request'].user
        return super().create(validated_data)