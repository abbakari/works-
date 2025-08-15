-- Dynamic STM Budget System Database Schema
-- Designed to handle dynamic years through JSON fields matching Django models
-- Compatible with MariaDB 10.4.32+

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS budget_alerts;
DROP TABLE IF EXISTS budget_history;
DROP TABLE IF EXISTS budget_impacts;
DROP TABLE IF EXISTS forecast_history;
DROP TABLE IF EXISTS customer_analytics;
DROP TABLE IF EXISTS forecast_summaries;
DROP TABLE IF EXISTS monthly_forecasts;
DROP TABLE IF EXISTS customer_item_forecasts;
DROP TABLE IF EXISTS monthly_budgets;
DROP TABLE IF EXISTS yearly_budgets;
DROP TABLE IF EXISTS budget_distributions;
DROP TABLE IF EXISTS budget_templates;
DROP TABLE IF EXISTS forecast_templates;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users_user;

-- Users table (Django's default user model structure)
CREATE TABLE users_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME(6) NULL,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL DEFAULT '',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    -- Custom fields from User model
    name VARCHAR(255) NOT NULL DEFAULT '',
    role ENUM('admin', 'manager', 'salesman', 'supply_chain') NOT NULL DEFAULT 'salesman',
    department VARCHAR(100) NOT NULL DEFAULT '',
    phone VARCHAR(20) NOT NULL DEFAULT '',
    employee_id VARCHAR(50) NOT NULL DEFAULT '',
    manager_id INT NULL,
    permissions JSON NOT NULL DEFAULT '{}',
    preferences JSON NOT NULL DEFAULT '{}',
    last_activity DATETIME(6) NULL,
    
    FOREIGN KEY (manager_id) REFERENCES users_user(id) ON DELETE SET NULL,
    INDEX idx_user_role (role),
    INDEX idx_user_department (department),
    INDEX idx_user_manager (manager_id),
    INDEX idx_user_active (is_active)
);

-- Customers table with dynamic capabilities
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    region VARCHAR(100) NOT NULL,
    segment VARCHAR(100) NOT NULL,
    credit_limit DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    manager_id INT NULL,
    channels JSON NOT NULL DEFAULT '[]',
    seasonality ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
    tier ENUM('platinum', 'gold', 'silver', 'bronze') NOT NULL DEFAULT 'bronze',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    last_activity DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (manager_id) REFERENCES users_user(id) ON DELETE SET NULL,
    INDEX idx_customer_code (code),
    INDEX idx_customer_region_segment (region, segment),
    INDEX idx_customer_manager_active (manager_id, active)
);

-- Items table with seasonal and supply chain info
CREATE TABLE items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    seasonal BOOLEAN NOT NULL DEFAULT FALSE,
    seasonal_months JSON NOT NULL DEFAULT '[]',
    min_order_quantity INT NOT NULL DEFAULT 1,
    lead_time INT NOT NULL DEFAULT 0,
    supplier VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    INDEX idx_item_sku (sku),
    INDEX idx_item_category_brand (category, brand),
    INDEX idx_item_active (active)
);

