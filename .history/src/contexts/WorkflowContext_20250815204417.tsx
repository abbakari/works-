import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { YearlyBudgetData } from './BudgetContext';
import { useAuth } from './AuthContext';
import { apiService } from '../lib/api';

export type WorkflowState = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'sent_to_supply_chain';
export type WorkflowType = 'sales_budget' | 'rolling_forecast';

export interface WorkflowComment {
  id: string;
  author: string;
  authorRole: string;
  message: string;
  timestamp: string;
  type: 'comment' | 'approval' | 'rejection' | 'request_changes';
  isFollowBack?: boolean;
}

export interface WorkflowNotification {
  id: string;
  recipientId: string;
  recipientRole: string;
  fromUser: string;
  fromRole: string;
  title: string;
  message: string;
  workflowItemId: string;
  type: 'approval' | 'rejection' | 'comment' | 'follow_back' | 'supply_chain_request';
  timestamp: string;
  read: boolean;
}

export interface ForecastData {
  id: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  year: string;
  quarter?: string;
  month?: string;
  forecastUnits: number;
  forecastValue: number;
  actualUnits?: number;
  actualValue?: number;
  variance?: number;
  createdBy: string;
  createdAt: string;
}

export interface WorkflowItem {
  id: string;
  type: WorkflowType;
  title: string;
  description?: string;
  createdBy: string;
  createdByRole: string;
  currentState: WorkflowState;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  sentToSupplyChainAt?: string;
  comments: WorkflowComment[];
  budgetData?: YearlyBudgetData[];
  forecastData?: ForecastData[];
  customers: string[];
  totalValue: number;
  year: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WorkflowContextType {
  workflowItems: WorkflowItem[];
  notifications: WorkflowNotification[];
  isLoading: boolean;
  error: string | null;
  submitForApproval: (budgetData: YearlyBudgetData[], forecastData?: ForecastData[]) => Promise<string>;
  approveItem: (itemId: string, comment: string, managerId: string) => Promise<void>;
  rejectItem: (itemId: string, comment: string, managerId: string) => Promise<void>;
  addComment: (itemId: string, comment: string, userId: string, userRole: string, isFollowBack?: boolean) => Promise<void>;
  sendToSupplyChain: (itemId: string, managerId: string) => Promise<void>;
  getItemsByState: (state: WorkflowState) => WorkflowItem[];
  getItemsBySalesman: (salesmanName: string) => WorkflowItem[];
  getItemsByYear: (year: string) => WorkflowItem[];
  getNotificationsForUser: (userId: string, role: string) => WorkflowNotification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  getItemDetails: (itemId: string) => WorkflowItem | undefined;
  refreshWorkflowData: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();


  // Load workflow data from API
  const loadWorkflowData = async () => {
    if (!user) {
      setWorkflowItems([]);
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Load workflow items from API
      const itemsResponse = await apiService.request('/workflow/items/');
      if (itemsResponse.error) {
        throw new Error(itemsResponse.error);
      }
      setWorkflowItems(itemsResponse.data || []);

      // Load notifications from API
      const notificationsResponse = await apiService.request('/workflow/notifications/');
      if (notificationsResponse.error) {
        throw new Error(notificationsResponse.error);
      }
      setNotifications(notificationsResponse.data || []);
    } catch (err: any) {
      console.error('Error loading workflow data from API:', err);
      setWorkflowItems([]);
      setNotifications([]);
      setError('Failed to load workflow data from API: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadWorkflowData();
    } else {
      setWorkflowItems([]);
      setNotifications([]);
    }
  }, [user]);

  const submitForApproval = async (budgetData: YearlyBudgetData[], forecastData?: ForecastData[]): Promise<string> => {
    if (!user) throw new Error('User must be logged in');

    // Handle both budget and forecast data safely
    const year = budgetData[0]?.year || forecastData?.[0]?.year || new Date().getFullYear().toString();
    const customers = [...new Set([...budgetData.map(b => b.customer), ...(forecastData?.map(f => f.customer) || [])])];
    const totalValue = budgetData.reduce((sum, b) => sum + b.totalBudget, 0) +
                      (forecastData?.reduce((sum, f) => sum + f.forecastValue, 0) || 0);

    // Determine creator from budget or forecast data
    const createdBy = budgetData[0]?.createdBy || forecastData?.[0]?.createdBy || user.name;

    try {
      // Create workflow item via API
      const workflowItemData = {
        type: forecastData && forecastData.length > 0 ? 'rolling_forecast' : 'sales_budget',
        title: `${year} ${forecastData && forecastData.length > 0 ? 'Forecast' : 'Budget'} - ${customers.join(', ')}`,
        description: `Submitted for manager approval`,
        createdBy,
        createdByRole: 'salesman',
        currentState: 'submitted',
        submittedAt: new Date().toISOString(),
        customers,
        totalValue,
        year,
        priority: totalValue > 200000 ? 'high' : totalValue > 100000 ? 'medium' : 'low',
        budgetData,
        forecastData
      };

      const response = await apiService.request('/workflow/items/', {
        method: 'POST',
        body: JSON.stringify(workflowItemData),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const newItem = response.data;
      setWorkflowItems(prev => [...prev, newItem]);

      return newItem.id;
    } catch (err: any) {
      console.error('Error submitting for approval:', err);
      throw err;
    }
  };

  const approveItem = async (itemId: string, comment: string, managerId: string): Promise<void> => {
    try {
      // Update workflow item via API
      const updateData = {
        currentState: 'approved',
        approvedBy: managerId,
        approvedAt: new Date().toISOString(),
        comments: {
          author: managerId,
          authorRole: 'manager',
          message: comment,
          timestamp: new Date().toISOString(),
          type: 'approval'
        }
      };

      const response = await apiService.request(`/workflow/items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const updatedItem = response.data;
      setWorkflowItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
    } catch (err: any) {
      console.error('Error approving item:', err);
      throw err;
    }
  };

  const rejectItem = async (itemId: string, comment: string, managerId: string): Promise<void> => {
    try {
      // Update workflow item via API
      const updateData = {
        currentState: 'rejected',
        rejectedBy: managerId,
        rejectedAt: new Date().toISOString(),
        comments: {
          author: managerId,
          authorRole: 'manager',
          message: comment,
          timestamp: new Date().toISOString(),
          type: 'rejection'
        }
      };

      const response = await apiService.request(`/workflow/items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const updatedItem = response.data;
      setWorkflowItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
    } catch (err: any) {
      console.error('Error rejecting item:', err);
      throw err;
    }
  };

  const addComment = async (itemId: string, comment: string, userId: string, userRole: string, isFollowBack?: boolean): Promise<void> => {
    try {
      // Add comment via API
      const commentData = {
        workflowItemId: itemId,
        author: userId,
        authorRole: userRole,
        message: comment,
        timestamp: new Date().toISOString(),
        type: 'comment',
        isFollowBack
      };

      const response = await apiService.request(`/workflow/comments/`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh workflow items to get updated comments
      await loadWorkflowData();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const sendToSupplyChain = async (itemId: string, managerId: string): Promise<void> => {
    try {
      // Update workflow item via API
      const updateData = {
        currentState: 'sent_to_supply_chain',
        sentToSupplyChainAt: new Date().toISOString()
      };

      const response = await apiService.request(`/workflow/items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const updatedItem = response.data;
      setWorkflowItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
    } catch (err: any) {
      console.error('Error sending to supply chain:', err);
      throw err;
    }
  };

  const getItemsByState = (state: WorkflowState): WorkflowItem[] => {
    return workflowItems.filter(item => item.currentState === state);
  };

  const getNotificationsForUser = (userId: string, role: string): WorkflowNotification[] => {
    return notifications.filter(notification => 
      notification.recipientId === userId || notification.recipientRole === role
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );

      setNotifications(updatedNotifications);
      localStorage.setItem('workflow_notifications', JSON.stringify(updatedNotifications));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const getItemDetails = (itemId: string): WorkflowItem | undefined => {
    return workflowItems.find(item => item.id === itemId);
  };

  const refreshWorkflowData = async (): Promise<void> => {
    await loadWorkflowData();
  };

  const value: WorkflowContextType = {
    workflowItems,
    notifications,
    isLoading,
    error,
    submitForApproval,
    approveItem,
    rejectItem,
    addComment,
    sendToSupplyChain,
    getItemsByState,
    getItemsBySalesman,
    getItemsByYear,
    getNotificationsForUser,
    markNotificationAsRead,
    getItemDetails,
    refreshWorkflowData
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
