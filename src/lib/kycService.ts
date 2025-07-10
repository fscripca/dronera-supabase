import { supabase } from './supabase';

export interface KYCSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  country: string;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber: string;
  phoneNumber?: string;
  walletAddress?: string;
}

export interface KYCVerificationResult {
  success: boolean;
  message: string;
  sessionId?: string;
  verificationUrl?: string;
  status?: 'pending' | 'approved' | 'declined' | 'not_started';
  riskScore?: number;
}

class KYCService {
  private static instance: KYCService;

  private constructor() {}

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  /**
   * Submit KYC data for verification
   * @param data KYC submission data
   * @returns Promise with verification result
   */
  public async submitKYCData(data: KYCSubmissionData): Promise<KYCVerificationResult> {
    try {
      // Call the KYC API endpoint
      const { data: response, error } = await supabase.functions.invoke('kyc-api', {
        body: {
          ...data,
          action: 'submit'
        },
        method: 'POST',
        path: 'submit'
      });

      if (error) {
        console.error('KYC submission error:', error);
        return {
          success: false,
          message: error.message || 'Failed to submit KYC data'
        };
      }

      return {
        success: true,
        message: 'KYC data submitted successfully',
        sessionId: response.sessionId,
        verificationUrl: response.verificationUrl,
        status: response.status || 'pending'
      };
    } catch (error) {
      console.error('KYC submission error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Check KYC verification status
   * @param email User email
   * @param sessionId Optional session ID
   * @returns Promise with verification status
   */
  public async checkStatus(email: string, sessionId?: string): Promise<any> {
    try {
      const { data: response, error } = await supabase.functions.invoke('kyc-api', {
        body: {
          email,
          sessionId
        },
        method: 'POST',
        path: 'status'
      });

      if (error) {
        console.error('KYC status check error:', error);
        return {
          status: 'error',
          message: error.message || 'Failed to check KYC status'
        };
      }

      return response;
    } catch (error) {
      console.error('KYC status check error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Update KYC verification status
   * @param sessionId Session ID
   * @param status New status
   * @param verificationData Optional verification data
   * @returns Promise with update result
   */
  public async updateStatus(sessionId: string, status: 'pending' | 'approved' | 'declined', verificationData?: any): Promise<any> {
    try {
      const { data: response, error } = await supabase.functions.invoke('kyc-api', {
        body: {
          sessionId,
          status,
          verificationData
        },
        method: 'POST',
        path: 'update'
      });

      if (error) {
        console.error('KYC status update error:', error);
        return {
          status: 'error',
          message: error.message || 'Failed to update KYC status'
        };
      }

      return response;
    } catch (error) {
      console.error('KYC status update error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}

export const kycService = KYCService.getInstance();