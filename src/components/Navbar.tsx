import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, User, Heart, Search, Menu, X, Home, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  const handleAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setShowMobileMenu(false);
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-gray-600 hover:text-gray-800"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
                FoodMart
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              >
                <Search className="h-6 w-6" />
              </button>

              {isAuthenticated ? (
                <>
                  <Link to="/wishlist" className="text-gray-600 hover:text-gray-800 relative">
                    <Heart className="h-6 w-6" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" className="text-gray-600 hover:text-gray-800 relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                  <div className="hidden md:block relative group">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                      <User className="h-6 w-6" />
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                      <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Orders</Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <button
                    onClick={() => handleAuth('login')}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleAuth('signup')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden"
            >
              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden bg-white border-t"
            >
              <div className="px-4 py-6 space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-4 pb-4 border-b">
                      <User className="h-8 w-8 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      <Package className="h-5 w-5" />
                      Orders
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAuth('login')}
                      className="w-full bg-white text-blue-500 border border-blue-500 py-2 rounded-lg hover:bg-blue-50"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleAuth('signup')}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link
                    to="/category/grocery"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Grocery
                  </Link>
                  <Link
                    to="/category/food"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Package
                    Food
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-16" /> {/* Spacer for fixed navbar */}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}