-- Yearly Budgets with dynamic year support through JSON fields
CREATE TABLE yearly_budgets (
    id VARCHAR(100) PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    item VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    year VARCHAR(4) NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Dynamic year data structures (core feature)
    yearly_budgets JSON NOT NULL DEFAULT '{}' COMMENT 'Budget data for multiple years: {"2025": 1000, "2026": 1200}',
    yearly_actuals JSON NOT NULL DEFAULT '{}' COMMENT 'Actual data for multiple years: {"2025": 850, "2026": 0}',
    yearly_values JSON NOT NULL DEFAULT '{}' COMMENT 'Calculated values for multiple years',
    
    -- Legacy compatibility fields (maintained for backward compatibility)
    budget_2025 DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_2025 DECIMAL(15,2) NOT NULL DEFAULT 0,
    budget_2026 DECIMAL(15,2) NOT NULL DEFAULT 0,
    rate DECIMAL(8,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    git INT NOT NULL DEFAULT 0 COMMENT 'Goods In Transit',
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- User tracking
    created_by_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    -- Status tracking
    status ENUM('draft', 'saved', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_yearly_budget_customer_year (customer, year),
    INDEX idx_yearly_budget_created_by_status (created_by_id, status),
    INDEX idx_yearly_budget_year_category (year, category)
);

-- Monthly Budgets linked to yearly budgets
CREATE TABLE monthly_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    yearly_budget_id VARCHAR(100) NOT NULL,
    month VARCHAR(3) NOT NULL,
    month_number INT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
    
    -- Core budget fields
    budget_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    rate DECIMAL(8,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    git INT NOT NULL DEFAULT 0 COMMENT 'Goods In Transit',
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Calculated fields
    net_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    variance DECIMAL(12,2) NOT NULL DEFAULT 0,
    variance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (yearly_budget_id) REFERENCES yearly_budgets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_yearly_budget_month (yearly_budget_id, month),
    INDEX idx_monthly_budget_yearly_month (yearly_budget_id, month_number)
);

-- Customer Item Forecasts with dynamic year support
CREATE TABLE customer_item_forecasts (
    id VARCHAR(100) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    yearly_total INT NOT NULL DEFAULT 0 COMMENT 'Total forecast units for the year',
    yearly_budget_impact DECIMAL(15,2) NOT NULL DEFAULT 0,
    status ENUM('draft', 'submitted', 'approved', 'revised') NOT NULL DEFAULT 'draft',
    confidence ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    notes TEXT,
    created_by_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_item_user (customer_id, item_id, created_by_id),
    INDEX idx_forecast_customer_status (customer_id, status),
    INDEX idx_forecast_created_by_status (created_by_id, status),
    INDEX idx_forecast_item_confidence (item_id, confidence)
);

-- Monthly Forecasts with dynamic year support
CREATE TABLE monthly_forecasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_item_forecast_id VARCHAR(100) NOT NULL,
    month VARCHAR(3) NOT NULL,
    year INT NOT NULL,
    month_index INT NOT NULL CHECK (month_index BETWEEN 0 AND 11),
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (customer_item_forecast_id) REFERENCES customer_item_forecasts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_forecast_month_year (customer_item_forecast_id, month, year),
    INDEX idx_monthly_forecast_year_month (year, month_index)
);

-- Forecast Summaries with dynamic monthly values
CREATE TABLE forecast_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    total_items INT NOT NULL DEFAULT 0,
    total_yearly_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_monthly_values JSON NOT NULL DEFAULT '{}' COMMENT 'Monthly values: {"Jan": 1000, "Feb": 1200}',
    status ENUM('draft', 'submitted', 'approved', 'revised') NOT NULL DEFAULT 'draft',
    last_updated DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_year (customer_id, year),
    INDEX idx_forecast_summary_year_customer (year, customer_id)
);

-- Budget Impacts with dynamic calculations
CREATE TABLE budget_impacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    forecast_summary_id INT NOT NULL,
    month VARCHAR(3) NOT NULL,
    year INT NOT NULL,
    original_budget DECIMAL(12,2) NOT NULL,
    forecast_impact DECIMAL(12,2) NOT NULL,
    new_projected_budget DECIMAL(12,2) NOT NULL,
    variance DECIMAL(12,2) NOT NULL,
    variance_percentage DECIMAL(5,2) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (forecast_summary_id) REFERENCES forecast_summaries(id) ON DELETE CASCADE,
    UNIQUE KEY unique_forecast_month_year_impact (forecast_summary_id, month, year),
    INDEX idx_budget_impact_year_month (year, month)
);

-- Customer Analytics with dynamic breakdowns
CREATE TABLE customer_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    total_forecast DECIMAL(15,2) NOT NULL DEFAULT 0,
    monthly_breakdown JSON NOT NULL DEFAULT '{}' COMMENT 'Monthly breakdown: {"Jan": 1000, "Feb": 1200}',
    category_breakdown JSON NOT NULL DEFAULT '{}' COMMENT 'Category breakdown: {"Electronics": 5000, "Clothing": 3000}',
    channel_breakdown JSON NOT NULL DEFAULT '{}' COMMENT 'Channel breakdown: {"Online": 4000, "Retail": 4000}',
    growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    seasonal_trends JSON NOT NULL DEFAULT '[]',
    risk_score DECIMAL(3,1) NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 10),
    confidence_score DECIMAL(3,1) NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 10),
    calculated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_analytics (customer_id)
);

-- Budget Distributions for seasonal patterns
CREATE TABLE budget_distributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('seasonal', 'custom', 'historical', 'linear') NOT NULL,
    description TEXT,
    january DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    february DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    march DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    april DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    may DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    june DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    july DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    august DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    september DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    october DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    november DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    december DECIMAL(5,2) NOT NULL DEFAULT 8.33,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_budget_distribution_name (name)
);

