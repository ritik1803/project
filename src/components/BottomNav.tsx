import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Heart, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40"
    >
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center ${
            isActive('/') ? 'text-blue-500' : 'text-gray-600'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/wishlist"
          className={`flex flex-col items-center relative ${
            isActive('/wishlist') ? 'text-blue-500' : 'text-gray-600'
          }`}
        >
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">Wishlist</span>
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </Link>
        <Link
          to="/cart"
          className={`flex flex-col items-center relative ${
            isActive('/cart') ? 'text-blue-500' : 'text-gray-600'
          }`}
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xs mt-1">Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center ${
            isActive('/profile') ? 'text-blue-500' : 'text-gray-600'
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </motion.div>
  );
}