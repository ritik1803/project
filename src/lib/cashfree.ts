import { supabase } from './supabase';

const CASHFREE_APP_ID = 'TEST1045619069bf5977be888f86f72e09165401';
const CASHFREE_SECRET_KEY = 'cfsk_ma_test_3b7c260346b92d6169447d17bb5d29da_ea2da705';
const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg';

interface PaymentOptions {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export const initializeCashfreePayment = async ({
  orderId,
  amount,
  currency = 'INR',
  customerName,
  customerEmail,
  customerPhone,
}: PaymentOptions) => {
  try {
    // Create order with Cashfree
    const response = await fetch(`${CASHFREE_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2022-09-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: orderId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `${window.location.origin}/payment/callback?order_id={order_id}`,
          notify_url: `${window.location.origin}/api/payment/webhook`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment order');
    }

    // Update order status in database
    await supabase
      .from('orders')
      .update({ payment_status: 'initiated' })
      .eq('id', orderId);

    // Initialize Cashfree SDK
    const cashfree = new window.Cashfree({
      mode: 'sandbox',
    });

    await cashfree.init({
      orderToken: data.order_token,
      onSuccess: async (result: any) => {
        // Verify payment
        const verification = await verifyCashfreePayment(orderId, result.transaction_id);
        
        if (verification.payment_status === 'SUCCESS') {
          // Update order status in database
          await supabase
            .from('orders')
            .update({
              payment_id: result.transaction_id,
              payment_status: 'success',
              status: 'processing',
            })
            .eq('id', orderId);

          window.location.href = `/orders/${orderId}`;
        } else {
          throw new Error('Payment verification failed');
        }
      },
      onFailure: async (result: any) => {
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
          })
          .eq('id', orderId);

        window.location.href = `/orders/${orderId}?status=failed`;
      },
      onDismiss: () => {
        window.location.href = `/orders/${orderId}?status=cancelled`;
      },
    });

    cashfree.redirect();
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
};

export const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src*="cashfree"]')) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const verifyCashfreePayment = async (orderId: string, transactionId: string) => {
  try {
    const response = await fetch(`${CASHFREE_API_URL}/orders/${orderId}/payments/${transactionId}`, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify payment');
    }

    return data;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
};