-- Budget Templates with dynamic configurations
CREATE TABLE budget_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    monthly_distribution JSON NOT NULL DEFAULT '{}' COMMENT 'Monthly distribution percentages',
    default_rates JSON NOT NULL DEFAULT '{}' COMMENT 'Default rates by month',
    seasonal_adjustments JSON NOT NULL DEFAULT '{}' COMMENT 'Seasonal adjustment factors',
    created_by_id INT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_budget_template_name (name)
);

-- Forecast Templates with dynamic patterns
CREATE TABLE forecast_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    seasonality_pattern VARCHAR(50) NOT NULL DEFAULT 'Default Seasonal',
    default_confidence ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    monthly_distribution JSON NOT NULL DEFAULT '{}' COMMENT 'Monthly distribution percentages',
    created_by_id INT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_forecast_template_name (name)
);

-- Budget History for audit trail
CREATE TABLE budget_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    yearly_budget_id VARCHAR(100) NOT NULL,
    action ENUM('created', 'updated', 'submitted', 'approved', 'rejected', 'deleted') NOT NULL,
    previous_data JSON NOT NULL DEFAULT '{}',
    new_data JSON NOT NULL DEFAULT '{}',
    changed_by_id INT NOT NULL,
    changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    comment TEXT,
    
    FOREIGN KEY (yearly_budget_id) REFERENCES yearly_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_budget_history_yearly_budget_changed_at (yearly_budget_id, changed_at)
);

-- Forecast History for audit trail
CREATE TABLE forecast_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_item_forecast_id VARCHAR(100) NOT NULL,
    action ENUM('created', 'updated', 'submitted', 'approved', 'revised', 'deleted') NOT NULL,
    previous_data JSON NOT NULL DEFAULT '{}',
    new_data JSON NOT NULL DEFAULT '{}',
    changed_by_id INT NOT NULL,
    changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    comment TEXT,
    
    FOREIGN KEY (customer_item_forecast_id) REFERENCES customer_item_forecasts(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_forecast_history_forecast_changed_at (customer_item_forecast_id, changed_at)
);

-- Budget Alerts
CREATE TABLE budget_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    yearly_budget_id VARCHAR(100) NOT NULL,
    alert_type ENUM('variance', 'approval', 'deadline', 'budget_exceeded') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at DATETIME(6) NULL,
    resolved_by_id INT NULL,
    recipient_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (yearly_budget_id) REFERENCES yearly_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by_id) REFERENCES users_user(id) ON DELETE SET NULL,
    FOREIGN KEY (recipient_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_budget_alert_recipient_is_read (recipient_id, is_read),
    INDEX idx_budget_alert_type_severity (alert_type, severity)
);

-- Insert sample users with dynamic year capabilities
INSERT INTO users_user (username, password, email, name, role, department, phone, employee_id, is_staff, is_superuser, permissions, preferences) VALUES
('admin', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'admin@stmbudget.com', 'System Administrator', 'admin', 'IT', '+1-555-0001', 'EMP001', TRUE, TRUE, '{"all": true}', '{"theme": "light", "defaultYear": "2025"}'),
('john_manager', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'john@stmbudget.com', 'John Smith', 'manager', 'Sales', '+1-555-0002', 'EMP002', TRUE, FALSE, '{"budgets": ["view", "edit", "approve"], "forecasts": ["view", "edit", "approve"]}', '{"defaultYear": "2025", "autoSave": true}'),
('sarah_sales', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'sarah@stmbudget.com', 'Sarah Johnson', 'salesman', 'Sales', '+1-555-0003', 'EMP003', FALSE, FALSE, '{"budgets": ["view", "edit"], "forecasts": ["view", "edit"]}', '{"defaultYear": "2025", "showTutorials": true}'),
('mike_supply', 'pbkdf2_sha256$600000$randomsalt$hashedpassword', 'mike@stmbudget.com', 'Mike Wilson', 'supply_chain', 'Supply Chain', '+1-555-0004', 'EMP004', FALSE, FALSE, '{"inventory": ["view", "edit"], "forecasts": ["view"]}', '{"defaultYear": "2025", "notifications": true}');

