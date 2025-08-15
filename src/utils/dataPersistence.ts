// Shared data persistence utility for sales budget and forecast data
// This ensures data saved by salesman is visible to managers
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
  // Save sales budget data
  static async saveSalesBudgetData(data: SavedBudgetData[]): Promise<void> {
    try {
      // For each item, either create or update via API
      for (const item of data) {
        if (item.id) {
          // Update existing item
          await apiService.updateBudget(item.id as any, item);
        } else {
          // Create new item
          await apiService.createBudget(item);
        }
      }
      console.log('Sales budget data saved successfully via API:', data.length, 'items');
    } catch (error) {
      console.error('Error saving sales budget data via API:', error);
      throw error;
    }
  }

  // Get sales budget data
  static async getSalesBudgetData(): Promise<SavedBudgetData[]> {
    try {
      const response = await apiService.getBudgets();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    } catch (error) {
      console.error('Error loading sales budget data via API:', error);
      return [];
    }
  }

  // Save rolling forecast data
  static async saveRollingForecastData(data: SavedForecastData[]): Promise<void> {
    try {
      // For each item, either create or update via API
      for (const item of data) {
        if (item.id) {
          // Update existing item
          await apiService.updateForecast(item.id as any, item);
        } else {
          // Create new item
          await apiService.createForecast(item);
        }
      }
      console.log('Rolling forecast data saved successfully via API:', data.length, 'items');
    } catch (error) {
      console.error('Error saving rolling forecast data via API:', error);
      throw error;
    }
  }

  // Get rolling forecast data
  static async getRollingForecastData(): Promise<SavedForecastData[]> {
    try {
      const response = await apiService.getForecasts();
      if (response.error) {
        console.warn('API returned error for rolling forecast data:', response.error);
        return [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      // Handle fetch failures gracefully - this is expected when backend is not running
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('Backend not available for rolling forecast data - working in offline mode');
      } else {
        console.warn('Error loading rolling forecast data via API:', error);
      }
      return [];
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
        await apiService.updateBudget(itemId as any, updatedItem);
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
        await apiService.updateForecast(itemId as any, updatedItem);
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

  // Clear all data (admin function) - not implemented for API version
  static async clearAllData(): Promise<void> {
    console.warn('Clear all data not implemented for API version');
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

  // Sync data between budget and forecast (for consistency) - simplified for API version
  static async syncBudgetToForecast(): Promise<void> {
    // In API version, data is already synced on the backend
    console.log('Sync between budget and forecast handled by backend API');
  }

  // Get GIT data uploaded by admin
  static async getGitData() {
    try {
      // This would need to be implemented with a specific API endpoint
      console.warn('GIT data retrieval not implemented for API version');
      return [];
    } catch (error) {
      console.error('Error loading GIT data via API:', error);
      return [];
    }
  }

  // Get GIT data for a specific customer and item
  static async getGitDataForItem(customer: string, item: string) {
    try {
      // This would need to be implemented with a specific API endpoint
      console.warn('GIT data retrieval for item not implemented for API version');
      return [];
    } catch (error) {
      console.error('Error getting GIT data for item via API:', error);
      return [];
    }
  }

  // Get aggregated GIT quantity and ETA for customer/item combination
  static async getGitSummaryForItem(customer: string, item: string) {
    try {
      // This would need to be implemented with a specific API endpoint
      console.warn('GIT summary for item not implemented for API version');
      return { gitQuantity: 0, eta: '', status: 'none', itemCount: 0 };
    } catch (error) {
      console.error('Error calculating GIT summary via API:', error);
      return { gitQuantity: 0, eta: '', status: 'none', itemCount: 0 };
    }
  }

  // Determine overall status from multiple GIT items
  private static determineOverallGitStatus(gitItems: any[]) {
    if (gitItems.length === 0) return 'none';

    const statuses = gitItems.map(item => item.status);

    if (statuses.includes('delayed')) return 'delayed';
    if (statuses.includes('in_transit')) return 'in_transit';
    if (statuses.includes('shipped')) return 'shipped';
    if (statuses.includes('ordered')) return 'ordered';
    if (statuses.every(status => status === 'arrived')) return 'arrived';

    return 'mixed';
  }
}

export default DataPersistenceManager;
