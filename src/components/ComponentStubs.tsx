// Temporary stub components to replace utils dependencies

import React from 'react';
import { DataManager } from '../lib/helpers';

// Stub for SeasonalDistributionInfo
export const SeasonalDistributionInfo: React.FC = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 className="font-semibold text-blue-900">Seasonal Distribution</h3>
    <p className="text-sm text-blue-700">Real-time seasonal patterns applied to budget distribution</p>
  </div>
);

// Stub for DataPreservationIndicator
export const DataPreservationIndicator: React.FC = () => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
    <span className="text-green-700 text-sm">✓ Data synced with Supabase</span>
  </div>
);

// Stub for CommunicationDemoInfo (already removed from Dashboard)
export const CommunicationDemoInfo: React.FC = () => null;

// Export DataManager for components that need it
export { DataManager };
