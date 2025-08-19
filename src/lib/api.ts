// Supabase API Service for STM Budget Frontend

import { supabase } from './supabase';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  // Authentication
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { error: error.message };
      }

      return { data: user };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get user' };
    }
  }

  async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get profile' };
    }
  }

  // Budget API
  async getBudgets(params?: Record<string, any>) {
    try {
      let query = supabase.from('budgets').select('*');

      // Apply filters if params exist
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get budgets' };
    }
  }

  async createBudget(budgetData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budgetData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create budget' };
    }
  }

  async updateBudget(id: string, budgetData: any) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update budget' };
    }
  }

  async getBudgetById(id: string) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get budget' };
    }
  }

  async deleteBudget(id: string) {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete budget' };
    }
  }

  // Inventory API
  async getInventoryItems(params?: Record<string, any>) {
    try {
      let query = supabase.from('inventory_items').select('*');

      // Apply filters if params exist
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get inventory items' };
    }
  }

  async createInventoryItem(itemData: any) {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create inventory item' };
    }
  }

  async updateInventoryItem(id: string, itemData: any) {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(itemData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update inventory item' };
    }
  }

  async deleteInventoryItem(id: string) {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete inventory item' };
    }
  }

  // Users API
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to get users' };
    }
  }

  async createUser(userData: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create user' };
    }
  }

  async updateUser(id: string, userData: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update user' };
    }
  }

  async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete user' };
    }
  }

  // Generic health check - returns Supabase connection status
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (error) {
        return { error: error.message };
      }

      return { data: { status: 'healthy', connection: 'supabase' } };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Health check failed' };
    }
  }

  // Legacy method signatures for compatibility (will throw errors suggesting migration)
  async getForecasts() { throw new Error('Forecasts not implemented in Supabase yet'); }
  async createForecast() { throw new Error('Forecasts not implemented in Supabase yet'); }
  async updateForecast() { throw new Error('Forecasts not implemented in Supabase yet'); }
  async getForecastById() { throw new Error('Forecasts not implemented in Supabase yet'); }
  async getWorkflowItems() { throw new Error('Workflow not implemented in Supabase yet'); }
  async getWorkflowItemById() { throw new Error('Workflow not implemented in Supabase yet'); }
  async createWorkflowItem() { throw new Error('Workflow not implemented in Supabase yet'); }
  async updateWorkflowItem() { throw new Error('Workflow not implemented in Supabase yet'); }
  async getWorkflowNotifications() { throw new Error('Workflow not implemented in Supabase yet'); }
  async getWorkflowNotificationById() { throw new Error('Workflow not implemented in Supabase yet'); }
  async createWorkflowNotification() { throw new Error('Workflow not implemented in Supabase yet'); }
  async updateWorkflowNotification() { throw new Error('Workflow not implemented in Supabase yet'); }
  async getWorkflowComments() { throw new Error('Workflow not implemented in Supabase yet'); }
  async getWorkflowCommentById() { throw new Error('Workflow not implemented in Supabase yet'); }
  async createWorkflowComment() { throw new Error('Workflow not implemented in Supabase yet'); }
  async updateWorkflowComment() { throw new Error('Workflow not implemented in Supabase yet'); }
  async getMessages() { throw new Error('Messages not implemented in Supabase yet'); }
  async sendMessage() { throw new Error('Messages not implemented in Supabase yet'); }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiResponse };
export default ApiService;
