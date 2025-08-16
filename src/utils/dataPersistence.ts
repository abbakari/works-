// Data persistence utility using API only - no localStorage
// This ensures all data is saved to and retrieved from the backend
import { apiService } from '../lib/api';

export interface SavedForecastData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  type: 'sales_budget' | 'rolling_forecast';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  budgetData?: {
    bud25: number;
    ytd25: number;
    budget2026: number;
    rate: number;
    stock: number;
    git: number;
    eta?: string;
    budgetValue2026: number;
    discount: number;
    monthlyData: Array<{
      month: string;
      budgetValue: number;
      actualValue: number;
      rate: number;
      stock: number;
      git: number;
      discount: number;
    }>;
  };
  forecastData?: {
    [month: string]: number; // Monthly forecast units
  };
  forecastTotal: number;
  status: 'draft' | 'saved' | 'submitted' | 'approved';
  // Metadata for tracking submissions and preserving originals
  submissionMetadata?: {
    originalId: string;
    workflowId: string;
    submittedAt: string;
    originalStatus: 'draft' | 'saved' | 'submitted' | 'approved';
  };
}

export interface SavedBudgetData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  type: 'sales_budget';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  budget2025: number;
  actual2025: number;
  budget2026: number;
  rate: number;
  stock: number;
  git: number;
  budgetValue2026: number;
  discount: number;
  monthlyData: Array<{
    month: string;
    budgetValue: number;
    actualValue: number;
    rate: number;
    stock: number;
    git: number;
    discount: number;
  }>;
  status: 'draft' | 'saved' | 'submitted' | 'approved';
  // Metadata for tracking submissions and preserving originals
  submissionMetadata?: {
    originalId: string;
    workflowId: string;
    submittedAt: string;
    originalStatus: 'draft' | 'saved' | 'submitted' | 'approved';
  };
}

export class DataPersistenceManager {
  // Save sales budget data via API
  static async saveSalesBudgetData(data: SavedBudgetData[]): Promise<void> {
    try {
      console.log('Saving sales budget data via API:', data.length, 'items');
      
      // For each item, either create or update via API
      for (const item of data) {
        if (item.id && !item.id.includes('temp_')) {
          // Update existing item
          console.log('Updating budget item:', item.id);
          await apiService.updateBudget(parseInt(item.id), item);
        } else {
          // Create new item
          console.log('Creating new budget item:', item.customer, item.item);
          const response = await apiService.createBudget(item);
          console.log('Created budget item with response:', response);
        }
      }
      console.log('Sales budget data saved successfully via API');
    } catch (error) {
      console.error('Error saving sales budget data via API:', error);
      throw error;
    }
  }

  // Get sales budget data via API
  static async getSalesBudgetData(): Promise<SavedBudgetData[]> {
    try {
      console.log('Loading sales budget data from API...');
      const response = await apiService.getBudgets();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const data = response.data || [];
      console.log('Successfully loaded', data.length, 'budget items from API');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error loading sales budget data via API:', error);
      // Don't fallback to localStorage - throw error to show user that API is required
      throw new Error('Failed to load budget data from server. Please ensure backend is running and you are authenticated.');
    }
  }

  // Save rolling forecast data via API
  static async saveRollingForecastData(data: SavedForecastData[]): Promise<void> {
    try {
      console.log('Saving rolling forecast data via API:', data.length, 'items');
      
      // For each item, either create or update via API
      for (const item of data) {
        if (item.id && !item.id.includes('temp_')) {
          // Update existing item
          console.log('Updating forecast item:', item.id);
          await apiService.updateForecast(parseInt(item.id), item);
        } else {
          // Create new item
          console.log('Creating new forecast item:', item.customer, item.item);
          const response = await apiService.createForecast(item);
          console.log('Created forecast item with response:', response);
        }
      }
      console.log('Rolling forecast data saved successfully via API');
    } catch (error) {
      console.error('Error saving rolling forecast data via API:', error);
      throw error;
    }
  }

