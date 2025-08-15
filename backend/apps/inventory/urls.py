from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_endpoint, name='test'),
    path('customers/', views.get_customers, name='customers'),
    path('items/', views.get_items, name='items'),
    path('customers/create/', views.create_customer, name='create_customer'),
    path('items/create/', views.create_item, name='create_item'),
    path('forecast/create/', views.create_forecast_entry, name='create_forecast_entry'),
    path('budget/monthly/save/', views.save_monthly_budget, name='save_monthly_budget'),
]