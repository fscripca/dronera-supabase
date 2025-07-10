import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Wallet, BarChart as ChartBar, Users, Settings, LogOut, ShieldPlus, Bell, HelpCircle, ExternalLink, Vote, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', primary: true },
    { path: '/investments', icon: ChartBar, label: 'Investments', primary: true },
    { path: '/wallet', icon: Wallet, label: 'Wallet', primary: true },
    { path: '/governance', icon: Vote, label: 'Governance', primary: true },
    { path: '/profits', icon: TrendingUp, label: 'My Profits', primary: true },
    { path: '/documents', icon: FileText, label: 'Documents', primary: true },
    { path: '/settings', icon: Settings, label: 'Settings', primary: false },
    { path: '/help', icon: HelpCircle, label: 'Help & Support', primary: false },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Overlay for mobile
  const overlayClasses = isOpen 
    ? 'fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden' 
    : 'hidden';

  // Sidebar classes
  const sidebarClasses = `fixed top-0 left-0 h-full w-64 bg-[#0a0a0f] border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } lg:translate-x-0 lg:static lg:z-0`;

  return (
    <>
      {/* Mobile overlay */}
      <div className={overlayClasses} onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldPlus className="w-8 h-8 text-plasma" />
              <span className="text-xl font-bold text-white dronera-logo">
                DRONE<span className="text-plasma dronera-one">RA</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-plasma rounded-full flex items-center justify-center">
                <span className="text-[#0a0a0f] font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-white truncate max-w-[160px]">{user?.email}</p>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  <p className="text-xs text-gray-400">Active Investor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">MAIN NAVIGATION</p>
              <nav className="space-y-1">
                {menuItems.filter(item => item.primary).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]'
                        : 'text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)]'
                    }`}
                    onClick={onClose}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-plasma' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="px-4 mt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">OTHER</p>
              <nav className="space-y-1">
                {menuItems.filter(item => !item.primary).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]'
                        : 'text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)]'
                    }`}
                    onClick={onClose}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-plasma' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-4 border-t border-gray-800">
            <div className="bg-[rgba(13,13,20,0.7)] backdrop-blur-sm p-3 rounded-lg border border-gray-800 hover:border-plasma transition-colors duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-sm font-medium">New Updates</span>
                </div>
                <span className="bg-plasma text-[#0a0a0f] text-xs font-bold px-2 py-1 rounded-full">2</span>
              </div>
              <p className="text-xs text-gray-400">Check the latest platform updates and announcements</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[rgba(255,0,51,0.1)] text-red-400 rounded-lg hover:bg-red-900 hover:bg-opacity-30 transition-all duration-300 border border-transparent hover:border-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            
            <div className="mt-4 text-center">
              <a 
                href="https://dronera.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-plasma flex items-center justify-center transition-colors duration-200"
              >
                <span>DRONERA.com</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;