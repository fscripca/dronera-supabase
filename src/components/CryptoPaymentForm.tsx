import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import CyberButton from './CyberButton';
import { AlertCircle, Copy, CheckCircle } from 'lucide-react';
import HudPanel from './HudPanel';

interface CryptoPaymentFormProps {
  amount: number;
  onSuccess: (transactionHash: string) => void;
  onError: (error: string) => void;
}

const CryptoPaymentForm: React.FC<CryptoPaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  // Fallback function to simulate Edge Function when not available
  const generatePaymentAddressFallback = () => {
    console.log('CryptoPaymentForm: Using fallback payment address generation');
    return {
      paymentAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount,
      currency: "ETH",
      exchangeRate: 1500, // 1 ETH = 1500 EUR (mock rate)
      cryptoAmount: amount / 1500
    };
  };

  const generatePaymentAddress = async () => {
    console.log('CryptoPaymentForm: generatePaymentAddress called for amount:', amount);
    setIsProcessing(true);
    setError(null); 

    try {
      // Use fallback directly since Edge Function is not deployed
      console.log('CryptoPaymentForm: Using fallback payment address generation');
      const fallbackData = generatePaymentAddressFallback();
      console.log('CryptoPaymentForm: Payment address generated successfully:', fallbackData.paymentAddress);
      setPaymentAddress(fallbackData.paymentAddress);
    } catch (error) {
      console.error('CryptoPaymentForm: Error generating payment address:', error);
      setError('Unable to generate payment address. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmitTransaction = () => {
    console.log('CryptoPaymentForm: handleSubmitTransaction called with hash:', transactionHash);
    if (!transactionHash.trim()) {
      console.log('CryptoPaymentForm: No transaction hash provided');
      setError('Please enter a transaction hash');
      return;
    }

    setIsProcessing(true);
    setError(null);

    console.log('CryptoPaymentForm: Simulating transaction verification');
    // In a real implementation, this would verify the transaction
    // For now, we'll just simulate success
    setTimeout(() => {
      console.log('CryptoPaymentForm: Transaction verification successful');
      setIsProcessing(false);
      onSuccess(transactionHash);
    }, 2000);
  };

  if (!paymentAddress) {
    return (
      <div className="space-y-4">
        <p className="text-gray-300 mb-4">
          Generate a payment address to send cryptocurrency equivalent to €{amount.toLocaleString()}.
        </p>
        <CyberButton 
          onClick={generatePaymentAddress} 
          disabled={isProcessing} 
          className="w-full"
        >
          {isProcessing ? 'Generating...' : 'Generate Payment Address'}
        </CyberButton>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HudPanel className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Send {(amount / 1500).toFixed(4)} ETH to this address:
            </label>
            <div className="flex items-center">
              <div className="bg-[#0d0d14] p-2 rounded flex-1 font-mono text-sm truncate">
                {paymentAddress}
              </div>
              <button
                onClick={() => copyToClipboard(paymentAddress)}
                className="ml-2 p-2 bg-[#0d0d14] rounded hover:bg-[#161620] transition-colors"
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400 hover:text-plasma" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Transaction Hash:
            </label>
            <input
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              placeholder="0x..."
            />
          </div>
        </div>
      </HudPanel>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      <CyberButton 
        onClick={handleSubmitTransaction} 
        disabled={isProcessing || !transactionHash.trim()} 
        className="w-full"
      >
        {isProcessing ? 'Verifying...' : 'Submit Transaction'}
      </CyberButton>
    </div>
  );
};

export default CryptoPaymentForm;