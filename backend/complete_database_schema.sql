-- Complete Database Schema for STM Budget System
-- Drop existing tables if they exist
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS budget_alerts;
DROP TABLE IF EXISTS budget_distributions;
DROP TABLE IF EXISTS budget_history;
DROP TABLE IF EXISTS budget_templates;
DROP TABLE IF EXISTS monthly_budgets;
DROP TABLE IF EXISTS yearly_budgets;
DROP TABLE IF EXISTS forecast_history;
DROP TABLE IF EXISTS forecast_templates;
DROP TABLE IF EXISTS customer_analytics;
DROP TABLE IF EXISTS budget_impacts;
DROP TABLE IF EXISTS forecast_summaries;
DROP TABLE IF EXISTS monthly_forecasts;
DROP TABLE IF EXISTS customer_item_forecasts;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME(6) NULL,
    is_superuser TINYINT(1) NOT NULL DEFAULT 0,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    is_staff TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    date_joined DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'salesman',
    department VARCHAR(100) NOT NULL DEFAULT 'Unknown',
    last_login_time DATETIME(6) NULL,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    manager_id INT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    profile_picture VARCHAR(100) NOT NULL DEFAULT '',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- User Sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_key VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(39) NOT NULL,
    user_agent TEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    last_activity DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user (user_id),
    INDEX idx_user_sessions_active (is_active)
);

-- User Preferences table
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    default_dashboard VARCHAR(50) NOT NULL DEFAULT 'Dashboard',
    items_per_page INT NOT NULL DEFAULT 50,
    date_format VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    currency_format VARCHAR(10) NOT NULL DEFAULT 'USD',
    email_notifications TINYINT(1) NOT NULL DEFAULT 1,
    browser_notifications TINYINT(1) NOT NULL DEFAULT 1,
    workflow_notifications TINYINT(1) NOT NULL DEFAULT 1,
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    sidebar_collapsed TINYINT(1) NOT NULL DEFAULT 0,
    auto_save_interval INT NOT NULL DEFAULT 30,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Yearly Budgets table
CREATE TABLE yearly_budgets (
    id VARCHAR(100) PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    item VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    year VARCHAR(4) NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    yearly_budgets JSON NOT NULL,
    yearly_actuals JSON NOT NULL,
    yearly_values JSON NOT NULL,
    budget_2025 DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    actual_2025 DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    budget_2026 DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    rate DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    git INT NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_by_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    version INT NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_yearly_budgets_customer_year (customer, year),
    INDEX idx_yearly_budgets_created_by_status (created_by_id, status),
    INDEX idx_yearly_budgets_year_category (year, category)
);

-- Monthly Budgets table
CREATE TABLE monthly_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    yearly_budget_id VARCHAR(100) NOT NULL,
    month VARCHAR(3) NOT NULL,
    month_number INT NOT NULL,
    budget_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    actual_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    rate DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    git INT NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    net_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    variance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    variance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (yearly_budget_id) REFERENCES yearly_budgets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_yearly_budget_month (yearly_budget_id, month),
    INDEX idx_monthly_budgets_yearly_budget_month (yearly_budget_id, month_number),
    CHECK (month_number >= 1 AND month_number <= 12)
);

-- Budget Templates table
CREATE TABLE budget_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    monthly_distribution JSON NOT NULL,
    default_rates JSON NOT NULL,
    seasonal_adjustments JSON NOT NULL,
    created_by_id INT NOT NULL,
    is_public TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_budget_templates_name (name)
);

-- Budget History table
CREATE TABLE budget_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    yearly_budget_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    previous_data JSON NOT NULL,
    new_data JSON NOT NULL,
    changed_by_id INT NOT NULL,
    changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    comment TEXT NOT NULL,
    FOREIGN KEY (yearly_budget_id) REFERENCES yearly_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_budget_history_yearly_budget_changed_at (yearly_budget_id, changed_at)
);

-- Budget Distributions table
CREATE TABLE budget_distributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
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
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_by_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_budget_distributions_name (name)
);

-- Budget Alerts table
CREATE TABLE budget_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    yearly_budget_id VARCHAR(100) NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(10) NOT NULL DEFAULT 'medium',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    resolved_at DATETIME(6) NULL,
    resolved_by_id INT NULL,
    recipient_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (yearly_budget_id) REFERENCES yearly_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_budget_alerts_recipient_is_read (recipient_id, is_read),
    INDEX idx_budget_alerts_alert_type_severity (alert_type, severity)
);

-- Customers table
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
    active TINYINT(1) NOT NULL DEFAULT 1,
    manager_id INT NULL,
    channels JSON NOT NULL,
    seasonality VARCHAR(10) NOT NULL DEFAULT 'medium',
    tier VARCHAR(10) NOT NULL DEFAULT 'bronze',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    last_activity DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_customers_code (code),
    INDEX idx_customers_region_segment (region, segment),
    INDEX idx_customers_manager_active (manager_id, active)
);

