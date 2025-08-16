import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { ChevronRight, Eye, CheckCircle, Plus, ChevronUp, ChevronDown, Minus, X, List, UserPlus, Target, Send, Download as DownloadIcon, Package, Calendar, AlertTriangle } from 'lucide-react';
import { Customer } from '../types/forecast';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { rollingForecastService, RollingForecastItem as APIRollingForecastItem } from '../services/rollingForecastService';
import CustomerForecastModal from '../components/CustomerForecastModal';
import GitDetailsTooltip from '../components/GitDetailsTooltip';
import ViewOnlyMonthlyDistributionModal from '../components/ViewOnlyMonthlyDistributionModal';
import NewAdditionModal from '../components/NewAdditionModal';
import FollowBacksButton from '../components/FollowBacksButton';
import SalesmanStockManagement from '../components/SalesmanStockManagement';
import ManagerStockManagement from '../components/ManagerStockManagement';
import ManagerRollingForecastInterface from '../components/ManagerRollingForecastInterface';
import DataPreservationIndicator from '../components/DataPreservationIndicator';
import RollingForecastReport from '../components/RollingForecastReport';
import DataPersistenceManager, { SavedForecastData } from '../utils/dataPersistence';
import { initializeSampleGitData } from '../utils/sampleGitData';
import { applySeasonalDistribution, convertToMonthlyBudget } from '../utils/seasonalDistribution';
import SeasonalDistributionInfo from '../components/SeasonalDistributionInfo';
import {
  getCurrentMonth,
  getCurrentYear,
  getShortMonthNames,
  isFutureMonth,
  getFutureMonthsForYear,
  formatDateTimeForDisplay,
  getTimeAgo
} from '../utils/timeUtils';
import {
  generateAvailableYears,
  getDefaultYearSelection,
  getYearValue as getYearValueUtil,
  setYearValue,
  createSampleYearlyData,
  transformLegacyToYearly
} from '../utils/dynamicYearUtils';

const RollingForecast: React.FC = () => {
  const { user } = useAuth();
  const { yearlyBudgets, getBudgetsByCustomer, error: budgetError } = useBudget();
  const { submitForApproval } = useWorkflow();

  // Dynamic year handling using centralized utilities
  const availableYears = useMemo(() => generateAvailableYears(), []);
  const defaultYears = useMemo(() => getDefaultYearSelection(), []);
  const [selectedBaseYear, setSelectedBaseYear] = useState(defaultYears.baseYear);
  const [selectedTargetYear, setSelectedTargetYear] = useState(defaultYears.targetYear);

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [activeView, setActiveView] = useState<'customer-item' | 'item-wise'>('customer-item');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [monthlyForecastData, setMonthlyForecastData] = useState<{[key: string]: {[month: string]: number}}>({});
  const [isNewAdditionModalOpen, setIsNewAdditionModalOpen] = useState(false);
  const [newAdditionType, setNewAdditionType] = useState<'customer' | 'item'>('customer');
  const [isSelectTypeModalOpen, setIsSelectTypeModalOpen] = useState(false);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState<'existing' | 'new'>('existing');
  const [selectedItemOption, setSelectedItemOption] = useState<'existing'>('existing');
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    region: '',
    segment: ''
  });
  const [selectedExistingCustomer, setSelectedExistingCustomer] = useState('');
  const [selectedExistingItem, setSelectedExistingItem] = useState('');
  const [showBudgetData, setShowBudgetData] = useState(true);
  const [isCustomerForecastModalOpen, setIsCustomerForecastModalOpen] = useState(false);
  const [selectedCustomerForBreakdown, setSelectedCustomerForBreakdown] = useState<string>('');
  const [isViewOnlyModalOpen, setIsViewOnlyModalOpen] = useState(false);
  const [selectedRowForViewOnly, setSelectedRowForViewOnly] = useState<any>(null);
  const [isStockManagementModalOpen, setIsStockManagementModalOpen] = useState(false);
  const [showReportView, setShowReportView] = useState(false);
  const [isSeasonalGrowthModalOpen, setIsSeasonalGrowthModalOpen] = useState(false);

  // Use centralized helper function for year value access
  const getYearValue = useCallback((item: any, year: string, type: 'budget' | 'actual'): number => {
    return getYearValueUtil(item, year, type);
  }, []);

  // Sample data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Action Aid International (Tz)',
      code: 'AAI001',
      email: 'orders@actionaid.tz',
      phone: '+255-22-123-4567',
      region: 'Africa',
