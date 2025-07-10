import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Activity,
  Database,
  AlertTriangle,
  FileText,
  Vote
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import CyberButton from './CyberButton';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, signOut } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: Activity, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/jv-agreement', icon: FileText, label: 'JV Agreement' },
    { path: '/admin/whitelist', icon: Shield, label: 'Whitelist Control' },
    { path: '/admin/tokens', icon: DollarSign, label: 'Token Management' },
    { path: '/admin/governance', icon: Vote, label: 'Governance' },
    { path: '/admin/documents', icon: FileText, label: 'Documents' },
    { path: '/admin/profit-sharing', icon: TrendingUp, label: 'Profit Sharing' },
    { path: '/admin/audit-logs', icon: Database, label: 'Audit Logs' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-stealth flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0f] border-r border-gray-800 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-plasma" />
            <span className="text-xl font-bold text-white">
              DRONE<span className="text-plasma">RA</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-plasma rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#0a0a0f]" />
            </div>
            <div>
              <p className="font-medium text-white">{adminUser?.email}</p>
              <p className="text-xs text-gray-400 uppercase">{adminUser?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-opacity-20 text-plasma border-l-2 border-plasma' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-800">
          <CyberButton
            onClick={handleSignOut}
            variant="red"
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </CyberButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-[#0a0a0f] border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Admin Portal</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;