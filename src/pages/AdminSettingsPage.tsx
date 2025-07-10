import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Mail, 
  Key, 
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Database,
  Globe,
  Clock,
  X
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';

interface SystemSettings {
  security: {
    twoFactorRequired: boolean;
    passwordExpiration: number; // days
    sessionTimeout: number; // minutes
    loginAttempts: number;
    ipWhitelist: string[];
  };
  notifications: {
    emailAlerts: boolean;
    kycNotifications: boolean;
    securityAlerts: boolean;
    distributionAlerts: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
  };
  api: {
    rateLimit: number;
    webhookUrl: string;
    apiKeys: {
      key: string;
      name: string;
      created: string;
      lastUsed: string;
    }[];
  };
  maintenance: {
    maintenanceMode: boolean;
    scheduledMaintenance: string | null;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    lastBackup: string | null;
  };
}

const AdminSettingsPage: React.FC = () => {
  const { adminUser, logAdminAction } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'email' | 'api' | 'maintenance'>('security');
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<SystemSettings>({
    security: {
      twoFactorRequired: true,
      passwordExpiration: 90,
      sessionTimeout: 30,
      loginAttempts: 5,
      ipWhitelist: []
    },
    notifications: {
      emailAlerts: true,
      kycNotifications: true,
      securityAlerts: true,
      distributionAlerts: true
    },
    email: {
      fromName: 'DRONERA Admin',
      fromEmail: 'admin@dronera.eu',
      replyTo: 'support@dronera.eu',
      smtpServer: 'smtp.dronera.eu',
      smtpPort: 587,
      smtpUsername: 'smtp@dronera.eu',
      smtpPassword: '••••••••••••'
    },
    api: {
      rateLimit: 100,
      webhookUrl: 'https://api.dronera.eu/webhooks/admin',
      apiKeys: [
        {
          key: 'drn_api_••••••••••••••••••••••••••••••',
          name: 'Production API Key',
          created: '2025-01-01T00:00:00Z',
          lastUsed: '2025-01-27T14:30:00Z'
        }
      ]
    },
    maintenance: {
      maintenanceMode: false,
      scheduledMaintenance: null,
      backupFrequency: 'daily',
      lastBackup: '2025-01-27T02:00:00Z'
    }
  });

  // New IP address for whitelist
  const [newIpAddress, setNewIpAddress] = useState('');
  
  // New API key form
  const [newApiKeyName, setNewApiKeyName] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from Supabase
      // For now, using the default settings defined above
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('VIEW_SETTINGS', 'Viewed system settings');
      }
      
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // In production, this would save to Supabase
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('UPDATE_SETTINGS', `Updated ${activeTab} settings`);
      }
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveError('Failed to save settings. Please try again.');
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const addIpToWhitelist = () => {
    if (!newIpAddress) return;
    
    // Simple IP validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(newIpAddress)) {
      setSaveError('Invalid IP address format');
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ipWhitelist: [...prev.security.ipWhitelist, newIpAddress]
      }
    }));
    
    setNewIpAddress('');
  };

  const removeIpFromWhitelist = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ipWhitelist: prev.security.ipWhitelist.filter(item => item !== ip)
      }
    }));
  };

  const generateApiKey = async () => {
    if (!newApiKeyName) return;
    
    try {
      // In production, this would generate a secure API key
      const mockApiKey = 'drn_api_' + Array(32).fill(0).map(() => 
        Math.random().toString(36).charAt(2)).join('');
      
      const newKey = {
        key: mockApiKey,
        name: newApiKeyName,
        created: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
      
      setSettings(prev => ({
        ...prev,
        api: {
          ...prev.api,
          apiKeys: [...prev.api.apiKeys, newKey]
        }
      }));
      
      setNewApiKeyName('');
      setShowApiKey(true);
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('GENERATE_API_KEY', `Generated new API key: ${newApiKeyName}`);
      }
      
    } catch (error) {
      console.error('Failed to generate API key:', error);
      setSaveError('Failed to generate API key');
    }
  };

  const deleteApiKey = async (keyToDelete: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      setSettings(prev => ({
        ...prev,
        api: {
          ...prev.api,
          apiKeys: prev.api.apiKeys.filter(key => key.key !== keyToDelete)
        }
      }));
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('DELETE_API_KEY', 'Deleted API key');
      }
      
    } catch (error) {
      console.error('Failed to delete API key:', error);
      setSaveError('Failed to delete API key');
    }
  };

  const scheduleBackup = async () => {
    try {
      // In production, this would schedule a backup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => ({
        ...prev,
        maintenance: {
          ...prev.maintenance,
          lastBackup: new Date().toISOString()
        }
      }));
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('SCHEDULE_BACKUP', 'Scheduled manual database backup');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to schedule backup:', error);
      setSaveError('Failed to schedule backup');
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const newMode = !settings.maintenance.maintenanceMode;
      
      setSettings(prev => ({
        ...prev,
        maintenance: {
          ...prev.maintenance,
          maintenanceMode: newMode
        }
      }));
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction(
          newMode ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE',
          `${newMode ? 'Enabled' : 'Disabled'} system maintenance mode`
        );
      }
      
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
      setSaveError('Failed to toggle maintenance mode');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-400">Configure platform settings and preferences</p>
        </div>
        <div className="flex items-center space-x-4">
          <CyberButton onClick={loadSettings} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
        </div>
      </div>

      {/* Settings Tabs and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <HudPanel className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-plasma bg-opacity-20 text-plasma border-l-2 border-plasma' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-plasma bg-opacity-20 text-plasma border-l-2 border-plasma' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={() => setActiveTab('email')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'email' 
                    ? 'bg-plasma bg-opacity-20 text-plasma border-l-2 border-plasma' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span>Email Configuration</span>
              </button>
              
              <button
                onClick={() => setActiveTab('api')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'api' 
                    ? 'bg-plasma bg-opacity-20 text-plasma border-l-2 border-plasma' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>API Settings</span>
              </button>
              
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'maintenance' 
                    ? 'bg-plasma bg-opacity-20 text-plasma border-l-2 border-plasma' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Database className="w-5 h-5" />
                <span>Maintenance</span>
              </button>
            </div>
          </HudPanel>

          {/* System Status */}
          <HudPanel className="p-4 mt-6">
            <h3 className="font-bold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Maintenance Mode</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${settings.maintenance.maintenanceMode ? 'bg-yellow-400' : 'bg-green-400'} rounded-full mr-2`}></div>
                  <span className={`text-xs ${settings.maintenance.maintenanceMode ? 'text-yellow-400' : 'text-green-400'}`}>
                    {settings.maintenance.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </HudPanel>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <HudPanel className="p-6">
            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="mb-6 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-300">Settings saved successfully</p>
                </div>
              </div>
            )}
            
            {saveError && (
              <div className="mb-6 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{saveError}</p>
                  </div>
                  <button
                    onClick={() => setSaveError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Shield className="text-plasma mr-3 w-6 h-6" />
                  Security Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorRequired}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: {
                              ...prev.security,
                              twoFactorRequired: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                        />
                        <span>Require Two-Factor Authentication</span>
                      </label>
                      <p className="text-sm text-gray-400">
                        Enforce 2FA for all admin accounts
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password Expiration (days)
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordExpiration}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            passwordExpiration: parseInt(e.target.value) || 0
                          }
                        }))}
                        min="0"
                        max="365"
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            sessionTimeout: parseInt(e.target.value) || 0
                          }
                        }))}
                        min="5"
                        max="240"
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.security.loginAttempts}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            loginAttempts: parseInt(e.target.value) || 0
                          }
                        }))}
                        min="1"
                        max="10"
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      IP Whitelist
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newIpAddress}
                        onChange={(e) => setNewIpAddress(e.target.value)}
                        placeholder="Enter IP address"
                        className="flex-1 bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                      <CyberButton onClick={addIpToWhitelist} className="px-4">
                        Add
                      </CyberButton>
                    </div>
                    
                    <div className="bg-[#0d0d14] rounded-md border border-gray-700 p-2 max-h-40 overflow-y-auto">
                      {settings.security.ipWhitelist.length === 0 ? (
                        <p className="text-sm text-gray-400 p-2">No IP addresses whitelisted</p>
                      ) : (
                        <ul className="space-y-1">
                          {settings.security.ipWhitelist.map((ip, index) => (
                            <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                              <span className="font-mono text-sm">{ip}</span>
                              <button
                                onClick={() => removeIpFromWhitelist(ip)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Leave empty to allow all IP addresses
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <CyberButton onClick={saveSettings} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Security Settings'}
                  </CyberButton>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Bell className="text-plasma mr-3 w-6 h-6" />
                  Notification Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailAlerts}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              emailAlerts: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                        />
                        <span>Email Alerts</span>
                      </label>
                      <p className="text-sm text-gray-400">
                        Receive important system alerts via email
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.kycNotifications}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              kycNotifications: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                        />
                        <span>KYC Notifications</span>
                      </label>
                      <p className="text-sm text-gray-400">
                        Receive notifications for new KYC submissions
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.securityAlerts}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              securityAlerts: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                        />
                        <span>Security Alerts</span>
                      </label>
                      <p className="text-sm text-gray-400">
                        Receive notifications for security events
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.distributionAlerts}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              distributionAlerts: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-700 bg-[#0d0d14] text-plasma focus:ring-plasma"
                        />
                        <span>Distribution Alerts</span>
                      </label>
                      <p className="text-sm text-gray-400">
                        Receive notifications for profit distribution events
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#0d0d14] p-4 rounded-lg border border-gray-700">
                    <h3 className="font-medium mb-2">Notification Recipients</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Notifications will be sent to all admin users with appropriate permissions
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Mail className="w-4 h-4 text-plasma" />
                      <span>admin@dronera.eu</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <CyberButton onClick={saveSettings} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Notification Settings'}
                  </CyberButton>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Mail className="text-plasma mr-3 w-6 h-6" />
                  Email Configuration
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: {
                            ...prev.email,
                            fromName: e.target.value
                          }
                        }))}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: {
                            ...prev.email,
                            fromEmail: e.target.value
                          }
                        }))}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Reply-To Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.replyTo}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: {
                            ...prev.email,
                            replyTo: e.target.value
                          }
                        }))}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="font-medium mb-4">SMTP Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SMTP Server
                        </label>
                        <input
                          type="text"
                          value={settings.email.smtpServer}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            email: {
                              ...prev.email,
                              smtpServer: e.target.value
                            }
                          }))}
                          className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settings.email.smtpPort}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            email: {
                              ...prev.email,
                              smtpPort: parseInt(e.target.value) || 0
                            }
                          }))}
                          className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SMTP Username
                        </label>
                        <input
                          type="text"
                          value={settings.email.smtpUsername}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            email: {
                              ...prev.email,
                              smtpUsername: e.target.value
                            }
                          }))}
                          className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SMTP Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={settings.email.smtpPassword}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              email: {
                                ...prev.email,
                                smtpPassword: e.target.value
                              }
                            }))}
                            className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 pr-10 rounded-md focus:ring-plasma focus:border-plasma"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <CyberButton className="mr-4">
                      Test Email Configuration
                    </CyberButton>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <CyberButton onClick={saveSettings} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Email Settings'}
                  </CyberButton>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Globe className="text-plasma mr-3 w-6 h-6" />
                  API Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Rate Limit (requests per minute)
                      </label>
                      <input
                        type="number"
                        value={settings.api.rateLimit}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          api: {
                            ...prev.api,
                            rateLimit: parseInt(e.target.value) || 0
                          }
                        }))}
                        min="10"
                        max="1000"
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={settings.api.webhookUrl}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          api: {
                            ...prev.api,
                            webhookUrl: e.target.value
                          }
                        }))}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="font-medium mb-4">API Keys</h3>
                    
                    <div className="space-y-4">
                      {settings.api.apiKeys.map((key, index) => (
                        <div key={index} className="bg-[#0d0d14] p-4 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{key.name}</h4>
                              <div className="flex items-center mt-1">
                                <input
                                  type={showApiKey ? "text" : "password"}
                                  value={key.key}
                                  readOnly
                                  className="bg-[#161620] border-none text-sm font-mono text-gray-300 py-1 px-2 rounded"
                                />
                                <button
                                  type="button"
                                  className="ml-2 text-gray-400 hover:text-white"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                >
                                  {showApiKey ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteApiKey(key.key)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 grid grid-cols-2 gap-2">
                            <div>
                              <span className="block">Created:</span>
                              <span>{formatDate(key.created)}</span>
                            </div>
                            <div>
                              <span className="block">Last Used:</span>
                              <span>{formatDate(key.lastUsed)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Generate New API Key</h4>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newApiKeyName}
                            onChange={(e) => setNewApiKeyName(e.target.value)}
                            placeholder="API Key Name"
                            className="flex-1 bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                          />
                          <CyberButton 
                            onClick={generateApiKey} 
                            disabled={!newApiKeyName}
                            className="px-4"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Generate
                          </CyberButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <CyberButton onClick={saveSettings} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save API Settings'}
                  </CyberButton>
                </div>
              </div>
            )}

            {/* Maintenance Settings */}
            {activeTab === 'maintenance' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Database className="text-plasma mr-3 w-6 h-6" />
                  Maintenance Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-[#0d0d14] p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Maintenance Mode</h3>
                        <p className="text-sm text-gray-400">
                          When enabled, only admins can access the platform
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-3 text-sm text-gray-300">
                          {settings.maintenance.maintenanceMode ? 'Enabled' : 'Disabled'}
                        </span>
                        <CyberButton 
                          onClick={toggleMaintenanceMode}
                          variant={settings.maintenance.maintenanceMode ? 'red' : undefined}
                          className="text-xs py-1 px-3"
                        >
                          {settings.maintenance.maintenanceMode ? 'Disable' : 'Enable'}
                        </CyberButton>
                      </div>
                    </div>
                    
                    {settings.maintenance.maintenanceMode && (
                      <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded p-3">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-300">Maintenance Mode Active</p>
                            <p className="text-yellow-200">
                              The platform is currently in maintenance mode. Only administrators can access the system.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Scheduled Maintenance
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.maintenance.scheduledMaintenance?.slice(0, 16) || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance: {
                            ...prev.maintenance,
                            scheduledMaintenance: e.target.value ? new Date(e.target.value).toISOString() : null
                          }
                        }))}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Leave empty for no scheduled maintenance
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={settings.maintenance.backupFrequency}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance: {
                            ...prev.maintenance,
                            backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                          }
                        }))}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Database Backup</h3>
                        <p className="text-sm text-gray-400">
                          Last backup: {formatDate(settings.maintenance.lastBackup)}
                        </p>
                      </div>
                      <CyberButton onClick={scheduleBackup}>
                        <Database className="w-4 h-4 mr-2" />
                        Backup Now
                      </CyberButton>
                    </div>
                  </div>
                  
                  <div className="bg-[#0d0d14] p-4 rounded-lg border border-gray-700">
                    <h3 className="font-medium mb-2">System Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Version:</span>
                        <span className="ml-2">1.5.0</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Database:</span>
                        <span className="ml-2">PostgreSQL 15.3</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Environment:</span>
                        <span className="ml-2">Production</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Update:</span>
                        <span className="ml-2">2025-01-15</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <CyberButton onClick={saveSettings} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Maintenance Settings'}
                  </CyberButton>
                </div>
              </div>
            )}
          </HudPanel>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;