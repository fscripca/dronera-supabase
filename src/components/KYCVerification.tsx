import React, { useState } from 'react';
import { FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import HudPanel from './HudPanel';
import CyberButton from './CyberButton';

interface KYCVerificationProps {
  onStatusChange?: (status: 'pending' | 'approved' | 'declined' | 'not_started') => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ onStatusChange }) => {
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'declined' | 'not_started'>('approved');

  // Simulate KYC verification is always approved
  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange('approved');
    }
  }, [onStatusChange]);

  const getStatusIcon = () => {
    return <CheckCircle className="w-8 h-8 text-green-400" />;
  };

  const getStatusColor = () => {
    return 'green';
  };

  const getStatusLabel = () => {
    return 'Verified';
  };

  const getStatusDescription = () => {
    return 'Your identity has been successfully verified. You can now access all platform features.';
  };

  return (
    <HudPanel className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-bold">Identity Verification</h3>
              <p className="text-sm font-medium text-green-400">
                {getStatusLabel()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Description */}
        <div className="p-4 rounded-lg border bg-green-900 bg-opacity-30 border-green-500">
          <p className="text-sm text-gray-300">{getStatusDescription()}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Verification Complete</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              You can now access all platform features and make investments.
            </p>
          </div>
        </div>
      </div>
    </HudPanel>
  );
};

export default KYCVerification;