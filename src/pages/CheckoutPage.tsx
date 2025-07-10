// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const InnerCheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // ✅ CALL SUPABASE FUNCTION DIRECTLY (NOT /api)
    fetch('https://utjgpehbaarrrhixebil.functions.supabase.co/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 75000 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setStatus('❌ Failed to get clientSecret');
        }
      })
      .catch((err) => setStatus(`❌ ${err.message}`));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setStatus('Processing...');

    const card = elements.getElement(CardElement);
    if (!card) {
      setStatus('❌ Card element not found');
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      setStatus(`❌ ${result.error.message}`);
    } else if (result.paymentIntent?.status === 'succeeded') {
      setStatus('✅ Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <CardElement className="p-4 border rounded" />
      <button type="submit" disabled={!stripe} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Pay €750
      </button>
      <p className="mt-2">{status}</p>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <InnerCheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;
