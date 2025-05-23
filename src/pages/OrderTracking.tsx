import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LocationTracker from '../components/LocationTracker';
import { Package, Clock, MapPin, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { id: 'pending', label: 'Order Confirmed', icon: CheckCircle },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { id: 'delivered', label: 'Delivered', icon: Clock },
];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        setOrder(data);
        setCurrentStep(steps.findIndex(step => step.id === data.status));
      }
    };

    fetchOrder();

    // Subscribe to order status changes
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new);
          setCurrentStep(steps.findIndex(step => step.id === payload.new.status));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-8"
      >
        Track Order #{orderId}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <div className="relative">
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center relative z-10 ${
                    isActive ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              );
            })}
          </div>
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </motion.div>

      {order.delivery_location && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <LocationTracker
            orderId={orderId}
            deliveryLocation={order.delivery_location}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="space-y-4">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}