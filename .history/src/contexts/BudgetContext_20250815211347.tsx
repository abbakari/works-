import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../lib/api';

export interface MonthlyBudget {
  month: string;
  budgetValue: number;
  actualValue: number;
  rate: number;
  stock: number;
  git: number;
  discount: number;
}

export interface YearlyBudgetData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  year: string;
  totalBudget: number;
  monthlyData: MonthlyBudget[];
  createdBy: string;
  createdAt: string;
}

export interface BudgetContextType {
  yearlyBudgets: YearlyBudgetData[];
  isLoading: boolean;
  error: string | null;
  addYearlyBudget: (budget: Omit<YearlyBudgetData, 'id' | 'createdAt'>) => Promise<string>;
  updateYearlyBudget: (id: string, budget: Partial<YearlyBudgetData>) => Promise<void>;
  deleteYearlyBudget: (id: string) => Promise<void>;
  getBudgetsByCustomer: (customer: string) => YearlyBudgetData[];
  getBudgetsByYear: (year: string) => YearlyBudgetData[];
  refreshBudgets: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [yearlyBudgets, setYearlyBudgets] = useState<YearlyBudgetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();


  // Load budgets from API
  const loadBudgets = async () => {
    if (!user) {
      setYearlyBudgets([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getBudgets();
      if (response.error) {
        throw new Error(response.error);
      }
      setYearlyBudgets(response.data || []);
    } catch (err: any) {
      console.error('Error loading budgets from API:', err);
      setYearlyBudgets([]);
      setError('Failed to load budgets from API: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load budgets when user changes
  useEffect(() => {
    if (user) {
      loadBudgets();
    } else {
      setYearlyBudgets([]);
    }
  }, [user]);

  const addYearlyBudget = async (budget: Omit<YearlyBudgetData, 'id' | 'createdAt'>): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to create budgets');
    }

    try {
      setError(null);

      // Create new budget via API
      const response = await apiService.createBudget(budget);
      if (response.error) {
        throw new Error(response.error);
      }

      const newBudget: YearlyBudgetData = response.data as YearlyBudgetData;
      setYearlyBudgets(prev => [...prev, newBudget]);

      return newBudget.id as string;
    } catch (err: any) {
      const errorMessage = `Failed to create budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateYearlyBudget = async (id: string, budgetUpdate: Partial<YearlyBudgetData>): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to update budgets');
    }

    try {
      setError(null);

      // Update budget via API
      const response = await apiService.updateBudget(id as any, budgetUpdate);
      if (response.error) {
        throw new Error(response.error);
      }

      const updatedBudget: YearlyBudgetData = response.data as YearlyBudgetData;
      setYearlyBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b));
    } catch (err: any) {
      const errorMessage = `Failed to update budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteYearlyBudget = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to delete budgets');
    }

    try {
      setError(null);

      // Delete budget via API
      const response = await apiService.deleteBudget(id as any);
      if (response.error) {
        throw new Error(response.error);
      }

      setYearlyBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      const errorMessage = `Failed to delete budget: ${err?.message || err || 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getBudgetsByCustomer = (customer: string): YearlyBudgetData[] => {
    return yearlyBudgets.filter(b => 
      b.customer.toLowerCase().includes(customer.toLowerCase())
    );
  };

  const getBudgetsByYear = (year: string): YearlyBudgetData[] => {
    return yearlyBudgets.filter(b => b.year === year);
  };

  const refreshBudgets = async (): Promise<void> => {
    await loadBudgets();
  };

  const value: BudgetContextType = {
    yearlyBudgets,
    isLoading,
    error,
    addYearlyBudget,
    updateYearlyBudget,
    deleteYearlyBudget,
    getBudgetsByCustomer,
    getBudgetsByYear,
    refreshBudgets
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
