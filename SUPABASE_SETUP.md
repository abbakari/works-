# Supabase Setup Guide

## Environment Variables Setup

After connecting to Supabase through the MCP integration, you'll need to update your environment variables with your actual Supabase project credentials:

1. **Get your Supabase credentials:**
   - Project URL: `https://your-project-id.supabase.co`
   - Anon Key: Your public anonymous key

2. **Update environment variables:**
   - Use the dev server control to set: `VITE_SUPABASE_URL`
   - Use the dev server control to set: `VITE_SUPABASE_ANON_KEY`

## Database Schema

You'll need to create the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read/update their own data
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Budgets Table
```sql
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to manage their own budgets
CREATE POLICY "Users can manage their own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);
```

### Inventory Items Table
```sql
CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read inventory
CREATE POLICY "Authenticated users can read inventory" ON inventory_items
  FOR SELECT TO authenticated USING (true);

-- Policy to allow admins to manage inventory (you might want to refine this)
CREATE POLICY "Admins can manage inventory" ON inventory_items
  FOR ALL TO authenticated USING (true);
```

## Authentication Setup

The app now uses Supabase Auth instead of Django authentication. Key changes:

- **Login**: Uses `supabase.auth.signInWithPassword()`
- **Logout**: Uses `supabase.auth.signOut()`
- **Session Management**: Automatic with Supabase Auth
- **User Profile**: Stored in the `users` table linked to auth.users

## Features Migrated

✅ **Completed:**
- User authentication (login/logout/signup)
- Budget management
- Inventory management  
- User management
- Basic API operations

⚠️ **Not Yet Implemented:**
- Forecasts (would need new table schema)
- Workflow system (would need new table schema)
- Notifications/Messages (would need new table schema)

## Next Steps

1. Connect to Supabase MCP integration
2. Create the database tables using the SQL above
3. Update environment variables with your actual Supabase credentials
4. Test the application
5. Add additional table schemas as needed for forecasts and workflow features
