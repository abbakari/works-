# Frontend Authentication Fix

## Issue Found
The Django server is loading different URL patterns than expected. The `/api/auth/login/` endpoint is being handled by a different view that expects `username` instead of `email`.

## Quick Fix
Update your frontend API service to use the correct field name:

### Option 1: Change frontend to send username
In `src/lib/api.ts`, change the login method:

```typescript
async login(email: string, password: string) {
  return this.request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username: email, password }), // Changed email to username
  });
}
```

### Option 2: Use the working endpoint
Test with curl first:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d "{\"username\":\"admin@example.com\",\"password\":\"admin123\"}"
```

## Credentials to Use
- **Username/Email**: `admin@example.com`
- **Password**: `admin123`

## Test Steps
1. Update the frontend API call to use `username` instead of `email`
2. Restart your frontend development server
3. Try logging in with the credentials above

This should resolve the HTTP 400 error you're seeing.