-- Insert one budget at a time to identify the issue
INSERT INTO yearly_budgets (customer, item, category, brand, year, total_budget, status, created_by_id, created_at, updated_at) VALUES
('ABC Corp', 'Laptop Pro', 'Electronics', 'TechBrand', 2024, 50000.00, 'draft', 7, NOW(), NOW());

-- If above works, run this batch
INSERT INTO yearly_budgets (customer, item, category, brand, year, total_budget, status, created_by_id, created_at, updated_at) VALUES
('XYZ Ltd', 'Desktop Elite', 'Hardware', 'ProSeries', 2024, 75000.00, 'submitted', 7, NOW(), NOW()),
('Tech Solutions', 'Monitor 4K', 'Electronics', 'EliteMax', 2024, 30000.00, 'approved', 7, NOW(), NOW()),
('Global Industries', 'Keyboard Wireless', 'Accessories', 'SmartTech', 2024, 15000.00, 'draft', 7, NOW(), NOW()),
('Smart Systems', 'Mouse Optical', 'Accessories', 'GlobalPro', 2024, 12000.00, 'submitted', 7, NOW(), NOW()),
('Digital Corp', 'Tablet Max', 'Electronics', 'TechBrand', 2024, 45000.00, 'approved', 7, NOW(), NOW());

-- Check if there's a unique constraint issue
SELECT customer, item, year, COUNT(*) as count FROM yearly_budgets GROUP BY customer, item, year HAVING count > 1;