-- Insert sample data for Sales Budget (yearly_budgets table)
INSERT INTO yearly_budgets (customer, item, category, brand, year, total_budget, status, created_by_id, created_at, updated_at) VALUES
('ABC Corp', 'Laptop Pro', 'Electronics', 'TechBrand', 2024, 50000, 'draft', 3, datetime('now'), datetime('now')),
('XYZ Ltd', 'Desktop Elite', 'Hardware', 'ProSeries', 2024, 75000, 'submitted', 3, datetime('now'), datetime('now')),
('Tech Solutions', 'Monitor 4K', 'Electronics', 'EliteMax', 2024, 30000, 'approved', 3, datetime('now'), datetime('now')),
('Global Industries', 'Keyboard Wireless', 'Accessories', 'SmartTech', 2024, 15000, 'draft', 3, datetime('now'), datetime('now')),
('Smart Systems', 'Mouse Optical', 'Accessories', 'GlobalPro', 2024, 12000, 'submitted', 3, datetime('now'), datetime('now')),
('Digital Corp', 'Tablet Max', 'Electronics', 'TechBrand', 2024, 45000, 'approved', 3, datetime('now'), datetime('now')),
('Future Tech', 'Phone Smart', 'Electronics', 'ProSeries', 2024, 80000, 'draft', 3, datetime('now'), datetime('now')),
('Innovation Labs', 'Headset Pro', 'Accessories', 'EliteMax', 2024, 25000, 'submitted', 3, datetime('now'), datetime('now')),
('Prime Systems', 'Camera HD', 'Electronics', 'SmartTech', 2024, 60000, 'approved', 3, datetime('now'), datetime('now')),
('Elite Solutions', 'Printer Laser', 'Hardware', 'GlobalPro', 2024, 35000, 'draft', 3, datetime('now'), datetime('now')),
('Mega Corp', 'Scanner Pro', 'Hardware', 'TechBrand', 2025, 40000, 'submitted', 3, datetime('now'), datetime('now')),
('Super Tech', 'Router WiFi', 'Hardware', 'ProSeries', 2025, 20000, 'approved', 3, datetime('now'), datetime('now')),
('Ultra Systems', 'Switch Network', 'Hardware', 'EliteMax', 2025, 55000, 'draft', 3, datetime('now'), datetime('now')),
('Power Solutions', 'UPS Battery', 'Hardware', 'SmartTech', 2025, 30000, 'submitted', 3, datetime('now'), datetime('now')),
('Quick Tech', 'Server Rack', 'Hardware', 'GlobalPro', 2025, 90000, 'approved', 3, datetime('now'), datetime('now')),
('Fast Corp', 'Storage SSD', 'Hardware', 'TechBrand', 2025, 65000, 'draft', 3, datetime('now'), datetime('now')),
('Speed Systems', 'Memory RAM', 'Hardware', 'ProSeries', 2025, 25000, 'submitted', 3, datetime('now'), datetime('now')),
('Rapid Tech', 'Graphics Card', 'Hardware', 'EliteMax', 2025, 85000, 'approved', 3, datetime('now'), datetime('now')),
('Swift Solutions', 'Motherboard', 'Hardware', 'SmartTech', 2025, 45000, 'draft', 3, datetime('now'), datetime('now')),
('Agile Corp', 'Processor CPU', 'Hardware', 'GlobalPro', 2025, 70000, 'submitted', 3, datetime('now'), datetime('now'));

-- Insert customers for forecasts
INSERT INTO customers (name, code, email, region, segment, tier, active, credit_limit, created_at, updated_at, manager_id) VALUES
('Customer Alpha', 'CA001', 'alpha@example.com', 'North', 'Enterprise', 'Gold', 1, 100000, datetime('now'), datetime('now'), 3),
('Customer Beta', 'CB002', 'beta@example.com', 'South', 'SMB', 'Silver', 1, 50000, datetime('now'), datetime('now'), 3),
('Customer Gamma', 'CG003', 'gamma@example.com', 'East', 'Retail', 'Bronze', 1, 25000, datetime('now'), datetime('now'), 3),
('Customer Delta', 'CD004', 'delta@example.com', 'West', 'Enterprise', 'Gold', 1, 150000, datetime('now'), datetime('now'), 3),
('Customer Epsilon', 'CE005', 'epsilon@example.com', 'North', 'SMB', 'Silver', 1, 75000, datetime('now'), datetime('now'), 3),
('Customer Zeta', 'CZ006', 'zeta@example.com', 'South', 'Retail', 'Bronze', 1, 30000, datetime('now'), datetime('now'), 3),
('Customer Eta', 'CH007', 'eta@example.com', 'East', 'Enterprise', 'Gold', 1, 200000, datetime('now'), datetime('now'), 3),
('Customer Theta', 'CT008', 'theta@example.com', 'West', 'SMB', 'Silver', 1, 60000, datetime('now'), datetime('now'), 3),
('Customer Iota', 'CI009', 'iota@example.com', 'North', 'Retail', 'Bronze', 1, 40000, datetime('now'), datetime('now'), 3),
('Customer Kappa', 'CK010', 'kappa@example.com', 'South', 'Enterprise', 'Gold', 1, 180000, datetime('now'), datetime('now'), 3);

