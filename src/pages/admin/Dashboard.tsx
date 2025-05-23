import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  DollarSign,
  Package,
  Users,
  Truck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    activeDeliveries: 0,
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      // Fetch total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

      // Fetch pending orders
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      // Fetch total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'delivered');
      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

      // Fetch total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Fetch total customers
      const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Fetch active deliveries
      const { count: activeDeliveries } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('status', 'out_for_delivery');

      setStats({
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        activeDeliveries: activeDeliveries || 0,
      });
    };

    fetchStats();
  }, []);

  const cards: DashboardCard[] = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-pink-500',
    },
    {
      title: 'Active Deliveries',
      value: stats.activeDeliveries,
      icon: <Truck className="w-6 h-6" />,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-4">
          <Link
            to="/admin/products"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  {card.icon}
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm mb-2">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
          {/* Add recent orders table here */}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Analytics</h2>
          {/* Add sales chart here */}
        </div>
      </div>
    </div>
  );
}