  // Get rolling forecast data via API
  static async getRollingForecastData(): Promise<SavedForecastData[]> {
    try {
      console.log('Loading rolling forecast data from API...');
      const response = await apiService.getForecasts();
      
      if (response.error) {
        console.warn('API returned error for rolling forecast data:', response.error);
        throw new Error(response.error);
      }
      
      const data = response.data || [];
      console.log('Successfully loaded', data.length, 'forecast items from API');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error loading rolling forecast data via API:', error);
      // Don't fallback to localStorage - throw error to show user that API is required
      throw new Error('Failed to load forecast data from server. Please ensure backend is running and you are authenticated.');
    }
  }

  // Get data by user (for managers to see salesman data)
  static async getSalesBudgetDataByUser(userName?: string): Promise<SavedBudgetData[]> {
    const allData = await this.getSalesBudgetData();
    if (!userName) return allData;
    return allData.filter(item => item.createdBy === userName);
  }

  static async getRollingForecastDataByUser(userName?: string): Promise<SavedForecastData[]> {
    const allData = await this.getRollingForecastData();
    if (!userName) return allData;
    return allData.filter(item => item.createdBy === userName);
  }

  // Get data by customer (for managers to see customer breakdown)
  static async getSalesBudgetDataByCustomer(customerName: string): Promise<SavedBudgetData[]> {
    const allData = await this.getSalesBudgetData();
    return allData.filter(item => item.customer.toLowerCase().includes(customerName.toLowerCase()));
  }

  static async getRollingForecastDataByCustomer(customerName: string): Promise<SavedForecastData[]> {
    const allData = await this.getRollingForecastData();
    return allData.filter(item => item.customer.toLowerCase().includes(customerName.toLowerCase()));
  }

  // Update status of saved data while preserving original entry
  static async updateSalesBudgetStatus(itemId: string, status: 'draft' | 'saved' | 'submitted' | 'approved'): Promise<void> {
    try {
      const allData = await this.getSalesBudgetData();
      const itemToUpdate = allData.find(item => item.id === itemId);
      if (itemToUpdate) {
        const updatedItem = { ...itemToUpdate, status, lastModified: new Date().toISOString() };
        await apiService.updateBudget(parseInt(itemId), updatedItem);
        console.log(`Sales budget status updated via API: ${itemId} -> ${status}`);
      }
    } catch (error) {
      console.error('Error updating sales budget status via API:', error);
      throw error;
    }
  }

  static async updateRollingForecastStatus(itemId: string, status: 'draft' | 'saved' | 'submitted' | 'approved'): Promise<void> {
    try {
      const allData = await this.getRollingForecastData();
      const itemToUpdate = allData.find(item => item.id === itemId);
      if (itemToUpdate) {
        const updatedItem = { ...itemToUpdate, status, lastModified: new Date().toISOString() };
        await apiService.updateForecast(parseInt(itemId), updatedItem);
        console.log(`Rolling forecast status updated via API: ${itemId} -> ${status}`);
      }
    } catch (error) {
      console.error('Error updating rolling forecast status via API:', error);
      throw error;
    }
  }

  // Create submission copy while preserving original entry
  static createSubmissionCopy(originalData: SavedBudgetData | SavedForecastData, workflowId: string): SavedBudgetData | SavedForecastData {
    const submissionCopy = {
      ...originalData,
      id: `${originalData.id}_submission_${workflowId}`,
      status: 'submitted' as const,
      lastModified: new Date().toISOString(),
      // Add metadata to track submission
      submissionMetadata: {
        originalId: originalData.id,
        workflowId,
        submittedAt: new Date().toISOString(),
        originalStatus: originalData.status
      }
    };

    console.log('Created submission copy with ID:', submissionCopy.id);
    return submissionCopy;
  }

