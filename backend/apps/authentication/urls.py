from django.urls import path
from . import views

app_name = 'authentication'

def test_view(request):
    from django.http import JsonResponse
    return JsonResponse({'message': 'Custom auth URLs working', 'method': request.method})

urlpatterns = [
    # Test endpoint
    path('test/', test_view, name='test'),
    
    # JWT Authentication - try different endpoint name
    path('signin/', views.CustomTokenObtainPairView.as_view(), name='signin'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # Session Authentication (alternative)
    path('session/login/', views.LoginView.as_view(), name='session_login'),
    
    # User Profile Management
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('me/', views.ProfileView.as_view(), name='current_user'),
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('preferences/', views.UserPreferencesView.as_view(), name='preferences'),
    
    # Permission Checking
    path('permissions/', views.user_permissions, name='user_permissions'),
    path('check-permission/', views.check_permission, name='check_permission'),
    path('check-dashboard-access/', views.check_dashboard_access, name='check_dashboard_access'),
    
    # Session Info
    path('session/info/', views.SessionInfoView.as_view(), name='session_info'),
]
