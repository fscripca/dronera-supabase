// Shared KYC types for frontend and backend
export interface KYCUser {
  id: string;
  walletAddress?: string;
  email: string;
  kycStatus: 'pending' | 'approved' | 'declined' | 'not_started';
  sessionId?: string;
  verificationUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  dateOfBirth?: string;
  documentType?: string;
  documentNumber?: string;
  phoneNumber?: string;
  riskScore?: number;
}

export interface KYCVerificationData {
  documentType?: string;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  verificationScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface KYCStatusColors {
  pending: 'yellow';
  approved: 'green';
  declined: 'red';
  not_started: 'gray';
}

export const KYC_STATUS_COLORS: KYCStatusColors = {
  pending: 'yellow',
  approved: 'green',
  declined: 'red',
  not_started: 'gray'
};

export const KYC_STATUS_LABELS = {
  pending: 'Verification in Progress',
  approved: 'Verified',
  declined: 'Verification Failed',
  'not_started': 'Not Started',
};

export const KYC_STATUS_DESCRIPTIONS = {
  pending: 'Your identity verification is being processed. This usually takes 24-48 hours.',
  approved: 'Your identity has been successfully verified. You can now access all platform features.',
  declined: 'Your identity verification was unsuccessful. Please contact support for assistance.',
  'not_started': 'Complete identity verification to access investment features.',
};

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