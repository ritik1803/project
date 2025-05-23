import { supabase } from './supabase';

// Test API Keys - Replace with your Razorpay test keys
const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_ID';
const RAZORPAY_KEY_SECRET = 'YOUR_KEY_SECRET';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (
  amount: number,
  orderId: string,
  userEmail: string,
  userName: string,
  onSuccess: (payment_id: string) => void
) => {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    name: 'FoodMart',
    description: `Order #${orderId}`,
    order_id: orderId,
    handler: async (response: any) => {
      // Handle successful payment
      const { razorpay_payment_id } = response;
      
      // Update order status in database
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'processing',
          payment_id: razorpay_payment_id 
        })
        .eq('id', orderId);

      if (!error) {
        onSuccess(razorpay_payment_id);
      }
    },
    prefill: {
      email: userEmail,
      name: userName,
    },
    theme: {
      color: '#3B82F6',
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};