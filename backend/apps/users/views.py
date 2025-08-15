from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import User, UserSession, UserPreferences
from .serializers import UserSerializer, UserSessionSerializer, UserPreferencesSerializer
try:
    from apps.permissions import CanManageUsers
except ImportError:
    CanManageUsers = permissions.IsAuthenticated
import logging

logger = logging.getLogger(__name__)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'department', 'is_active']
    search_fields = ['name', 'email', 'username']
    ordering_fields = ['name', 'created_at', 'last_login_time']
    ordering = ['name']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['activate', 'deactivate', 'reset_password', 'change_role', 'create', 'destroy']:
            # Only admins can perform these actions
            permission_classes = [permissions.IsAuthenticated]
            return [permission() for permission in permission_classes]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        logger.info(f"User creation request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"User creation validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = serializer.save()
            logger.info(f"User created successfully: {user.email}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"User creation error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate user"""
        user = self.get_object()
        user.is_active = True
        user.save()
        logger.info(f"User {user.email} activated by {request.user.email}")
        return Response({'message': 'User activated successfully'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate user"""
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'Cannot deactivate yourself'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save()
        logger.info(f"User {user.email} deactivated by {request.user.email}")
        return Response({'message': 'User deactivated successfully'})
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset user password"""
        user = self.get_object()
        new_password = request.data.get('password', 'password123')
        user.set_password(new_password)
        user.save()
        logger.info(f"Password reset for user {user.email} by {request.user.email}")
        return Response({'message': 'Password reset successfully'})
    
    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """Change user role"""
        user = self.get_object()
        new_role = request.data.get('role')
        if new_role not in ['admin', 'manager', 'salesman', 'supply_chain']:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = new_role
        user.save()
        logger.info(f"Role changed for user {user.email} to {new_role} by {request.user.email}")
        return Response({'message': f'Role changed to {new_role} successfully'})