-- Insert sample customers
INSERT INTO customers (id, name, code, email, phone, region, segment, credit_limit, manager_id, channels, seasonality, tier) VALUES
('CUST001', 'TechCorp Solutions', 'TC001', 'contact@techcorp.com', '+1-555-1001', 'North America', 'Enterprise', 500000.00, 2, '["Online", "Direct Sales"]', 'medium', 'gold'),
('CUST002', 'Global Retail Chain', 'GRC002', 'procurement@globalretail.com', '+1-555-1002', 'Europe', 'Retail', 750000.00, 2, '["Retail", "Wholesale"]', 'high', 'platinum'),
('CUST003', 'StartupTech Inc', 'ST003', 'orders@startuptech.com', '+1-555-1003', 'Asia Pacific', 'SMB', 100000.00, 3, '["Online"]', 'low', 'silver');

-- Insert sample items
INSERT INTO items (id, sku, name, category, brand, unit_price, cost_price, seasonal, seasonal_months) VALUES
('ITEM001', 'LAPTOP-001', 'Business Laptop Pro', 'Electronics', 'TechBrand', 1200.00, 800.00, FALSE, '[]'),
('ITEM002', 'PHONE-002', 'Smartphone X1', 'Electronics', 'MobileBrand', 800.00, 500.00, FALSE, '[]'),
('ITEM003', 'TABLET-003', 'Tablet Ultra', 'Electronics', 'TechBrand', 600.00, 400.00, TRUE, '["Nov", "Dec", "Jan"]');

-- Insert sample yearly budgets with full year range (2021-2030)
INSERT INTO yearly_budgets (id, customer, item, category, brand, year, total_budget, yearly_budgets, yearly_actuals, yearly_values, created_by_id, status) VALUES
('YB001', 'TechCorp Solutions', 'Business Laptop Pro', 'Electronics', 'TechBrand', '2025', 120000.00, 
 '{"2021": 80000, "2022": 90000, "2023": 100000, "2024": 110000, "2025": 120000, "2026": 140000, "2027": 160000, "2028": 180000, "2029": 200000, "2030": 220000}', 
 '{"2021": 75000, "2022": 85000, "2023": 95000, "2024": 105000, "2025": 95000, "2026": 0, "2027": 0, "2028": 0, "2029": 0, "2030": 0}', 
 '{"2021": 80000, "2022": 90000, "2023": 100000, "2024": 110000, "2025": 120000, "2026": 140000, "2027": 160000, "2028": 180000, "2029": 200000, "2030": 220000}', 
 2, 'approved'),
('YB002', 'Global Retail Chain', 'Smartphone X1', 'Electronics', 'MobileBrand', '2025', 200000.00, 
 '{"2021": 120000, "2022": 140000, "2023": 160000, "2024": 180000, "2025": 200000, "2026": 230000, "2027": 260000, "2028": 290000, "2029": 320000, "2030": 350000}', 
 '{"2021": 115000, "2022": 135000, "2023": 155000, "2024": 175000, "2025": 180000, "2026": 0, "2027": 0, "2028": 0, "2029": 0, "2030": 0}', 
 '{"2021": 120000, "2022": 140000, "2023": 160000, "2024": 180000, "2025": 200000, "2026": 230000, "2027": 260000, "2028": 290000, "2029": 320000, "2030": 350000}', 
 2, 'approved'),
('YB003', 'StartupTech Inc', 'Tablet Ultra', 'Electronics', 'TechBrand', '2025', 60000.00, 
 '{"2021": 30000, "2022": 35000, "2023": 45000, "2024": 55000, "2025": 60000, "2026": 75000, "2027": 90000, "2028": 105000, "2029": 120000, "2030": 135000}', 
 '{"2021": 28000, "2022": 33000, "2023": 42000, "2024": 52000, "2025": 45000, "2026": 0, "2027": 0, "2028": 0, "2029": 0, "2030": 0}', 
 '{"2021": 30000, "2022": 35000, "2023": 45000, "2024": 55000, "2025": 60000, "2026": 75000, "2027": 90000, "2028": 105000, "2029": 120000, "2030": 135000}', 
 3, 'submitted');

-- Insert sample monthly budgets for dynamic distribution
INSERT INTO monthly_budgets (yearly_budget_id, month, month_number, budget_value, actual_value, rate, stock, git, discount) VALUES
('YB001', 'Jan', 1, 10000.00, 8500.00, 1200.00, 50, 10, 500.00),
('YB001', 'Feb', 2, 10000.00, 9200.00, 1200.00, 45, 8, 400.00),
('YB001', 'Mar', 3, 10000.00, 7800.00, 1200.00, 52, 12, 600.00),
('YB002', 'Jan', 1, 16667.00, 15000.00, 800.00, 100, 20, 800.00),
('YB002', 'Feb', 2, 16667.00, 16500.00, 800.00, 95, 15, 700.00),
('YB002', 'Mar', 3, 16666.00, 14200.00, 800.00, 110, 25, 900.00);

