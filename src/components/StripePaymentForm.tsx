// src/components/StripePaymentForm.tsx
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import CyberButton from './CyberButton';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import stripePromise from '../lib/stripeClient';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

const StripePaymentFormContent: React.FC<StripePaymentFormProps> = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('https://utjgpehbaarrrhixebil.functions.supabase.co/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ amount }),
        });
        const data = await response.json();

        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError('Failed to initialize payment. Please try again.');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe is not ready. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        setPaymentSuccess(true);
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '16px',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#fa755a', iconColor: '#fa755a' },
    },
  };

  return paymentSuccess ? (
    <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4 text-center">
      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
      <h3 className="text-xl font-bold text-green-300 mb-2">Payment Successful!</h3>
      <p className="text-green-200">Your payment was processed successfully.</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#161620] p-3 rounded border border-gray-700">
        <CardElement options={cardElementOptions} />
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
        disabled={!stripe || !elements || isProcessing || !clientSecret}
      >
        {isProcessing ? 'Processing...' : `Pay €${amount.toLocaleString()}`}
      </CyberButton>
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="bg-[#0d0d14] p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Secure Payment</h3>
          <div className="flex items-center text-plasma">
            <Lock className="w-4 h-4 mr-1" />
            <span className="text-xs">Encrypted</span>
          </div>
        </div>
        <StripePaymentFormContent {...props} />
      </div>
    </Elements>
  );
};

export default StripePaymentForm;
