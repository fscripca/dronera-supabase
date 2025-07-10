import { useState, useCallback } from 'react';
import { kycService } from '../kycService';
import { KYCSubmissionData, KYCVerificationResult } from '../kycService';
import { useAuth } from '../../contexts/AuthContext';

interface UseKYCReturn {
  isLoading: boolean;
  error: string | null;
  startKYC: (data: KYCSubmissionData) => Promise<KYCVerificationResult>;
  checkKYCStatus: (email: string, sessionId: string) => Promise<any>;
  clearError: () => void;
}

export const useKYC = (): UseKYCReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startKYC = useCallback(async (data: KYCSubmissionData): Promise<KYCVerificationResult> => {
    if (!user?.id) {
      const errorResponse: KYCVerificationResult = {
        success: false,
        message: 'User not authenticated'
      };
      setError(errorResponse.message);
      return errorResponse;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ensure wallet address is included if available
      const kycData: KYCSubmissionData = {
        ...data,
        walletAddress: user.id
      };
      
      const response = await kycService.submitKYCData(kycData);

      if (!response.success) {
        setError(response.message);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkKYCStatus = useCallback(async (email: string, sessionId: string): Promise<any> => {
    if (!user?.id) {
      const errorResponse = {
        success: false,
        message: 'User not authenticated'
      };
      setError(errorResponse.message);
      return errorResponse;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await kycService.checkStatus(email, sessionId);

      if (response.status !== 'success') {
        setError(response.message || 'Failed to check KYC status');
        return {
          success: false,
          message: response.message || 'Failed to check KYC status'
        };
      }

      return {
        success: true,
        kycStatus: response.kycStatus,
        session: response.session
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    error,
    startKYC,
    checkKYCStatus,
    clearError
  };
};