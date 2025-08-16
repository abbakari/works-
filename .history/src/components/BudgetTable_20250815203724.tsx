import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Eye, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { apiService } from '../lib/api';

interface BudgetTableProps {
  type: 'overview' | 'products' | 'regions' | 'monthly';
  searchTerm: string;
  period: string;
}

interface BudgetData {
  id: number | string;
  [key: string]: any; // Allow for dynamic properties based on type
}

const BudgetTable: React.FC<BudgetTableProps> = ({ type, searchTerm, period }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [data, setData] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [type, period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data based on type
      const response = await apiService.getBudgets({ type, period });
      if (response.error) {
        throw new Error(response.error);
      }
      setData(response.data || []);
    } catch (err: any) {
      console.error('Error fetching budget data:', err);
      setError(err.message || 'Failed to fetch budget data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields = Object.values(item).join(' ').toLowerCase();
      return searchableFields.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Inactive': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.Inactive}`}>
        {status}
      </span>
    );
  };

  const getVarianceIndicator = (variance: number) => {
    if (variance > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (variance < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const renderTableHeaders = () => {
    switch (type) {
      case 'overview':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'products':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'regions':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'monthly':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-4 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-4 text-center text-red-600">
            Error: {error}
          </td>
        </tr>
      );
    }

    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
            No data available
          </td>
        </tr>
      );
    }

    return filteredData.map((item: any) => (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {type === 'overview' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.actual)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.progress >= 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(item.progress, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs">{item.progress}%</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        {type === 'products' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.actual)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.region}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        {type === 'regions' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.region}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.actual)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.manager}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.products}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        {type === 'monthly' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.budget)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.actual > 0 ? formatCurrency(item.actual) : '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {item.variance !== 0 ? (
                <div className="flex items-center space-x-1">
                  {getVarianceIndicator(item.variance)}
                  <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(item.variance))}
                  </span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
          </>
        )}
        
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-900 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="text-green-600 hover:text-green-900 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="text-red-600 hover:text-red-900 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {renderTableHeaders()}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderTableRows()}
          </tbody>
        </table>
      </div>
      
      {filteredData.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No data found</div>
          <div className="text-gray-400 text-sm">Try adjusting your search criteria</div>
        </div>
      )}
    </div>
  );
};

export default BudgetTable;
