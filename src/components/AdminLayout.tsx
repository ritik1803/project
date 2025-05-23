import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          className="w-70 bg-white shadow-lg fixed h-screen border-r border-gray-100"
        >
          <div className="flex flex-col h-full">
            <div className="p-6">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">Admin</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 pb-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`admin-nav-item ${isActive(item.href) ? 'active' : ''}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:text-red-600 
                         hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 ml-70">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}