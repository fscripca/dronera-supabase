import CheckoutPage from './pages/CheckoutPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import TechnologyPage from './pages/TechnologyPage';
import TokenPage from './pages/TokenPage';
import DashboardPage from './pages/DashboardPage';
import InvestmentsPage from './pages/InvestmentsPage';
import WalletPage from './pages/WalletPage';
import GovernancePage from './pages/GovernancePage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import HelpSupportPage from './pages/HelpSupportPage';
import InvestorPortalPage from './pages/InvestorPortalPage';
import TeamPage from './pages/TeamPage';
import TermsPage from './pages/TermsPage';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import CompliancePage from './pages/CompliancePage';
import LegalDocumentsPage from './pages/LegalDocumentsPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductPage from './pages/ProductPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AdminWhitelistPage from './pages/AdminWhitelistPage';
import AdminTokenManagementPage from './pages/AdminTokenManagementPage';
import AdminGovernanceManagementPage from './pages/AdminGovernanceManagementPage';
import AdminProfitSharingPage from './pages/AdminProfitSharingPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminJVAgreementPage from './pages/AdminJVAgreementPage';
import AdminDocumentsPage from './pages/AdminDocumentsPage';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import MyProfitsPage from './pages/MyProfitsPage';
import { supabase } from './lib/supabase';

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Try to get the current session to test the connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          setErrorMessage(error.message);
          return;
        }
        
        console.log('Supabase connection successful!', data);
        setConnectionStatus('success');
      } catch (err) {
        console.error('Unexpected error connecting to Supabase:', err);
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkSupabaseConnection();
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        {/* Supabase Connection Status Indicator (only visible during development) */}
        {process.env.NODE_ENV === 'development' && (
          <div 
            style={{ 
              position: 'fixed', 
              bottom: '20px', 
              right: '20px', 
              zIndex: 9999,
              padding: '10px 15px',
              borderRadius: '4px',
              backgroundColor: connectionStatus === 'success' ? 'rgba(0, 200, 0, 0.8)' : 
                              connectionStatus === 'error' ? 'rgba(255, 0, 0, 0.8)' : 
                              'rgba(255, 165, 0, 0.8)',
              color: 'white',
              fontSize: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            {connectionStatus === 'checking' && 'Checking Supabase connection...'}
            {connectionStatus === 'success' && 'Supabase connected successfully!'}
            {connectionStatus === 'error' && `Supabase connection error: ${errorMessage}`}
          </div>
        )}

        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/technology" element={<TechnologyPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/token" element={<TokenPage />} />
              <Route path="/investor-portal" element={<InvestorPortalPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/legal-documents" element={<LegalDocumentsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

            </Route>

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/profits" element={<MyProfitsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpSupportPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUserManagementPage />} />
              <Route path="jv-agreement" element={<AdminJVAgreementPage />} />
              <Route path="whitelist" element={<AdminWhitelistPage />} />
              <Route path="tokens" element={<AdminTokenManagementPage />} />
              <Route path="governance" element={<AdminGovernanceManagementPage />} />
              <Route path="documents" element={<AdminDocumentsPage />} />
              <Route path="profit-sharing" element={<AdminProfitSharingPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;