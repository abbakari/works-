-- Batch 1: More yearly budgets
INSERT INTO yearly_budgets (customer, item, category, brand, year, total_budget, status, created_by_id, created_at, updated_at) VALUES
('Future Tech', 'Phone Smart', 'Electronics', 'ProSeries', 2024, 80000.00, 'draft', 7, NOW(), NOW()),
('Innovation Labs', 'Headset Pro', 'Accessories', 'EliteMax', 2024, 25000.00, 'submitted', 7, NOW(), NOW()),
('Prime Systems', 'Camera HD', 'Electronics', 'SmartTech', 2024, 60000.00, 'approved', 7, NOW(), NOW()),
('Elite Solutions', 'Printer Laser', 'Hardware', 'GlobalPro', 2024, 35000.00, 'draft', 7, NOW(), NOW()),
('Mega Corp', 'Scanner Pro', 'Hardware', 'TechBrand', 2025, 40000.00, 'submitted', 7, NOW(), NOW());

-- Batch 2: More yearly budgets
INSERT INTO yearly_budgets (customer, item, category, brand, year, total_budget, status, created_by_id, created_at, updated_at) VALUES
('Super Tech', 'Router WiFi', 'Hardware', 'ProSeries', 2025, 20000.00, 'approved', 7, NOW(), NOW()),
('Ultra Systems', 'Switch Network', 'Hardware', 'EliteMax', 2025, 55000.00, 'draft', 7, NOW(), NOW()),
('Power Solutions', 'UPS Battery', 'Hardware', 'SmartTech', 2025, 30000.00, 'submitted', 7, NOW(), NOW()),
('Quick Tech', 'Server Rack', 'Hardware', 'GlobalPro', 2025, 90000.00, 'approved', 7, NOW(), NOW()),
('Fast Corp', 'Storage SSD', 'Hardware', 'TechBrand', 2025, 65000.00, 'draft', 7, NOW(), NOW());

-- Batch 3: Final yearly budgets
INSERT INTO yearly_budgets (customer, item, category, brand, year, total_budget, status, created_by_id, created_at, updated_at) VALUES
('Speed Systems', 'Memory RAM', 'Hardware', 'ProSeries', 2025, 25000.00, 'submitted', 7, NOW(), NOW()),
('Rapid Tech', 'Graphics Card', 'Hardware', 'EliteMax', 2025, 85000.00, 'approved', 7, NOW(), NOW()),
('Swift Solutions', 'Motherboard', 'Hardware', 'SmartTech', 2025, 45000.00, 'draft', 7, NOW(), NOW()),
('Agile Corp', 'Processor CPU', 'Hardware', 'GlobalPro', 2025, 70000.00, 'submitted', 7, NOW(), NOW());

-- Insert customers
INSERT INTO customers (name, code, email, region, segment, tier, active, credit_limit, created_at, updated_at, manager_id) VALUES
('Customer Alpha', 'CA001', 'alpha@example.com', 'North', 'Enterprise', 'Gold', 1, 100000.00, NOW(), NOW(), 1),
('Customer Beta', 'CB002', 'beta@example.com', 'South', 'SMB', 'Silver', 1, 50000.00, NOW(), NOW(), 1),
('Customer Gamma', 'CG003', 'gamma@example.com', 'East', 'Retail', 'Bronze', 1, 25000.00, NOW(), NOW(), 1),
('Customer Delta', 'CD004', 'delta@example.com', 'West', 'Enterprise', 'Gold', 1, 150000.00, NOW(), NOW(), 1),
('Customer Epsilon', 'CE005', 'epsilon@example.com', 'North', 'SMB', 'Silver', 1, 75000.00, NOW(), NOW(), 1);

-- Insert more customers
INSERT INTO customers (name, code, email, region, segment, tier, active, credit_limit, created_at, updated_at, manager_id) VALUES
('Customer Zeta', 'CZ006', 'zeta@example.com', 'South', 'Retail', 'Bronze', 1, 30000.00, NOW(), NOW(), 1),
('Customer Eta', 'CH007', 'eta@example.com', 'East', 'Enterprise', 'Gold', 1, 200000.00, NOW(), NOW(), 1),
('Customer Theta', 'CT008', 'theta@example.com', 'West', 'SMB', 'Silver', 1, 60000.00, NOW(), NOW(), 1),
('Customer Iota', 'CI009', 'iota@example.com', 'North', 'Retail', 'Bronze', 1, 40000.00, NOW(), NOW(), 1),
('Customer Kappa', 'CK010', 'kappa@example.com', 'South', 'Enterprise', 'Gold', 1, 180000.00, NOW(), NOW(), 1);

