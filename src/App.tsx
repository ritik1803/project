import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Category from './pages/Category';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  return isAuthenticated && user?.isAdmin ? children : <Navigate to="/" />;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AnimatePresence>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:category" element={<Category />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route
                        path="/cart"
                        element={
                          <PrivateRoute>
                            <Cart />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <PrivateRoute>
                            <Checkout />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <PrivateRoute>
                            <Orders />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/order/:orderId"
                        element={
                          <PrivateRoute>
                            <OrderTracking />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <PrivateRoute>
                            <Profile />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/wishlist"
                        element={
                          <PrivateRoute>
                            <Wishlist />
                          </PrivateRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <BottomNav />
                  <Toaster
                    position="bottom-center"
                    toastOptions={{
                      className: 'mb-16 md:mb-0',
                    }}
                  />
                </div>
              }
            />
          </Routes>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;