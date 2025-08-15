import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Plus, 
  Minus, 
  Edit, 
  Save, 
  X, 
  MessageSquare, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Target,
  TrendingUp,
  Calendar,
  User,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../lib/api';
import ViewOnlyMonthlyDistributionModal from './ViewOnlyMonthlyDistributionModal';
import { ForecastData } from '../contexts/WorkflowContext';

interface SalesmanCustomerData {
  salesman: string;
  customer: string;
  item: string;
  category: string;
  brand: string;
  budget2025: number;
  actual2025: number;
  forecast2025: number;
  stock: number;
  git: number;
  lastModified: string;
  forecastData: { [month: string]: number };
  status: 'draft' | 'submitted' | 'approved' | 'revised';
}

interface CustomerSummary {
  customer: string;
  salesman: string;
  totalItems: number;
  totalBudget: number;
  totalForecast: number;
  lastUpdated: string;
  status: 'active' | 'needs_attention' | 'completed';
}

const ManagerRollingForecastInterface: React.FC = () => {
  const { user } = useAuth();
  const { workflowItems, submitForApproval } = useWorkflow();
  const [customerSummaries, setCustomerSummaries] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerDetails, setCustomerDetails] = useState<SalesmanCustomerData[]>([]);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [editValues, setEditValues] = useState<{ [key: string]: { [month: string]: number } }>({});
  const [isViewOnlyModalOpen, setIsViewOnlyModalOpen] = useState(false);
  const [selectedRowForView, setSelectedRowForView] = useState<SalesmanCustomerData | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedItemForComment, setSelectedItemForComment] = useState<SalesmanCustomerData | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    loadCustomerData();
  }, [workflowItems]);

  const loadCustomerData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load forecast data from API
      const forecastsResponse = await apiService.getForecasts();
      if (forecastsResponse.error) {
        throw new Error(forecastsResponse.error);
      }
      
      const forecastData = Array.isArray(forecastsResponse.data) ? forecastsResponse.data : [];
      
      // Load budget data from API
      const budgetsResponse = await apiService.getBudgets();
      if (budgetsResponse.error) {
        throw new Error(budgetsResponse.error);
      }
      
      const budgetData = Array.isArray(budgetsResponse.data) ? budgetsResponse.data : [];
      
      // Group by customer and salesman
      const customerMap = new Map<string, SalesmanCustomerData[]>();
      
      // Process forecast data
      forecastData.forEach((item: any) => {
        const key = `${item.customer}`;
        if (!customerMap.has(key)) {
          customerMap.set(key, []);
        }
        
        // Find matching budget data
        const matchingBudget = budgetData.find((budget: any) => 
          budget.customer === item.customer && budget.item === item.item
        );
        
        const data: SalesmanCustomerData = {
          salesman: item.createdBy,
          customer: item.customer,
          item: item.item,
          category: item.category,
          brand: item.brand,
          budget2025: matchingBudget?.budget2025 || 0,
          actual2025: matchingBudget?.actual2025 || 0,
          forecast2025: item.forecastTotal || 0,
          stock: matchingBudget?.stock || 0,
          git: matchingBudget?.git || 0,
          lastModified: item.lastModified,
          forecastData: item.forecastData || {},
          status: item.status as any || 'draft'
        };
        
        customerMap.get(key)!.push(data);
      });
      
      // Create customer summaries
      const summaries: CustomerSummary[] = Array.from(customerMap.entries()).map(([customer, items]) => {
        const totalBudget = items.reduce((sum, item) => sum + item.budget2025, 0);
        const totalForecast = items.reduce((sum, item) => sum + item.forecast2025, 0);
        const lastUpdated = items.reduce((latest, item) => 
          new Date(item.lastModified) > new Date(latest) ? item.lastModified : latest, 
          items[0].lastModified
        );
        
        return {
          customer,
          salesman: items[0].salesman,
          totalItems: items.length,
          totalBudget,
          totalForecast,
          lastUpdated,
          status: totalForecast > 0 ? 'active' : 'needs_attention'
        };
      });
      
      setCustomerSummaries(summaries);
    } catch (err: any) {
      console.error('Error loading customer data:', err);
      setError('Failed to load customer data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerExpand = (customer: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customer)) {
      newExpanded.delete(customer);
    } else {
      newExpanded.add(customer);
      // Load detailed data for this customer
      loadCustomerDetails(customer);
    }
    setExpandedCustomers(newExpanded);
  };

  const loadCustomerDetails = async (customer: string) => {
    try {
      // Load forecast data from API
      const forecastsResponse = await apiService.getForecasts({ customer });
      if (forecastsResponse.error) {
        throw new Error(forecastsResponse.error);
      }
      
      const forecastData = Array.isArray(forecastsResponse.data) ? forecastsResponse.data : [];
      
      // Load budget data from API
      const budgetsResponse = await apiService.getBudgets({ customer });
      if (budgetsResponse.error) {
        throw new Error(budgetsResponse.error);
      }
      
      const budgetData = Array.isArray(budgetsResponse.data) ? budgetsResponse.data : [];
      
      const details = forecastData.map((item: any) => {
        // Find matching budget data
        const matchingBudget = budgetData.find((budget: any) => 
          budget.customer === item.customer && budget.item === item.item
        );
        
        return {
          salesman: item.createdBy,
          customer: item.customer,
          item: item.item,
          category: item.category,
          brand: item.brand,
          budget2025: matchingBudget?.budget2025 || 0,
          actual2025: matchingBudget?.actual2025 || 0,
          forecast2025: item.forecastTotal || 0,
          stock: matchingBudget?.stock || 0,
          git: matchingBudget?.git || 0,
          lastModified: item.lastModified,
          forecastData: item.forecastData || {},
          status: item.status as any || 'draft'
        };
      });
      
      setCustomerDetails(details);
    } catch (err: any) {
      console.error('Error loading customer details:', err);
      setError('Failed to load customer details: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditItem = (itemId: string) => {
    const newEditing = new Set(editingItems);
    if (newEditing.has(itemId)) {
      newEditing.delete(itemId);
    } else {
      newEditing.add(itemId);
      // Initialize edit values
      const item = customerDetails.find(d => `${d.customer}_${d.item}` === itemId);
      if (item) {
        setEditValues(prev => ({
          ...prev,
          [itemId]: { ...item.forecastData }
        }));
      }
    }
    setEditingItems(newEditing);
  };

  const handleMonthlyValueChange = (itemId: string, month: string, value: number) => {
    setEditValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [month]: value
      }
    }));
  };

  const handleSaveChanges = async (itemId: string) => {
    const item = customerDetails.find(d => `${d.customer}_${d.item}` === itemId);
    if (item && editValues[itemId]) {
      try {
        // Calculate new forecast total
        const newTotal = Object.values(editValues[itemId]).reduce((sum, val) => sum + (val || 0), 0);
        
        // Find the forecast item in the API
        const forecastsResponse = await apiService.getForecasts({
          customer: item.customer,
          item: item.item
        });
        
        if (forecastsResponse.error) {
          throw new Error(forecastsResponse.error);
        }
        
        const forecastItems = Array.isArray(forecastsResponse.data) ? forecastsResponse.data : [];
        if (forecastItems.length === 0) {
          throw new Error('Forecast item not found');
        }
        
        const forecastItem = forecastItems[0];
        
        // Update forecast data via API
        const updatedForecastData = {
          ...forecastItem,
          forecastData: editValues[itemId],
          forecastTotal: newTotal,
          lastModified: new Date().toISOString(),
          status: 'revised'
        };
        
        const updateResponse = await apiService.updateForecast(forecastItem.id, updatedForecastData);
        if (updateResponse.error) {
          throw new Error(updateResponse.error);
        }
        
        // Update local state
        setCustomerDetails(prev => prev.map(d => 
          `${d.customer}_${d.item}` === itemId 
            ? { ...d, forecastData: editValues[itemId], forecast2025: newTotal, status: 'revised' }
            : d
        ));
        
        // Remove from editing
        const newEditing = new Set(editingItems);
        newEditing.delete(itemId);
        setEditingItems(newEditing);
        
        // Update customer summaries
        await loadCustomerData();
      } catch (err: any) {
        console.error('Error saving changes:', err);
        setError('Failed to save changes: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleViewDetails = (item: SalesmanCustomerData) => {
    // Convert to monthly format for view-only modal
    const monthlyData = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(month => ({
      month,
      budgetValue: item.forecastData[month] || 0,
      actualValue: 0,
      rate: 100,
      stock: item.stock,
      git: item.git,
      discount: 0
    }));

    setSelectedRowForView({
      ...item,
      monthlyData
    } as any);
    setIsViewOnlyModalOpen(true);
  };

  const handleAddComment = (item: SalesmanCustomerData) => {
    setSelectedItemForComment(item);
    setShowCommentModal(true);
  };

  const handleSendComment = async () => {
    if (selectedItemForComment && commentText.trim()) {
      try {
        // In a real implementation, this would send a notification to the salesman
        console.log('Sending comment to:', selectedItemForComment.salesman, 'Message:', commentText);
        
        // Add comment via workflow context
        // This would be integrated with the follow-back system
        console.log('Comment sent successfully');
        
        setShowCommentModal(false);
        setCommentText('');
        setSelectedItemForComment(null);
      } catch (err: any) {
        console.error('Error sending comment:', err);
        setError('Failed to send comment: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleSendToSupplyChain = async (customer: string) => {
    try {
      const customerItems = customerDetails.filter(item => item.customer === customer);
      
      // Submit for approval via workflow context
      // Format forecast data to match ForecastData interface
      const forecastData: ForecastData[] = customerItems.map(item => ({
        id: `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customer: item.customer,
        item: item.item,
        category: item.category,
        brand: item.brand,
        year: new Date().getFullYear().toString(),
        forecastUnits: item.forecast2025,
        forecastValue: item.forecast2025 * 100, // Assuming $100 per unit as default value
        createdBy: item.salesman,
        createdAt: new Date().toISOString()
      }));
      
      // Get budget data for submission
      const budgetsResponse = await apiService.getBudgets({ customer });
      if (budgetsResponse.error) {
        throw new Error(budgetsResponse.error);
      }
      
      const budgetData = Array.isArray(budgetsResponse.data) ? budgetsResponse.data : [];
      
      await submitForApproval(budgetData, forecastData);
      
      alert(`Forecast for ${customer} submitted for approval`);
    } catch (err: any) {
      console.error('Error sending to supply chain:', err);
      setError('Failed to send to supply chain: ' + (err.message || 'Unknown error'));
    }
  };

  const getMonths = () => ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'revised': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Rolling Forecast Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage and approve rolling forecasts submitted by salesmen
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Customers</div>
            <div className="text-2xl font-bold text-purple-600">{customerSummaries.length}</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-200 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-blue-600">Total Budget</div>
                <div className="text-lg font-bold text-blue-900">
                  ${customerSummaries.reduce((sum, c) => sum + c.totalBudget, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-200 p-2 rounded-full">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-green-600">Total Forecast</div>
                <div className="text-lg font-bold text-green-900">
                  {customerSummaries.reduce((sum, c) => sum + c.totalForecast, 0).toLocaleString()} units
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-200 p-2 rounded-full">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-orange-600">Total Items</div>
                <div className="text-lg font-bold text-orange-900">
                  {customerSummaries.reduce((sum, c) => sum + c.totalItems, 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-200 p-2 rounded-full">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-purple-600">Active Customers</div>
                <div className="text-lg font-bold text-purple-900">
                  {customerSummaries.filter(c => c.status === 'active').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Customer Forecasts by Salesman</h3>
          <p className="text-sm text-gray-600 mt-1">
            Click to expand and manage individual customer forecasts
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {customerSummaries.map((summary) => (
            <div key={summary.customer} className="p-4">
              {/* Customer Summary Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleCustomerExpand(summary.customer)}
                    className="flex items-center gap-2 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    {expandedCustomers.has(summary.customer) ? (
                    <div>
                      <div className="font-medium text-gray-900">{summary.customer}</div>
                      <div className="text-sm text-gray-500">Salesman: {summary.salesman}</div>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Items</div>
                    <div className="font-medium">{summary.totalItems}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Budget</div>
                    <div className="font-medium">{summary.totalBudget.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Forecast</div>
                    <div className="font-medium text-green-600">{summary.totalForecast.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Last Updated</div>
                    <div className="text-xs text-gray-500">
                      {new Date(summary.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      summary.status === 'active' ? 'bg-green-100 text-green-800' :
                      summary.status === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {summary.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Customer Details */}
              {expandedCustomers.has(summary.customer) && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Forecast Details - {summary.customer}
                    </h4>
                    <button
                      onClick={() => handleSendToSupplyChain(summary.customer)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send to Supply Chain
                    </button>
                  </div>

                  <div className="space-y-3">
                    {customerDetails.filter(d => d.customer === summary.customer).map((item) => {
                      const itemId = `${item.customer}_${item.item}`;
                      const isEditing = editingItems.has(itemId);
                      
                      return (
                        <div key={itemId} className="bg-white rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.item}</div>
                              <div className="text-sm text-gray-500">
                                {item.category} - {item.brand}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                <span>Budget: {item.budget2025}</span>
                                <span>Actual: {item.actual2025}</span>
                                <span>Forecast: <strong className="text-green-600">{item.forecast2025}</strong></span>
                                <span>Stock: {item.stock}</span>
                                <span>GIT: {item.git}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                {item.status.toUpperCase()}
                              </span>
                              <button
                                onClick={() => handleViewDetails(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditItem(itemId)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title={isEditing ? "Cancel edit" : "Edit forecast"}
                              >
                                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleAddComment(item)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Add comment"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Monthly Forecast Edit */}
                          {isEditing && (
                            <div className="border-t pt-3">
                              <div className="mb-3">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  Edit Monthly Forecast
                                </h5>
                                <div className="grid grid-cols-6 gap-2">
                                  {getMonths().map(month => (
                                    <div key={month} className="text-center">
                                      <div className="text-xs font-medium text-gray-600 mb-1">{month}</div>
                                      <input
                                        type="number"
                                        value={editValues[itemId]?.[month] || 0}
                                        onChange={(e) => handleMonthlyValueChange(itemId, month, parseInt(e.target.value) || 0)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                  Total: <strong>{Object.values(editValues[itemId] || {}).reduce((sum, val) => sum + (val || 0), 0)}</strong> units
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveChanges(itemId)}
                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                  >
                                    <Save className="w-3 h-3" />
                                    Save
                                  </button>
                                  <button
                                    onClick={() => handleEditItem(itemId)}
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {customerSummaries.length === 0 && !loading && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forecast data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Forecast data will appear here when salesmen submit their rolling forecasts.
            </p>
          </div>
        )}
      </div>

      {/* View Only Modal */}
      <ViewOnlyMonthlyDistributionModal
        isOpen={isViewOnlyModalOpen}
        onClose={() => {
          setIsViewOnlyModalOpen(false);
          setSelectedRowForView(null);
        }}
        data={selectedRowForView ? {
          customer: selectedRowForView.customer,
          item: selectedRowForView.item,
          category: selectedRowForView.category,
          brand: selectedRowForView.brand,
          monthlyData: (selectedRowForView as any).monthlyData || [],
          totalBudget: selectedRowForView.forecast2025,
          totalActual: selectedRowForView.actual2025,
          totalUnits: selectedRowForView.forecast2025,
          createdBy: selectedRowForView.salesman,
          lastModified: selectedRowForView.lastModified
        } : null}
        type="rolling_forecast"
      />

      {/* Comment Modal */}
      {showCommentModal && selectedItemForComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Add Comment/Feedback
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">To: {selectedItemForComment.salesman}</p>
                <p className="text-sm text-gray-600">Item: {selectedItemForComment.item}</p>
                <p className="text-sm text-gray-600">Customer: {selectedItemForComment.customer}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment/Feedback
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter your feedback or questions..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendComment}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  disabled={!commentText.trim()}
                >
                  Send Comment
                </button>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentText('');
                    setSelectedItemForComment(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRollingForecastInterface;
