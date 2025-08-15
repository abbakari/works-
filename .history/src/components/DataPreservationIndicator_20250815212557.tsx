import React, { useState, useEffect } from 'react';
import { Shield, Database, CheckCircle, Info, Loader2 } from 'lucide-react';
import DataPersistenceManager from '../utils/dataPersistence';

interface DataPreservationIndicatorProps {
  itemsCount: number;
  dataType: 'budget' | 'forecast';
  compact?: boolean;
  user?: { name: string };
}

const DataPreservationIndicator: React.FC<DataPreservationIndicatorProps> = ({
  itemsCount,
  dataType,
  compact = false,
  user
}) => {
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [preservedCount, setPreservedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (dataType === 'budget') {
          const submittedData = await DataPersistenceManager.getSubmittedSalesBudgetData();
          const preservedData = await DataPersistenceManager.getOriginalSalesBudgetData();
          const filteredSubmitted = user 
            ? submittedData.filter(item => item.createdBy === user.name).length 
            : submittedData.length;
          const filteredPreserved = user 
            ? preservedData.filter(item => item.createdBy === user.name).length 
            : preservedData.length;
          setSubmittedCount(filteredSubmitted);
          setPreservedCount(filteredPreserved);
        } else {
          const submittedData = await DataPersistenceManager.getSubmittedRollingForecastData();
          const preservedData = await DataPersistenceManager.getOriginalRollingForecastData();
          const filteredSubmitted = user 
            ? submittedData.filter(item => item.createdBy === user.name).length 
            : submittedData.length;
          const filteredPreserved = user 
            ? preservedData.filter(item => item.createdBy === user.name).length 
            : preservedData.length;
          setSubmittedCount(filteredSubmitted);
          setPreservedCount(filteredPreserved);
        }
      } catch (error) {
        console.error('Error loading data preservation stats:', error);
        setSubmittedCount(0);
        setPreservedCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataType, user]);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <div className="text-sm text-blue-700">Loading data preservation stats...</div>
        </div>
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Why Data is Preserved:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Allows continued editing and refinement</li>
                  <li>• Maintains historical reference</li>
                  <li>• Enables reporting and analysis</li>
                  <li>• Provides backup for resubmission if needed</li>
                  <li>• Supports ongoing business operations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreservationIndicator;
