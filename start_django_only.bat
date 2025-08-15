@echo off
echo Starting Django server only...
cd backend
python manage.py runserver 127.0.0.1:8000
pause