-- Insert items for forecasts
INSERT INTO items (name, sku, category, brand, unit_price, description, active, seasonal, created_at, updated_at) VALUES
('Product A', 'PA001', 'Electronics', 'TechBrand', 500, 'High-quality electronic product', 1, 0, datetime('now'), datetime('now')),
('Product B', 'PB002', 'Hardware', 'ProSeries', 750, 'Professional hardware solution', 1, 0, datetime('now'), datetime('now')),
('Product C', 'PC003', 'Accessories', 'EliteMax', 200, 'Premium accessory item', 1, 1, datetime('now'), datetime('now')),
('Product D', 'PD004', 'Software', 'SmartTech', 1000, 'Advanced software package', 1, 0, datetime('now'), datetime('now')),
('Product E', 'PE005', 'Services', 'GlobalPro', 300, 'Professional service offering', 1, 0, datetime('now'), datetime('now')),
('Product F', 'PF006', 'Electronics', 'TechBrand', 600, 'Next-gen electronic device', 1, 1, datetime('now'), datetime('now')),
('Product G', 'PG007', 'Hardware', 'ProSeries', 850, 'Industrial hardware component', 1, 0, datetime('now'), datetime('now')),
('Product H', 'PH008', 'Accessories', 'EliteMax', 150, 'Essential accessory kit', 1, 0, datetime('now'), datetime('now')),
('Product I', 'PI009', 'Software', 'SmartTech', 1200, 'Enterprise software suite', 1, 0, datetime('now'), datetime('now')),
('Product J', 'PJ010', 'Services', 'GlobalPro', 400, 'Consulting service package', 1, 1, datetime('now'), datetime('now'));

-- Insert customer item forecasts (Rolling Forecast)
INSERT INTO customer_item_forecasts (customer_id, item_id, yearly_total, yearly_budget_impact, confidence, status, created_by_id, created_at, updated_at) VALUES
(1, 1, 1000, 500000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(1, 2, 800, 600000, 'medium', 'submitted', 3, datetime('now'), datetime('now')),
(2, 3, 1500, 300000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(2, 4, 500, 500000, 'low', 'draft', 3, datetime('now'), datetime('now')),
(3, 5, 2000, 600000, 'medium', 'submitted', 3, datetime('now'), datetime('now')),
(3, 6, 750, 450000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(4, 7, 600, 510000, 'medium', 'submitted', 3, datetime('now'), datetime('now')),
(4, 8, 2500, 375000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(5, 9, 400, 480000, 'low', 'draft', 3, datetime('now'), datetime('now')),
(5, 10, 1800, 720000, 'medium', 'submitted', 3, datetime('now'), datetime('now')),
(6, 1, 900, 450000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(6, 2, 1200, 900000, 'medium', 'submitted', 3, datetime('now'), datetime('now')),
(7, 3, 1600, 320000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(7, 4, 350, 350000, 'low', 'draft', 3, datetime('now'), datetime('now')),
(8, 5, 2200, 660000, 'medium', 'submitted', 3, datetime('now'), datetime('now')),
(8, 6, 850, 510000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(9, 7, 700, 595000, 'medium', 'submitted', 3, datetime('now'), datetime('now')),
(9, 8, 2800, 420000, 'high', 'approved', 3, datetime('now'), datetime('now')),
(10, 9, 450, 540000, 'low', 'draft', 3, datetime('now'), datetime('now')),
(10, 10, 1950, 780000, 'medium', 'submitted', 3, datetime('now'), datetime('now'));