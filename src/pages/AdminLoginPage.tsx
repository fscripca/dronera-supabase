import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Key, AlertCircle } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAdminAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First check credentials
      if (email === 'admin@dronera.eu' && password === 'Admin123@!!') {
        setShowTwoFactor(true);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password, twoFactorCode);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stealth">
      <div className="max-w-md w-full">
        <HudPanel className="p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-plasma mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">DRONERA Admin Portal</h1>
            <p className="text-gray-400">Secure Administrative Access</p>
          </div>

          {!showTwoFactor ? (
            <form onSubmit={handleInitialLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Administrator Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="admin@dronera.eu"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <CyberButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isLoading ? 'Verifying...' : 'Continue to 2FA'}
              </CyberButton>
            </form>
          ) : (
            <form onSubmit={handleTwoFactorLogin} className="space-y-6">
              <div className="text-center mb-6">
                <Key className="w-12 h-12 text-plasma mx-auto mb-2" />
                <h2 className="text-xl font-bold mb-2">Two-Factor Authentication</h2>
                <p className="text-gray-400 text-sm">Enter the 6-digit code from your authenticator app</p>
              </div>

              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Authentication Code
                </label>
                <input
                  type="text"
                  id="twoFactorCode"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma text-center text-2xl tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Demo code: 123456</p>
              </div>

              {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <CyberButton
                  type="button"
                  onClick={() => setShowTwoFactor(false)}
                  variant="red"
                  className="flex-1"
                >
                  Back
                </CyberButton>
                <CyberButton
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || twoFactorCode.length !== 6}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isLoading ? 'Verifying...' : 'Access Admin'}
                </CyberButton>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="text-center text-xs text-gray-500">
              <p>Secure Administrative Portal</p>
              <p>All actions are logged and monitored</p>
            </div>
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

export default AdminLoginPage;