-- Insert items
INSERT INTO items (name, sku, category, brand, unit_price, description, active, seasonal, created_at, updated_at) VALUES
('Product A', 'PA001', 'Electronics', 'TechBrand', 500.00, 'High-quality electronic product', 1, 0, NOW(), NOW()),
('Product B', 'PB002', 'Hardware', 'ProSeries', 750.00, 'Professional hardware solution', 1, 0, NOW(), NOW()),
('Product C', 'PC003', 'Accessories', 'EliteMax', 200.00, 'Premium accessory item', 1, 1, NOW(), NOW()),
('Product D', 'PD004', 'Software', 'SmartTech', 1000.00, 'Advanced software package', 1, 0, NOW(), NOW()),
('Product E', 'PE005', 'Services', 'GlobalPro', 300.00, 'Professional service offering', 1, 0, NOW(), NOW());

-- Insert more items
INSERT INTO items (name, sku, category, brand, unit_price, description, active, seasonal, created_at, updated_at) VALUES
('Product F', 'PF006', 'Electronics', 'TechBrand', 600.00, 'Next-gen electronic device', 1, 1, NOW(), NOW()),
('Product G', 'PG007', 'Hardware', 'ProSeries', 850.00, 'Industrial hardware component', 1, 0, NOW(), NOW()),
('Product H', 'PH008', 'Accessories', 'EliteMax', 150.00, 'Essential accessory kit', 1, 0, NOW(), NOW()),
('Product I', 'PI009', 'Software', 'SmartTech', 1200.00, 'Enterprise software suite', 1, 0, NOW(), NOW()),
('Product J', 'PJ010', 'Services', 'GlobalPro', 400.00, 'Consulting service package', 1, 1, NOW(), NOW());

-- Insert forecasts batch 1
INSERT INTO customer_item_forecasts (customer_id, item_id, yearly_total, yearly_budget_impact, confidence, status, created_by_id, created_at, updated_at) VALUES
(1, 1, 1000, 500000.00, 'high', 'approved', 7, NOW(), NOW()),
(1, 2, 800, 600000.00, 'medium', 'submitted', 7, NOW(), NOW()),
(2, 3, 1500, 300000.00, 'high', 'approved', 7, NOW(), NOW()),
(2, 4, 500, 500000.00, 'low', 'draft', 7, NOW(), NOW()),
(3, 5, 2000, 600000.00, 'medium', 'submitted', 7, NOW(), NOW());

-- Insert forecasts batch 2
INSERT INTO customer_item_forecasts (customer_id, item_id, yearly_total, yearly_budget_impact, confidence, status, created_by_id, created_at, updated_at) VALUES
(3, 6, 750, 450000.00, 'high', 'approved', 7, NOW(), NOW()),
(4, 7, 600, 510000.00, 'medium', 'submitted', 7, NOW(), NOW()),
(4, 8, 2500, 375000.00, 'high', 'approved', 7, NOW(), NOW()),
(5, 9, 400, 480000.00, 'low', 'draft', 7, NOW(), NOW()),
(5, 10, 1800, 720000.00, 'medium', 'submitted', 7, NOW(), NOW());

-- Insert forecasts batch 3
INSERT INTO customer_item_forecasts (customer_id, item_id, yearly_total, yearly_budget_impact, confidence, status, created_by_id, created_at, updated_at) VALUES
(6, 1, 900, 450000.00, 'high', 'approved', 7, NOW(), NOW()),
(6, 2, 1200, 900000.00, 'medium', 'submitted', 7, NOW(), NOW()),
(7, 3, 1600, 320000.00, 'high', 'approved', 7, NOW(), NOW()),
(7, 4, 350, 350000.00, 'low', 'draft', 7, NOW(), NOW()),
(8, 5, 2200, 660000.00, 'medium', 'submitted', 7, NOW(), NOW());

-- Insert forecasts batch 4
INSERT INTO customer_item_forecasts (customer_id, item_id, yearly_total, yearly_budget_impact, confidence, status, created_by_id, created_at, updated_at) VALUES
(8, 6, 850, 510000.00, 'high', 'approved', 7, NOW(), NOW()),
(9, 7, 700, 595000.00, 'medium', 'submitted', 7, NOW(), NOW()),
(9, 8, 2800, 420000.00, 'high', 'approved', 7, NOW(), NOW()),
(10, 9, 450, 540000.00, 'low', 'draft', 7, NOW(), NOW()),
(10, 10, 1950, 780000.00, 'medium', 'submitted', 7, NOW(), NOW());