-- Insert sample customer item forecasts
INSERT INTO customer_item_forecasts (id, customer_id, item_id, yearly_total, yearly_budget_impact, status, confidence, created_by_id) VALUES
('CIF001', 'CUST001', 'ITEM001', 100, 120000.00, 'approved', 'high', 2),
('CIF002', 'CUST002', 'ITEM002', 250, 200000.00, 'approved', 'medium', 2),
('CIF003', 'CUST003', 'ITEM003', 100, 60000.00, 'submitted', 'medium', 3);

-- Insert sample monthly forecasts with dynamic year support
INSERT INTO monthly_forecasts (customer_item_forecast_id, month, year, month_index, quantity, unit_price, total_value) VALUES
('CIF001', 'Jan', 2025, 0, 8, 1200.00, 9600.00),
('CIF001', 'Feb', 2025, 1, 9, 1200.00, 10800.00),
('CIF001', 'Mar', 2025, 2, 7, 1200.00, 8400.00),
('CIF002', 'Jan', 2025, 0, 20, 800.00, 16000.00),
('CIF002', 'Feb', 2025, 1, 22, 800.00, 17600.00),
('CIF002', 'Mar', 2025, 2, 18, 800.00, 14400.00);

-- Insert sample forecast summaries with dynamic monthly values
INSERT INTO forecast_summaries (customer_id, year, total_items, total_yearly_value, total_monthly_values, status) VALUES
('CUST001', 2025, 1, 120000.00, '{"Jan": 9600, "Feb": 10800, "Mar": 8400, "Apr": 10000, "May": 10000, "Jun": 10000, "Jul": 10000, "Aug": 10000, "Sep": 10000, "Oct": 10000, "Nov": 10000, "Dec": 10000}', 'approved'),
('CUST002', 2025, 1, 200000.00, '{"Jan": 16000, "Feb": 17600, "Mar": 14400, "Apr": 16667, "May": 16667, "Jun": 16667, "Jul": 16667, "Aug": 16667, "Sep": 16667, "Oct": 16667, "Nov": 16667, "Dec": 16666}', 'approved'),
('CUST003', 2025, 1, 60000.00, '{"Jan": 3600, "Feb": 4200, "Mar": 3000, "Apr": 5000, "May": 5000, "Jun": 5000, "Jul": 5000, "Aug": 5000, "Sep": 5000, "Oct": 5000, "Nov": 5000, "Dec": 5000}', 'submitted');

-- Insert default budget distribution
INSERT INTO budget_distributions (name, type, description, created_by_id, is_default, is_active) VALUES
('Linear Distribution', 'linear', 'Equal distribution across all months', 1, TRUE, TRUE),
('Seasonal Q4 Heavy', 'seasonal', 'Higher allocation in Q4 for holiday season', 1, FALSE, TRUE),
('Summer Peak', 'seasonal', 'Higher allocation in summer months', 1, FALSE, TRUE);

-- Update seasonal distribution with custom values
UPDATE budget_distributions SET 
    october = 12.00, november = 15.00, december = 18.00,
    january = 6.00, february = 6.00, march = 6.00,
    april = 7.00, may = 7.00, june = 7.00,
    july = 8.00, august = 8.00, september = 8.00
WHERE name = 'Seasonal Q4 Heavy';

-- Insert sample customer analytics with dynamic breakdowns
INSERT INTO customer_analytics (customer_id, total_forecast, monthly_breakdown, category_breakdown, channel_breakdown, growth_rate, seasonal_trends, risk_score, confidence_score) VALUES
('CUST001', 120000.00, 
 '{"Jan": 9600, "Feb": 10800, "Mar": 8400, "Apr": 10000, "May": 10000, "Jun": 10000, "Jul": 10000, "Aug": 10000, "Sep": 10000, "Oct": 10000, "Nov": 10000, "Dec": 10000}',
 '{"Electronics": 120000}',
 '{"Online": 60000, "Direct Sales": 60000}',
 12.5, '[{"month": "Dec", "trend": "high"}, {"month": "Jan", "trend": "low"}]', 3.5, 8.5),
