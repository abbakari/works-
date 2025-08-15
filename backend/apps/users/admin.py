from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.exceptions import ValidationError
from django import forms
from .models import User, UserSession, UserPreferences


class CustomUserCreationForm(UserCreationForm):
    """Custom user creation form for admin"""
    email = forms.EmailField(required=True)
    name = forms.CharField(max_length=255, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'name', 'role', 'department')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = user.email  # Set username to email
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    """Custom user change form for admin"""
    
    class Meta:
        model = User
        fields = '__all__'


class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    
    list_display = ('email', 'name', 'role', 'department', 'is_active', 'is_staff', 'created_at')
    list_filter = ('role', 'department', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'name', 'username')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'phone', 'profile_picture')}),
        ('Role & Department', {'fields': ('role', 'department', 'manager')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'last_login_time')}),
        ('Settings', {'fields': ('timezone',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'role', 'department', 'is_active', 'is_staff'),
        }),
    )
    
    readonly_fields = ('last_login', 'date_joined', 'last_login_time', 'created_at', 'updated_at')


class UserSessionAdmin(admin.ModelAdmin):
    """User Session admin"""
    list_display = ('user', 'ip_address', 'is_active', 'created_at', 'last_activity')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__email', 'user__name', 'ip_address')
    readonly_fields = ('session_key', 'created_at', 'last_activity')


class UserPreferencesAdmin(admin.ModelAdmin):
    """User Preferences admin"""
    list_display = ('user', 'default_dashboard', 'theme', 'email_notifications')
    list_filter = ('theme', 'email_notifications', 'browser_notifications')
    search_fields = ('user__email', 'user__name')


# Register models
admin.site.register(User, UserAdmin)
admin.site.register(UserSession, UserSessionAdmin)
admin.site.register(UserPreferences, UserPreferencesAdmin)