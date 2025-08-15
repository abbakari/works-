-- Check if data exists
SELECT 'Yearly Budgets:' as table_name, COUNT(*) as count FROM yearly_budgets
UNION ALL
SELECT 'Customer Item Forecasts:', COUNT(*) FROM customer_item_forecasts
UNION ALL
SELECT 'Customers:', COUNT(*) FROM customers
UNION ALL
SELECT 'Items:', COUNT(*) FROM items;

-- Check specific forecast ID 1
SELECT * FROM customer_item_forecasts WHERE id = 1;

-- Check all forecasts
SELECT id, customer_id, item_id, status FROM customer_item_forecasts LIMIT 5;