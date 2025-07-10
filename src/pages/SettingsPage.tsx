import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Menu,
  X,
  Globe,
  Clock
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: 'maestru',
    lastName: '',
    country: '',
    phone: '',
    language: 'English',
    timezone: 'London (GMT)'
  });
  
  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  
  // Notifications form state
  const [notificationsForm, setNotificationsForm] = useState({
    emailNotifications: true,
    investmentAlerts: true,
    distributionAlerts: true,
    marketingEmails: false
  });
  
  // Privacy form state
  const [privacyForm, setPrivacyForm] = useState({
    dataSharing: false,
    activityTracking: true,
    showProfileToOthers: false
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Validate passwords
      if (securityForm.newPassword !== securityForm.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      // Reset form and success message
      setSecurityForm({
        ...securityForm,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to save security settings:', error);
      setSaveError(error.message || 'Failed to save security settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setSaveError('Failed to save notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      setSaveError('Failed to save privacy settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stealth flex">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-[#0a0a0f] border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Account Settings</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                <p className="text-gray-400">Manage your profile, security, and preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <HudPanel className="p-4">
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === 'profile' 
                          ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]' 
                          : 'text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)]'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === 'security' 
                          ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]' 
                          : 'text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)]'
                      }`}
                    >
                      <Lock className="w-5 h-5" />
                      <span>Security</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === 'notifications' 
                          ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]' 
                          : 'text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)]'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('privacy')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === 'privacy' 
                          ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]' 
                          : 'text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)]'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Privacy</span>
                    </button>
                  </div>
                </HudPanel>

                <HudPanel className="p-4 mt-6">
                  <h3 className="font-bold mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-green-400">Verified</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">2FA</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                        <span className="text-xs text-yellow-400">Disabled</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Account Type</span>
                      <span className="text-xs text-plasma">Investor</span>
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

                  {/* Profile Settings */}
                  {activeTab === 'profile' && (
                    <form onSubmit={handleSaveProfile}>
                      <h2 className="text-xl font-bold mb-6 flex items-center">
                        <User className="text-plasma mr-3 w-6 h-6" />
                        Profile Settings
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={user?.email || 'maestru@investor.com'}
                            readOnly
                            className="w-full bg-[#0d0d14] border border-gray-700 text-gray-400 px-3 py-2 rounded-md"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                            className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-2">
                            Timezone
                          </label>
                          <select
                            id="timezone"
                            value={profileForm.timezone}
                            onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                            className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                          >
                            <option value="London (GMT)">London (GMT)</option>
                            <option value="New York (EST)">New York (EST)</option>
                            <option value="Los Angeles (PST)">Los Angeles (PST)</option>
                            <option value="Tokyo (JST)">Tokyo (JST)</option>
                            <option value="Sydney (AEST)">Sydney (AEST)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Language
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, language: 'English' })}
                            className={`px-4 py-2 rounded-md transition-colors ${
                              profileForm.language === 'English'
                                ? 'bg-plasma text-[#0a0a0f]'
                                : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                            }`}
                          >
                            English
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, language: 'Français' })}
                            className={`px-4 py-2 rounded-md transition-colors ${
                              profileForm.language === 'Français'
                                ? 'bg-plasma text-[#0a0a0f]'
                                : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                            }`}
                          >
                            Français
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, language: 'Deutsch' })}
                            className={`px-4 py-2 rounded-md transition-colors ${
                              profileForm.language === 'Deutsch'
                                ? 'bg-plasma text-[#0a0a0f]'
                                : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                            }`}
                          >
                            Deutsch
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <CyberButton type="submit" disabled={isSaving}>
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save Profile Settings'}
                        </CyberButton>
                      </div>
                    </form>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <form onSubmit={handleSaveSecurity}>
                      <h2 className="text-xl font-bold mb-6 flex items-center">
                        <Lock className="text-plasma mr-3 w-6 h-6" />
                        Security Settings
                      </h2>
                      
                      <div className="space-y-6 mb-6">
                        <div>
                          <h3 className="font-bold text-plasma mb-4">Change Password</h3>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                id="currentPassword"
                                value={securityForm.currentPassword}
                                onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                                placeholder="Enter current password"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                id="newPassword"
                                value={securityForm.newPassword}
                                onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                                placeholder="Enter new password"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                id="confirmPassword"
                                value={securityForm.confirmPassword}
                                onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-800">
                          <h3 className="font-bold text-plasma mb-4">Two-Factor Authentication</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Enhance your account security</p>
                              <p className="text-sm text-gray-400">Protect your account with 2FA authentication</p>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-3 text-sm text-gray-300">
                                {securityForm.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={securityForm.twoFactorEnabled}
                                  onChange={() => setSecurityForm({ ...securityForm, twoFactorEnabled: !securityForm.twoFactorEnabled })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <CyberButton type="submit" disabled={isSaving}>
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save Security Settings'}
                        </CyberButton>
                      </div>
                    </form>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <form onSubmit={handleSaveNotifications}>
                      <h2 className="text-xl font-bold mb-6 flex items-center">
                        <Bell className="text-plasma mr-3 w-6 h-6" />
                        Notification Settings
                      </h2>
                      
                      <div className="space-y-6 mb-6">
                        <div>
                          <h3 className="font-bold text-plasma mb-4">Email Notifications</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-400">Receive important updates via email</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={notificationsForm.emailNotifications}
                                  onChange={() => setNotificationsForm({ ...notificationsForm, emailNotifications: !notificationsForm.emailNotifications })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Investment Alerts</p>
                                <p className="text-sm text-gray-400">Notifications about your investments</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={notificationsForm.investmentAlerts}
                                  onChange={() => setNotificationsForm({ ...notificationsForm, investmentAlerts: !notificationsForm.investmentAlerts })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Distribution Alerts</p>
                                <p className="text-sm text-gray-400">Notifications about profit distributions</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={notificationsForm.distributionAlerts}
                                  onChange={() => setNotificationsForm({ ...notificationsForm, distributionAlerts: !notificationsForm.distributionAlerts })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Marketing Emails</p>
                                <p className="text-sm text-gray-400">Receive promotional content and offers</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={notificationsForm.marketingEmails}
                                  onChange={() => setNotificationsForm({ ...notificationsForm, marketingEmails: !notificationsForm.marketingEmails })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <CyberButton type="submit" disabled={isSaving}>
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save Notification Settings'}
                        </CyberButton>
                      </div>
                    </form>
                  )}

                  {/* Privacy Settings */}
                  {activeTab === 'privacy' && (
                    <form onSubmit={handleSavePrivacy}>
                      <h2 className="text-xl font-bold mb-6 flex items-center">
                        <Shield className="text-plasma mr-3 w-6 h-6" />
                        Privacy Settings
                      </h2>
                      
                      <div className="space-y-6 mb-6">
                        <div>
                          <h3 className="font-bold text-plasma mb-4">Data Sharing & Privacy</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Data Sharing with Partners</p>
                                <p className="text-sm text-gray-400">Allow sharing your data with trusted partners</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={privacyForm.dataSharing}
                                  onChange={() => setPrivacyForm({ ...privacyForm, dataSharing: !privacyForm.dataSharing })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Activity Tracking</p>
                                <p className="text-sm text-gray-400">Allow tracking your activity for better service</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={privacyForm.activityTracking}
                                  onChange={() => setPrivacyForm({ ...privacyForm, activityTracking: !privacyForm.activityTracking })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Profile Visibility</p>
                                <p className="text-sm text-gray-400">Allow other investors to see your profile</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={privacyForm.showProfileToOthers}
                                  onChange={() => setPrivacyForm({ ...privacyForm, showProfileToOthers: !privacyForm.showProfileToOthers })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plasma"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-800">
                          <h3 className="font-bold text-plasma mb-4">Data Management</h3>
                          <div className="space-y-4">
                            <div className="bg-[#0d0d14] p-4 rounded-lg">
                              <p className="font-medium mb-2">Download Your Data</p>
                              <p className="text-sm text-gray-400 mb-3">Download a copy of all your personal data</p>
                              <CyberButton className="text-xs py-1 px-3">
                                Request Data Export
                              </CyberButton>
                            </div>
                            
                            <div className="bg-[#0d0d14] p-4 rounded-lg">
                              <p className="font-medium mb-2 text-red-400">Delete Account</p>
                              <p className="text-sm text-gray-400 mb-3">Permanently delete your account and all data</p>
                              <CyberButton variant="red" className="text-xs py-1 px-3">
                                Request Account Deletion
                              </CyberButton>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <CyberButton type="submit" disabled={isSaving}>
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                        </CyberButton>
                      </div>
                    </form>
                  )}
                </HudPanel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;