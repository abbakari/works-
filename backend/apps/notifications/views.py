from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # All users can see messages they sent or received
        return Message.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        ).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['get'])
    def inbox(self, request):
        """Get messages received by current user"""
        messages = Message.objects.filter(to_user=request.user)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get messages sent by current user"""
        messages = Message.objects.filter(from_user=request.user)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)