  // Save submission copies while keeping originals intact
  static async saveSubmissionCopies(budgetData: SavedBudgetData[], forecastData: SavedForecastData[], workflowId: string): Promise<void> {
    try {
      // Create submission copies for budget data
      if (budgetData.length > 0) {
        const budgetCopies = budgetData.map(item => this.createSubmissionCopy(item, workflowId) as SavedBudgetData);
        await this.saveSalesBudgetData(budgetCopies);
      }

      // Create submission copies for forecast data
      if (forecastData.length > 0) {
        const forecastCopies = forecastData.map(item => this.createSubmissionCopy(item, workflowId) as SavedForecastData);
        await this.saveRollingForecastData(forecastCopies);
      }

      console.log(`Submission copies saved via API for workflow ${workflowId}`);
    } catch (error) {
      console.error('Error saving submission copies via API:', error);
      throw error;
    }
  }

  // Get summary statistics for managers - including submission tracking
  static async getSummaryStats() {
    const budgetData = await this.getSalesBudgetData();
    const forecastData = await this.getRollingForecastData();

    // Separate original vs submission copies
    const originalBudgetData = budgetData.filter(item => !item.submissionMetadata);
    const submittedBudgetData = budgetData.filter(item => item.submissionMetadata);
    const originalForecastData = forecastData.filter(item => !item.submissionMetadata);
    const submittedForecastData = forecastData.filter(item => item.submissionMetadata);

    const totalBudgetItems = originalBudgetData.length;
    const totalForecastItems = originalForecastData.length;
    const totalSubmittedBudgetItems = submittedBudgetData.length;
    const totalSubmittedForecastItems = submittedForecastData.length;

    const totalBudgetValue = originalBudgetData.reduce((sum, item) => sum + item.budgetValue2026, 0);
    const totalForecastValue = originalForecastData.reduce((sum, item) => sum + item.forecastTotal * 100, 0);
    const totalSubmittedBudgetValue = submittedBudgetData.reduce((sum, item) => sum + item.budgetValue2026, 0);
    const totalSubmittedForecastValue = submittedForecastData.reduce((sum, item) => sum + item.forecastTotal * 100, 0);

    const uniqueCustomers = new Set([
      ...originalBudgetData.map(item => item.customer),
      ...originalForecastData.map(item => item.customer)
    ]);

    const uniqueSalesmen = new Set([
      ...originalBudgetData.map(item => item.createdBy),
      ...originalForecastData.map(item => item.createdBy)
    ]);

    return {
      // Original data (still available for other purposes)
      totalBudgetItems,
      totalForecastItems,
      totalBudgetValue,
      totalForecastValue,
      // Submitted data (for approval workflow)
      totalSubmittedBudgetItems,
      totalSubmittedForecastItems,
      totalSubmittedBudgetValue,
      totalSubmittedForecastValue,
      // General stats
      uniqueCustomers: uniqueCustomers.size,
      uniqueSalesmen: uniqueSalesmen.size,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get only original data (excluding submission copies)
  static async getOriginalSalesBudgetData(): Promise<SavedBudgetData[]> {
    const data = await this.getSalesBudgetData();
    return data.filter(item => !item.submissionMetadata);
  }

  static async getOriginalRollingForecastData(): Promise<SavedForecastData[]> {
    const data = await this.getRollingForecastData();
    return data.filter(item => !item.submissionMetadata);
  }

  // Get only submitted data (submission copies)
  static async getSubmittedSalesBudgetData(): Promise<SavedBudgetData[]> {
    const data = await this.getSalesBudgetData();
    return data.filter(item => item.submissionMetadata);
  }

  static async getSubmittedRollingForecastData(): Promise<SavedForecastData[]> {
    const data = await this.getRollingForecastData();
    return data.filter(item => item.submissionMetadata);
  }

  // Get data by workflow ID
  static async getDataByWorkflowId(workflowId: string): Promise<{ budgetData: SavedBudgetData[], forecastData: SavedForecastData[] }> {
    const budgetData = (await this.getSalesBudgetData()).filter(item =>
      item.submissionMetadata?.workflowId === workflowId
    );
    const forecastData = (await this.getRollingForecastData()).filter(item =>
      item.submissionMetadata?.workflowId === workflowId
    );

    return { budgetData, forecastData };
  }

  // Sync data between budget and forecast (create corresponding entries)
  static async syncBudgetToForecast(budgetItem: SavedBudgetData): Promise<void> {
    try {
      // Check if corresponding forecast item already exists
      const forecastData = await this.getRollingForecastData();
      const existingForecast = forecastData.find(
        item => item.customer === budgetItem.customer && item.item === budgetItem.item
      );

      if (!existingForecast) {
        // Create corresponding forecast item
        const forecastItem: SavedForecastData = {
          id: `temp_${Date.now()}`, // Temporary ID, backend will assign real ID
          customer: budgetItem.customer,
          item: budgetItem.item,
          category: budgetItem.category,
          brand: budgetItem.brand,
          type: 'rolling_forecast',
          createdBy: budgetItem.createdBy,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          forecastTotal: budgetItem.budget2026,
          status: 'draft',
          forecastData: {}
        };

        await this.saveRollingForecastData([forecastItem]);
        console.log('Created corresponding forecast item for budget:', budgetItem.customer, budgetItem.item);
      }
    } catch (error) {
      console.error('Error syncing budget to forecast:', error);
      // Don't throw - this is a nice-to-have feature
    }
  }

  static async syncForecastToBudget(forecastItem: SavedForecastData): Promise<void> {
    try {
      // Check if corresponding budget item already exists
      const budgetData = await this.getSalesBudgetData();
      const existingBudget = budgetData.find(
        item => item.customer === forecastItem.customer && item.item === forecastItem.item
      );

      if (!existingBudget) {
        // Create corresponding budget item
        const budgetItem: SavedBudgetData = {
          id: `temp_${Date.now()}`, // Temporary ID, backend will assign real ID
          customer: forecastItem.customer,
          item: forecastItem.item,
          category: forecastItem.category,
          brand: forecastItem.brand,
          type: 'sales_budget',
          createdBy: forecastItem.createdBy,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          budget2025: 0,
          actual2025: 0,
          budget2026: forecastItem.forecastTotal,
          rate: 0,
          stock: 0,
          git: 0,
          budgetValue2026: 0,
          discount: 0,
          monthlyData: [],
          status: 'draft'
        };

        await this.saveSalesBudgetData([budgetItem]);
        console.log('Created corresponding budget item for forecast:', forecastItem.customer, forecastItem.item);
      }
    } catch (error) {
      console.error('Error syncing forecast to budget:', error);
      // Don't throw - this is a nice-to-have feature
    }
  }

  // Clear all data (admin function) - not recommended for production
  static async clearAllData(): Promise<void> {
    console.warn('Clear all data not implemented for API version for safety');
  }

  // Placeholder methods for GIT data (would need specific API endpoints)
  static async getGitData() {
    try {
      console.warn('GIT data retrieval not implemented for API version');
      return [];
    } catch (error) {
      console.error('Error loading GIT data via API:', error);
      return [];
    }
  }

  static async getGitDataForItem(customer: string, item: string) {
    try {
      console.warn('GIT data retrieval for item not implemented for API version');
      return [];
    } catch (error) {
      console.error('Error getting GIT data for item via API:', error);
      return [];
    }
  }

  static async getGitSummaryForItem(customer: string, item: string) {
    try {
      console.warn('GIT summary for item not implemented for API version');
      return { gitQuantity: 0, eta: '', status: 'none', itemCount: 0 };
    } catch (error) {
      console.error('Error calculating GIT summary via API:', error);
      return { gitQuantity: 0, eta: '', status: 'none', itemCount: 0 };
    }
  }
}

export default DataPersistenceManager;
