import React, { useState } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import HudPanel from './HudPanel';
import CryptoPaymentForm from './CryptoPaymentForm';
import StripePaymentForm from './StripePaymentForm';
import { supabase } from '../lib/supabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
  paymentMethod: 'card' | 'crypto';
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentSuccess,
  paymentMethod = 'crypto'
}) => {
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingInvestment, setIsProcessingInvestment] = useState(false);

  if (!isOpen) return null;

  const handlePaymentSuccess = async (paymentId: string) => {
    console.log('PaymentModal: Payment success with ID:', paymentId);
    setIsProcessingInvestment(true);
    setPaymentError(null); 

    try {
      // Calculate token amount (1 EUR = 2/3 DRONE token)
      const tokenAmount = Math.floor(amount / 1.5);
      console.log('PaymentModal: Calculated token amount:', tokenAmount, 'for EUR amount:', amount);

      // Call Supabase function to update user investment
      console.log('PaymentModal: Calling update_user_investment RPC');
      const { data, error } = await supabase.rpc('update_user_investment', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_amount: amount,
        p_token_amount: tokenAmount
      });
      console.log('PaymentModal: RPC response:', { data, error });

      if (error) {
        console.error('PaymentModal: RPC error:', error);
        throw new Error(error.message || 'Failed to update investment');
      }

      // Record the payment in wallet_transactions
      console.log('PaymentModal: Recording transaction in wallet_transactions');
      await supabase.from('wallet_transactions').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id, 
        type: 'deposit',
        amount: amount,
        token_type: 'EUR',
        status: 'completed',
        description: `Investment payment via crypto`,
        transaction_hash: paymentId
      });

      console.log('PaymentModal: Investment process completed successfully');
      onPaymentSuccess();
    } catch (error) {
      console.error('Investment processing error:', error);
      console.error('PaymentModal: Detailed error:', error instanceof Error ? error.stack : error);
      setPaymentError(error instanceof Error ? error.message : 'Failed to process investment');
    } finally {
      setIsProcessingInvestment(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.log('PaymentModal: Payment error:', error);
    setPaymentError(error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <HudPanel className="max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Complete Your Investment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Investment Amount:</span>
            <span className="font-bold">€{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-400">DRONE Tokens:</span>
            <span className="font-bold text-plasma">{Math.floor(amount / 1.5).toLocaleString()}</span>
          </div>
          <div className="h-px bg-gray-800 my-4"></div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <CyberButton 
              className={`flex-1 ${paymentMethod === 'crypto' ? '' : 'opacity-70'}`}
              onClick={() => setPaymentMethod('crypto')}
            >
              Cryptocurrency
            </CyberButton>
          </div>
          {paymentMethod === 'crypto' ? (
            <CryptoPaymentForm
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <StripePaymentForm
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>

        {paymentError && (
          <div className="mt-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-300">{paymentError}</p>
            </div>
          </div>
        )}

        {isProcessingInvestment && (
          <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin text-blue-400" />
              <p className="text-sm text-blue-300">Processing your investment...</p>
            </div>
          </div>
        )}
      </HudPanel>
    </div>
  );
};

export default PaymentModal;