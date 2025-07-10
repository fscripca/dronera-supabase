import React, { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import CyberButton from './CyberButton';
import HudPanel from './HudPanel';
import { contractService } from '../lib/contractService';

interface ContractUploaderProps {
  contractId: string;
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: any) => void;
}

const ContractUploader: React.FC<ContractUploaderProps> = ({
  contractId,
  onUploadSuccess,
  onUploadError
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const metadata = {
        uploadedBy: 'user',
        originalFileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        uploadTimestamp: new Date().toISOString()
      };

      const result = await contractService.uploadContractDocument(
        contractId,
        selectedFile,
        metadata
      );

      setUploadSuccess(true);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      console.error('Error uploading contract document:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
      
      // Call error callback if provided
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <HudPanel className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Upload Contract Document</h3>
          {uploadSuccess && (
            <div className="flex items-center text-green-400">
              <CheckCircle className="w-5 h-5 mr-1" />
              <span>Upload Successful</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-300">{uploadError}</p>
              </div>
              <button
                onClick={() => setUploadError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* File Selection */}
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
          <input
            type="file"
            id="contract-file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileText className="w-12 h-12 text-plasma" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                </p>
              </div>
              <div className="flex space-x-3">
                <CyberButton
                  onClick={resetUpload}
                  variant="red"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </CyberButton>
                <CyberButton
                  onClick={handleUpload}
                  className="flex-1"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </CyberButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-500" />
              </div>
              <p className="text-gray-400">
                Drag and drop your contract document here, or click to browse
              </p>
              <CyberButton
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Document
              </CyberButton>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT • Max size: 10MB
              </p>
            </div>
          )}
        </div>
      </div>
    </HudPanel>
  );
};

export default ContractUploader;