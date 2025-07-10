import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, AlertCircle, X, CheckCircle } from 'lucide-react';
import CyberButton from './CyberButton';
import HudPanel from './HudPanel';
import { contractService } from '../lib/contractService';
import { useAuth } from '../contexts/AuthContext';

interface ContractViewerProps {
  contractId: string;
  title?: string;
  agreementType?: string;
  onViewError?: (error: any) => void;
}

const ContractViewer: React.FC<ContractViewerProps> = ({
  contractId,
  title = 'Contract Document',
  agreementType = 'agreement',
  onViewError
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    if (!user?.id) {
      setViewError('You must be logged in to download this document');
      return;
    }

    setIsLoading(true);
    setViewError(null);
    setDownloadSuccess(false);

    try {
      const result = await contractService.downloadContractDocument(contractId, user.id);
      
      if (result.signedUrl) {
        setDownloadUrl(result.signedUrl);
        setDownloadSuccess(true);
        
        // Automatically open the document in a new tab
        window.open(result.signedUrl, '_blank');
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setDownloadSuccess(false);
        }, 3000);
      } else {
        throw new Error('Failed to generate download URL');
      }
    } catch (error) {
      console.error('Error downloading contract document:', error);
      setViewError(error instanceof Error ? error.message : 'Failed to download document');
      
      // Call error callback if provided
      if (onViewError) {
        onViewError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear download URL after 60 seconds (matching the signed URL expiry)
  useEffect(() => {
    if (downloadUrl) {
      const timer = setTimeout(() => {
        setDownloadUrl(null);
      }, 60000);
      
      return () => clearTimeout(timer);
    }
  }, [downloadUrl]);

  return (
    <HudPanel className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          {downloadSuccess && (
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-5 h-5 mr-1" />
              <span>Download Started</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {viewError && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-300">{viewError}</p>
              </div>
              <button
                onClick={() => setViewError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Document Preview */}
        <div className="bg-[#0d0d14] p-6 rounded-lg text-center">
          <FileText className="w-16 h-16 text-plasma mx-auto mb-4" />
          <h4 className="font-bold mb-2">{title}</h4>
          <p className="text-sm text-gray-400 mb-4">
            {agreementType.charAt(0).toUpperCase() + agreementType.slice(1)} document
          </p>
          
          <div className="flex space-x-3 justify-center">
            <CyberButton
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'View Document'}
            </CyberButton>
            
            <CyberButton
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'Download'}
            </CyberButton>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          This document contains important legal information. Please review it carefully.
        </p>
      </div>
    </HudPanel>
  );
};

export default ContractViewer;