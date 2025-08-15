-- Fix user references in database
-- Get the admin user ID first
SELECT id, username, role FROM users_user WHERE role = 'admin' LIMIT 1;

-- Update yearly_budgets to use admin user (assuming ID 11 from previous output)
UPDATE yearly_budgets SET created_by_id = 11;

-- Update customer_item_forecasts to use admin user
UPDATE customer_item_forecasts SET created_by_id = 11;

-- Verify the updates
SELECT 'Budgets updated:' as message, COUNT(*) as count FROM yearly_budgets WHERE created_by_id = 11;
SELECT 'Forecasts updated:' as message, COUNT(*) as count FROM customer_item_forecasts WHERE created_by_id = 11;