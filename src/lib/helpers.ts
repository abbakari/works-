// Helper functions to replace utils folder functionality with Supabase integration

import { apiService } from './api';

// Date and time utilities
export const getCurrentYear = () => new Date().getFullYear();

export const formatDateTimeForDisplay = (date: string | Date) => {
  return new Date(date).toLocaleString();
};

export const getTimeAgo = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Less than an hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
};

export const getShortMonthNames = () => [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Currency and percentage formatting
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Color utilities
export const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-600';
  if (confidence >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

// Budget calculations
export const calculateBudgetTotal = (items: any[]) => {
  return items.reduce((total, item) => total + (item.amount || 0), 0);
};

export const generateCustomerAnalytics = (customers: any[]) => {
  // Simple analytics generation
  return {
    totalCustomers: customers.length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.revenue || 0), 0),
    averageRevenue: customers.length > 0 ? customers.reduce((sum, c) => sum + (c.revenue || 0), 0) / customers.length : 0,
  };
};

// Seasonal patterns (simplified)
export const SEASONAL_PATTERNS = {
  electronics: [0.08, 0.08, 0.09, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.09, 0.14, 0.12],
  clothing: [0.06, 0.07, 0.08, 0.09, 0.09, 0.08, 0.07, 0.08, 0.09, 0.09, 0.10, 0.10],
  food: [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.12],
  default: [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08],
};

export const applySeasonalDistribution = (totalAmount: number, category: string = 'default') => {
  const pattern = SEASONAL_PATTERNS[category as keyof typeof SEASONAL_PATTERNS] || SEASONAL_PATTERNS.default;
  return pattern.map(factor => totalAmount * factor);
};

export const convertToMonthlyBudget = (yearlyAmount: number, category: string = 'default') => {
  return applySeasonalDistribution(yearlyAmount, category);
};

// Data persistence with Supabase
export class DataManager {
  static async saveBudgetData(data: any) {
    try {
      const { data: result, error } = await apiService.createBudget(data);
      if (error) throw new Error(error);
      return result;
    } catch (error) {
      console.error('Error saving budget data:', error);
      throw error;
    }
  }

  static async loadBudgetData() {
    try {
      const { data, error } = await apiService.getBudgets();
      if (error) throw new Error(error);
      return data || [];
    } catch (error) {
      console.error('Error loading budget data:', error);
      return [];
    }
  }

  static async saveInventoryData(data: any) {
    try {
      const { data: result, error } = await apiService.createInventoryItem(data);
      if (error) throw new Error(error);
      return result;
    } catch (error) {
      console.error('Error saving inventory data:', error);
      throw error;
    }
  }

  static async loadInventoryData() {
    try {
      const { data, error } = await apiService.getInventoryItems();
      if (error) throw new Error(error);
      return data || [];
    } catch (error) {
      console.error('Error loading inventory data:', error);
      return [];
    }
  }
}

// Simple data connector for backward compatibility
export const dataConnector = {
  async testConnection(config: any) {
    try {
      const { data, error } = await apiService.healthCheck();
      return { success: !error, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getSchema() {
    return {
      tables: ['users', 'budgets', 'inventory_items'],
      columns: {
        users: ['id', 'email', 'full_name', 'role', 'department'],
        budgets: ['id', 'name', 'total_amount', 'start_date', 'end_date', 'user_id'],
        inventory_items: ['id', 'name', 'description', 'quantity', 'unit_price', 'category', 'brand']
      }
    };
  }
};

// Budget data integration
export const budgetDataIntegration = {
  async processData(rawData: any) {
    // Process budget data for analytics
    return {
      insights: [],
      analytics: {
        totalBudget: rawData.reduce((sum: number, item: any) => sum + (item.total_amount || 0), 0),
        itemCount: rawData.length,
      }
    };
  }
};
