import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Eye, MoreVertical, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { apiService } from '../lib/api';

interface ForecastTableProps {
  type: 'overview' | 'products' | 'customers' | 'scenarios';
  searchTerm: string;
  period: string;
  horizon: string;
}

interface ForecastData {
  id: number | string;
  [key: string]: any; // Allow for dynamic properties based on type
}

const ForecastTable: React.FC<ForecastTableProps> = ({ type, searchTerm, period, horizon }) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [type, period, horizon]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data based on type
      const response = await apiService.getForecasts({ type, period, horizon });
      if (response.error) {
        throw new Error(response.error);
      }
      setData(response.data || []);
    } catch (err: any) {
      console.error('Error fetching forecast data:', err);
      setError(err.message || 'Failed to fetch forecast data');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceBadge = (confidence: string) => {
    const confidenceClasses = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidenceClasses[confidence as keyof typeof confidenceClasses]}`}>
        {confidence}
      </span>
    );
  };

  const getRiskBadge = (risk: string) => {
    const riskClasses = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskClasses[risk as keyof typeof riskClasses]}`}>
        {risk}
      </span>
    );
  };

  const getVarianceIndicator = (variance: number) => {
    if (variance > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (variance < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600';
    if (accuracy >= 90) return 'text-blue-600';
    if (accuracy >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderTableHeaders = () => {
    switch (type) {
      case 'overview':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'products':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'customers':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        );
      case 'scenarios':
        return (
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
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
          <td colSpan={8} className="px-6 py-4 text-center">
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return filteredData.map((item: any) => (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {type === 'overview' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.current)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className={getAccuracyColor(item.accuracy)}>{item.accuracy}%</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{getConfidenceBadge(item.confidence)}</td>
          </>
        )}
        
        {type === 'products' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.current)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className={getAccuracyColor(item.accuracy)}>{item.accuracy}%</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.model}</td>
          </>
        )}
        
        {type === 'customers' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.customer}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.segment}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.current)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(Math.abs(item.variance))}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.probability}%</td>
            <td className="px-6 py-4 whitespace-nowrap">{getRiskBadge(item.risk)}</td>
          </>
        )}
        
        {type === 'scenarios' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.scenario}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.probability}%</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.forecast)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center space-x-1">
                {getVarianceIndicator(item.variance)}
                <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {item.variance !== 0 ? formatCurrency(Math.abs(item.variance)) : '-'}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.impact}</td>
            <td className="px-6 py-4 whitespace-nowrap">{getConfidenceBadge(item.confidence)}</td>
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
            <button className="text-orange-600 hover:text-orange-900 transition-colors">
              <AlertTriangle className="w-4 h-4" />
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
      
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No forecast data found</div>
          <div className="text-gray-400 text-sm">Try adjusting your search criteria or forecast parameters</div>
        </div>
      )}
    </div>
  );
};

export default ForecastTable;
