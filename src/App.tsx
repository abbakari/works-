import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, canAccessDashboard } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { BudgetProvider } from './contexts/BudgetContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { StockProvider } from './contexts/StockContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesBudget from './pages/SalesBudget';
import RollingForecast from './pages/RollingForecast';
import UserManagement from './pages/UserManagement';
import DataSources from './pages/DataSources';
import SupplyChainManagement from './pages/SupplyChainManagement';
import DistributionManagement from './pages/DistributionManagement';
import BiDashboard from './pages/BiDashboard';
import ApprovalCenter from './pages/ApprovalCenter';
import AdminPanel from './pages/AdminPanel';
import AdminInventoryDashboard from './pages/AdminInventoryDashboard';
import AdvancedAdminDashboard from './pages/AdvancedAdminDashboard';
import ApiTest from './pages/ApiTest';

// Mock Auth Wrapper for debugging API
const MockAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    const setupDemoAuth = async () => {
      try {
        // Create a demo user for API testing
        const demoUser = {
          id: '1',
          name: 'Demo User',
          email: 'demo@stmbudget.com',
          role: 'admin',
          department: 'IT',
          permissions: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        // Store demo user for frontend context
        localStorage.setItem('user', JSON.stringify(demoUser));

        // Try to authenticate with backend for real API access
        // If this fails, we'll still have the demo user for frontend
        try {
          console.log('Attempting demo authentication...');
          // For now, just set a demo token - in real scenario you'd get this from login
          localStorage.setItem('access_token', 'demo_jwt_token_for_testing');
          console.log('Demo authentication setup complete');
        } catch (authError) {
          console.warn('Could not authenticate with backend, using frontend-only mode:', authError);
        }

        setIsSetup(true);
      } catch (error) {
        console.error('Error setting up demo auth:', error);
        setIsSetup(true); // Continue anyway
      }
    };

    setupDemoAuth();
  }, []);

  if (!isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-700">Setting up API access...</div>
      </div>
    );
  }

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredDashboard?: string;
}> = ({ children, requiredDashboard }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredDashboard && !canAccessDashboard(user, requiredDashboard)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Role-based Route Component
const RoleBasedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-700">Loading STMBudget...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protected Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Salesman Routes */}
      <Route 
        path="/sales-budget" 
        element={
          <RoleBasedRoute allowedRoles={['salesman', 'manager', 'admin']}>
            <SalesBudget />
          </RoleBasedRoute>
        } 
      />

      <Route
        path="/rolling-forecast"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['salesman', 'manager', 'admin']}>
              <RollingForecast />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route 
        path="/approval-center" 
        element={
          <RoleBasedRoute allowedRoles={['manager', 'admin']}>
            <ApprovalCenter />
          </RoleBasedRoute>
        } 
      />

      {/* Supply Chain Routes */}
      <Route
        path="/inventory-management"
        element={
          <RoleBasedRoute allowedRoles={['supply_chain', 'admin']}>
            <SupplyChainManagement />
          </RoleBasedRoute>
        }
      />

      <Route 
        path="/distribution-management" 
        element={
          <RoleBasedRoute allowedRoles={['supply_chain', 'admin']}>
            <DistributionManagement />
          </RoleBasedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/user-management" 
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <UserManagement />
          </RoleBasedRoute>
        } 
      />

      <Route
        path="/data-sources"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <DataSources />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin-panel"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin-inventory"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminInventoryDashboard />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/advanced-admin"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdvancedAdminDashboard />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/bi-dashboard"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <BiDashboard />
          </RoleBasedRoute>
        }
      />

      {/* Development Routes */}
      <Route
        path="/api-test"
        element={
          <ProtectedRoute>
            <ApiTest />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BudgetProvider>
          <WorkflowProvider>
            <StockProvider>
              <Router>
                <AppRoutes />
              </Router>
            </StockProvider>
          </WorkflowProvider>
        </BudgetProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