-- Items table
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
    active TINYINT(1) NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    seasonal TINYINT(1) NOT NULL DEFAULT 0,
    seasonal_months JSON NOT NULL,
    min_order_quantity INT NOT NULL DEFAULT 1,
    lead_time INT NOT NULL DEFAULT 0,
    supplier VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_items_sku (sku),
    INDEX idx_items_category_brand (category, brand),
    INDEX idx_items_active (active)
);

-- Customer Item Forecasts table
CREATE TABLE customer_item_forecasts (
    id VARCHAR(100) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    yearly_total INT NOT NULL DEFAULT 0,
    yearly_budget_impact DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(10) NOT NULL DEFAULT 'draft',
    confidence VARCHAR(10) NOT NULL DEFAULT 'medium',
    notes TEXT NOT NULL,
    created_by_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_item_created_by (customer_id, item_id, created_by_id),
    INDEX idx_customer_item_forecasts_customer_status (customer_id, status),
    INDEX idx_customer_item_forecasts_created_by_status (created_by_id, status),
    INDEX idx_customer_item_forecasts_item_confidence (item_id, confidence)
);

-- Monthly Forecasts table
CREATE TABLE monthly_forecasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_item_forecast_id VARCHAR(100) NOT NULL,
    month VARCHAR(3) NOT NULL,
    year INT NOT NULL,
    month_index INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    notes TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (customer_item_forecast_id) REFERENCES customer_item_forecasts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_forecast_month_year (customer_item_forecast_id, month, year),
    INDEX idx_monthly_forecasts_year_month_index (year, month_index),
    CHECK (month_index >= 0 AND month_index <= 11)
);

-- Forecast Summaries table
CREATE TABLE forecast_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    total_items INT NOT NULL DEFAULT 0,
    total_yearly_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_monthly_values JSON NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'draft',
    last_updated DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_year (customer_id, year),
    INDEX idx_forecast_summaries_year_customer (year, customer_id)
);

-- Budget Impacts table
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
    UNIQUE KEY unique_forecast_summary_month_year (forecast_summary_id, month, year),
    INDEX idx_budget_impacts_year_month (year, month)
);

-- Customer Analytics table
CREATE TABLE customer_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL UNIQUE,
    total_forecast DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    monthly_breakdown JSON NOT NULL,
    category_breakdown JSON NOT NULL,
    channel_breakdown JSON NOT NULL,
    growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    seasonal_trends JSON NOT NULL,
    risk_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    confidence_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    calculated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CHECK (risk_score >= 0 AND risk_score <= 10),
    CHECK (confidence_score >= 0 AND confidence_score <= 10)
);

-- Forecast Templates table
CREATE TABLE forecast_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    seasonality_pattern VARCHAR(50) NOT NULL DEFAULT 'Default Seasonal',
    default_confidence VARCHAR(10) NOT NULL DEFAULT 'medium',
    monthly_distribution JSON NOT NULL,
    created_by_id INT NOT NULL,
    is_public TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_forecast_templates_name (name)
);

-- Forecast History table
CREATE TABLE forecast_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_item_forecast_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    previous_data JSON NOT NULL,
    new_data JSON NOT NULL,
    changed_by_id INT NOT NULL,
    changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    comment TEXT NOT NULL,
    FOREIGN KEY (customer_item_forecast_id) REFERENCES customer_item_forecasts(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_forecast_history_customer_item_forecast_changed_at (customer_item_forecast_id, changed_at)
);

-- Insert default admin user
INSERT INTO users (username, email, name, password, is_superuser, is_staff, role, department) VALUES
('admin@stm.com', 'admin@stm.com', 'System Administrator', 'pbkdf2_sha256$600000$salt$hash', 1, 1, 'admin', 'IT');

-- Insert sample users
INSERT INTO users (username, email, name, password, is_superuser, is_staff, role, department) VALUES
('amali@gmail.com', 'amali@gmail.com', 'Amali', 'pbkdf2_sha256$600000$salt1$hash1', 1, 1, 'admin', 'IT'),
('billy@gmail.com', 'billy@gmail.com', 'Billy', 'pbkdf2_sha256$600000$salt2$hash2', 0, 0, 'salesman', 'Sales'),
('said@gmail.com', 'said@gmail.com', 'Said', 'pbkdf2_sha256$600000$salt3$hash3', 0, 0, 'manager', 'Management'),
('kido@gmail.com', 'kido@gmail.com', 'Kido', 'pbkdf2_sha256$600000$salt4$hash4', 0, 0, 'supply_chain', 'Supply Chain');

-- Create default budget distribution
INSERT INTO budget_distributions (name, type, description, created_by_id, is_default, is_active) VALUES
('Default Seasonal', 'seasonal', 'Holiday-aware seasonal distribution with reduced allocation for Nov-Dec', 1, 1, 1);

-- Success message
SELECT 'Database schema created successfully!' as message;