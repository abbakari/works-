#!/bin/bash

# Fix remaining utils imports across all files
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e "s|import DataPersistenceManager from '../utils/dataPersistence';|import { DataManager } from '../lib/helpers';|g" \
  -e "s|import { dataConnector } from '../utils/dataConnector';|import { dataConnector } from '../lib/helpers';|g" \
  -e "s|import { formatDateTimeForDisplay, getTimeAgo } from '../utils/timeUtils';|import { formatDateTimeForDisplay, getTimeAgo } from '../lib/helpers';|g" \
  -e "s|import { getCurrentYear } from '../utils/dynamicYearUtils';|import { getCurrentYear } from '../lib/helpers';|g" \
  -e "s|import { formatCurrency, getConfidenceColor } from '../utils/budgetCalculations';|import { formatCurrency, getConfidenceColor } from '../lib/helpers';|g" \
  -e "s|import { formatCurrency, formatPercentage, generateCustomerAnalytics } from '../utils/budgetCalculations';|import { formatCurrency, formatPercentage, generateCustomerAnalytics } from '../lib/helpers';|g" \
  -e "s|from '../utils/sampleGitData'|// removed sample git data|g" \
  -e "s|from '../utils/communicationDemo'|// removed communication demo|g" \
  -e "s|DataPersistenceManager|DataManager|g"

echo "Fixed imports across all TypeScript files"