('CUST002', 200000.00,
 '{"Jan": 16000, "Feb": 17600, "Mar": 14400, "Apr": 16667, "May": 16667, "Jun": 16667, "Jul": 16667, "Aug": 16667, "Sep": 16667, "Oct": 16667, "Nov": 16667, "Dec": 16666}',
 '{"Electronics": 200000}',
 '{"Retail": 120000, "Wholesale": 80000}',
 15.0, '[{"month": "Nov", "trend": "high"}, {"month": "Dec", "trend": "high"}]', 2.0, 9.0);

-- Create views for easy dynamic year queries
CREATE VIEW current_year_budgets AS
SELECT 
    yb.*,
    JSON_EXTRACT(yb.yearly_budgets, CONCAT('$.', YEAR(CURDATE()))) as current_year_budget,
    JSON_EXTRACT(yb.yearly_actuals, CONCAT('$.', YEAR(CURDATE()))) as current_year_actual,
    JSON_EXTRACT(yb.yearly_values, CONCAT('$.', YEAR(CURDATE()))) as current_year_value
FROM yearly_budgets yb
WHERE yb.is_active = TRUE;

CREATE VIEW next_year_budgets AS
SELECT 
    yb.*,
    JSON_EXTRACT(yb.yearly_budgets, CONCAT('$.', YEAR(CURDATE()) + 1)) as next_year_budget,
    JSON_EXTRACT(yb.yearly_values, CONCAT('$.', YEAR(CURDATE()) + 1)) as next_year_value
FROM yearly_budgets yb
WHERE yb.is_active = TRUE;

-- Create stored procedure for dynamic year data retrieval (2021-2030)
DELIMITER //
CREATE PROCEDURE GetBudgetByYear(IN target_year VARCHAR(4))
BEGIN
    -- Validate year range (2021-2030)
    IF target_year < '2021' OR target_year > '2030' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Year must be between 2021 and 2030';
    END IF;
    
    SELECT 
        yb.*,
        JSON_EXTRACT(yb.yearly_budgets, CONCAT('$.', target_year)) as year_budget,
        JSON_EXTRACT(yb.yearly_actuals, CONCAT('$.', target_year)) as year_actual,
        JSON_EXTRACT(yb.yearly_values, CONCAT('$.', target_year)) as year_value,
        u.name as created_by_name
    FROM yearly_budgets yb
    JOIN users_user u ON yb.created_by_id = u.id
    WHERE yb.is_active = TRUE
    AND JSON_EXTRACT(yb.yearly_budgets, CONCAT('$.', target_year)) IS NOT NULL;
END //
DELIMITER ;

-- Create procedure to get all available years for a budget
DELIMITER //
CREATE PROCEDURE GetAvailableYears(IN budget_id VARCHAR(100))
BEGIN
    SELECT 
        JSON_KEYS(yearly_budgets) as available_years
    FROM yearly_budgets 
    WHERE id = budget_id AND is_active = TRUE;
END //
DELIMITER ;

-- Create stored procedure for adding new year data
DELIMITER //
CREATE PROCEDURE AddYearToBudget(
    IN budget_id VARCHAR(100),
    IN target_year VARCHAR(4),
    IN budget_amount DECIMAL(15,2),
    IN actual_amount DECIMAL(15,2)
)
BEGIN
    UPDATE yearly_budgets 
    SET 
        yearly_budgets = JSON_SET(yearly_budgets, CONCAT('$.', target_year), budget_amount),
        yearly_actuals = JSON_SET(yearly_actuals, CONCAT('$.', target_year), actual_amount),
        yearly_values = JSON_SET(yearly_values, CONCAT('$.', target_year), budget_amount),
        updated_at = CURRENT_TIMESTAMP(6)
    WHERE id = budget_id;
END //
DELIMITER ;

-- Verification queries
SELECT 'Database schema created successfully with dynamic year support!' as status;
SELECT COUNT(*) as total_users FROM users_user;
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as total_items FROM items;
SELECT COUNT(*) as total_yearly_budgets FROM yearly_budgets;
SELECT COUNT(*) as total_monthly_budgets FROM monthly_budgets;
SELECT COUNT(*) as total_forecasts FROM customer_item_forecasts;

-- Show sample dynamic year data
SELECT 
    id, 
    customer, 
    item, 
    yearly_budgets,
    yearly_actuals,
    yearly_values
FROM yearly_budgets 
LIMIT 3;