import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface OrderItem {
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  payment_method: string;
  order_items: OrderItem[];
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.getOrders();
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-6">Your order history will appear here</p>
        <Link
          to="/"
          className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium"
        >
          Start Shopping
          <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Order placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Order #{order.id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-4">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-medium text-gray-800">
                      ₹{item.quantity * item.price}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium capitalize">{order.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-800">₹{order.total}</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/order/${order.id}`}
                    className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Track Order
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}