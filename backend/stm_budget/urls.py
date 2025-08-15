from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.utils import timezone
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'STM Budget API is running',
        'timestamp': timezone.now().isoformat()
    })

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Health check (with and without api prefix)
    path('health/', health_check, name='health_check_root'),
    path('api/health/', health_check, name='health_check'),

    # API Routes
    path('api/auth/', include('apps.authentication.urls')),
    
    # JWT Token endpoints (alternative access)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/users/', include('apps.users.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/forecasts/', include('apps.forecasts.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/workflow/', include('apps.workflow.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/reports/', include('apps.reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = "STM Budget Administration"
admin.site.site_title = "STM Budget Admin"
admin.site.index_title = "Welcome to STM Budget Administration"
