# import os
# from pathlib import Path
# from datetime import timedelta

# # Use PyMySQL as MySQL client
# try:
#     import pymysql
#     pymysql.install_as_MySQLdb()
# except ImportError:
#     pass

# # Base directory
# BASE_DIR = Path(__file__).resolve().parent.parent

# # SECURITY
# SECRET_KEY = 'django-insecure-change-this-in-development'
# DEBUG = True
# ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']

# # Applications
# DJANGO_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
# ]

# THIRD_PARTY_APPS = [
#     'rest_framework',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'django_filters',
# ]

# LOCAL_APPS = [
#     'apps.authentication',
#     'apps.budgets',
#     'apps.forecasts',
#     'apps.inventory',
#     'apps.workflow',
#     'apps.notifications',
#     'apps.users',
#     'apps.dashboard',
#     'apps.reports',
# ]

# INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# # Middleware
# MIDDLEWARE = [
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# ROOT_URLCONF = 'stm_budget.urls'

# # Templates
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         'DIRS': [BASE_DIR / 'templates'],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.debug',
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# WSGI_APPLICATION = 'stm_budget.wsgi.application'

# # Database (MySQL for development)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'stm1_budget',
#         'USER': 'assume',
#         'PASSWORD': '12345@Br',
#         'HOST': 'localhost',
#         'PORT': '3306',
#         'OPTIONS': {
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#             'charset': 'utf8mb4',
#         },
#         'TEST': {
#             'CHARSET': 'utf8mb4',
#             'COLLATION': 'utf8mb4_unicode_ci',
#         },
#         # Disable RETURNING clause for MariaDB 10.4.32 compatibility
#         'FEATURES': {
#             'can_return_columns_from_insert': False,
#         },
#     }
# }


# # Cache (local memory)
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
#         'LOCATION': 'unique-snowflake',
#     }
# }

# # Password validation
# AUTH_PASSWORD_VALIDATORS = [
#     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# ]

# # Internationalization
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True

# # Static & media files
# STATIC_URL = '/static/'
# STATICFILES_DIRS = [BASE_DIR / 'static']
# STATIC_ROOT = BASE_DIR / 'staticfiles'

# MEDIA_URL = '/media/'
# MEDIA_ROOT = BASE_DIR / 'media'

# # Default primary key field type
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # Custom user
# AUTH_USER_MODEL = 'users.User'

# # REST Framework
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#         'rest_framework.authentication.SessionAuthentication',
#         'rest_framework.authentication.BasicAuthentication',
#     ],
#     'DEFAULT_PERMISSION_CLASSES': [
#         'rest_framework.permissions.IsAuthenticated',
#     ],
#     'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
#     'PAGE_SIZE': 50,
#     'DEFAULT_RENDERER_CLASSES': [
#         'rest_framework.renderers.JSONRenderer',
#         'rest_framework.renderers.BrowsableAPIRenderer',
#     ],
# }

# # Authentication
# LOGIN_URL = '/admin/login/'
# LOGIN_REDIRECT_URL = '/'
# LOGOUT_REDIRECT_URL = '/'

# AUTHENTICATION_BACKENDS = [
#     'apps.authentication.backends.EmailAuthBackend',
#     'django.contrib.auth.backends.ModelBackend',
# ]

# # CORS
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
# ]
# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOW_ALL_ORIGINS = True  # dev only

# # JWT
# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
#     'ROTATE_REFRESH_TOKENS': True,
#     'BLACKLIST_AFTER_ROTATION': True,
#     'UPDATE_LAST_LOGIN': True,
#     'ALGORITHM': 'HS256',
#     'SIGNING_KEY': SECRET_KEY,
#     'AUTH_HEADER_TYPES': ('Bearer',),
#     'USER_ID_FIELD': 'id',
#     'USER_ID_CLAIM': 'user_id',
#     'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
#     'TOKEN_TYPE_CLAIM': 'token_type',
# }

# # Email (fill with your dev credentials if needed)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = ''
# EMAIL_HOST_PASSWORD = ''

# # Logging
# LOG_DIR = BASE_DIR / 'logs'
# os.makedirs(LOG_DIR, exist_ok=True)

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
#             'style': '{',
#         },
#     },
#     'handlers': {
#         'file': {
#             'level': 'INFO',
#             'class': 'logging.FileHandler',
#             'filename': LOG_DIR / 'django.log',
#             'formatter': 'verbose',
#         },
#         'console': {
#             'level': 'INFO',
#             'class': 'logging.StreamHandler',
#             'formatter': 'verbose',
#         },
#     },
#     'root': {
#         'handlers': ['console', 'file'],
#         'level': 'INFO',
#     },
# }

# # Development security
# SECURE_BROWSER_XSS_FILTER = False
# SECURE_CONTENT_TYPE_NOSNIFF = False
# SECURE_SSL_REDIRECT = False
# SESSION_COOKIE_SECURE = False
# CSRF_COOKIE_SECURE = False

# # CSRF Settings for API
# CSRF_TRUSTED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
# ]
# CSRF_COOKIE_HTTPONLY = False
# CSRF_USE_SESSIONS = False

# # File uploads
# FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
# DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# # Admin
# X_FRAME_OPTIONS = 'SAMEORIGIN'
# SILENCED_SYSTEM_CHECKS = ['security.W019']

# # Override MariaDB version check and features for older versions
# import django.db.backends.mysql.base
# import django.db.backends.mysql.features

# # Monkey patch the version check
# original_init = django.db.backends.mysql.base.DatabaseWrapper.__init__
# def patched_init(self, *args, **kwargs):
#     original_init(self, *args, **kwargs)
#     self._mysql_server_info = '10.5.0-MariaDB'
#     # Disable RETURNING clause support
#     self.features.can_return_columns_from_insert = False
    
# django.db.backends.mysql.base.DatabaseWrapper.__init__ = patched_init

# # Override the property
# @property
# def mysql_server_info(self):
#     return getattr(self, '_mysql_server_info', '10.5.0-MariaDB')
    
# django.db.backends.mysql.base.DatabaseWrapper.mysql_server_info = mysql_server_info

# # Patch the features class to disable RETURNING support
# original_features_init = django.db.backends.mysql.features.DatabaseFeatures.__init__
# def patched_features_init(self, connection):
#     original_features_init(self, connection)
#     self.can_return_columns_from_insert = False
    
# django.db.backends.mysql.features.DatabaseFeatures.__init__ = patched_features_init
