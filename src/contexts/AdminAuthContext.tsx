import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  lastActivity: Date;
  twoFactorEnabled: boolean;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateActivity: () => void;
  logAdminAction?: (action: string, details: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days
const ADMIN_EMAIL = 'admin@dronera.eu';
const ADMIN_PASSWORD = 'Admin123@!!';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const updateActivity = () => {
    if (adminUser) {
      setAdminUser(prev => prev ? { ...prev, lastActivity: new Date() } : null);
      
      // Reset session timer
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      
      const newTimer = setTimeout(() => {
        signOut();
      }, SESSION_TIMEOUT);
      
      setSessionTimer(newTimer);
    }
  };

  const signIn = async (email: string, password: string, twoFactorCode?: string) => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Invalid credentials');
    }

    // Simulate 2FA check (in production, this would verify against a real 2FA service)
    if (twoFactorCode && twoFactorCode !== '123456') {
      throw new Error('Invalid 2FA code');
    }

    const user: AdminUser = {
      id: 'admin-1',
      email: ADMIN_EMAIL,
      role: 'super_admin',
      lastActivity: new Date(),
      twoFactorEnabled: true
    };

    setAdminUser(user);
    localStorage.setItem('admin_session', JSON.stringify({
      user,
      timestamp: Date.now()
    }));

    // Log admin login
    await logAdminAction('LOGIN', 'Admin user logged in');
    
    updateActivity();
  };

  const signOut = async () => {
    if (adminUser) {
      await logAdminAction('LOGOUT', 'Admin user logged out');
    }
    
    setAdminUser(null);
    localStorage.removeItem('admin_session');
    
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
  };

  const refreshSession = async () => {
    const stored = localStorage.getItem('admin_session');
    if (stored) {
      const { user, timestamp } = JSON.parse(stored);
      const now = Date.now();
      
      // Session never expires unless manually logged out
      setAdminUser(user);
      updateActivity();
    }
    setLoading(false);
  };

  const logAdminAction = async (action: string, details: string) => {
    try {
      const clientIP = await getClientIP();
      
      await supabase.rpc('log_admin_audit_action', {
        p_admin_id: adminUser?.id || 'unknown',
        p_action: action,
        p_details: details,
        p_ip_address: clientIP,
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  // Activity tracking
  useEffect(() => {
    if (adminUser) {
      const handleActivity = () => updateActivity();
      
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('scroll', handleActivity);
      
      return () => {
        window.removeEventListener('mousedown', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('scroll', handleActivity);
      };
    }
  }, [adminUser]);

  return (
    <AdminAuthContext.Provider value={{
      adminUser,
      loading,
      signIn,
      signOut,
      refreshSession,
      updateActivity,
      logAdminAction
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};