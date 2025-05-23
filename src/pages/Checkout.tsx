import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { loadCashfreeScript, initializeCashfreePayment } from '../lib/cashfree';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = 'CnmF9yUm0Mp7YvFuAHjX';

const PAYMENT_METHODS = [
  { id: 'cashfree', name: 'Pay Online (Cashfree)', icon: '💳' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
];

const defaultCenter = { lng: 78.9629, lat: 20.5937 }; // Center of India

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useStore();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(user?.deliveryLocation || defaultCenter);
  const [address, setAddress] = useState(user?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    console.log('Checkout - User from useAuthStore:', user);
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Auth check - Session:', session, 'Error:', error);
        if (error || !session) {
          useAuthStore.getState().set({ user: null, isAuthenticated: false });
          toast.error('Please log in to proceed with checkout');
          navigate('/login', { replace: true });
        } else if (!isAuthenticated || !user || user.id !== session.user.id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, address, phone, delivery_location')
            .eq('id', session.user.id)
            .single();
          if (profileError) {
            console.error('Profile fetch error:', profileError);
          }
          useAuthStore.getState().set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.user_metadata?.name || '',
              address: profile?.address || '',
              phone: profile?.phone || '',
              deliveryLocation: profile?.delivery_location || null,
            },
            isAuthenticated: true,
          });
        }
      } catch (err) {
        console.error('Auth check error:', err);
        useAuthStore.getState().set({ user: null, isAuthenticated: false });
        navigate('/login', { replace: true });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, user, isAuthenticated]);

  useEffect(() => {
    if (cart.length === 0 && !isCheckingAuth) {
      navigate('/');
    }
  }, [cart, isCheckingAuth, navigate]);

  useEffect(() => {
    const loadCashfree = async () => {
      const loaded = await loadCashfreeScript();
      setCashfreeLoaded(loaded);
    };
    loadCashfree();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
      center: [deliveryLocation.lng, deliveryLocation.lat],
      zoom: address ? 14 : 4,
    });

    map.current.addControl(new maplibregl.NavigationControl());

    marker.current = new maplibregl.Marker({
      draggable: true,
      color: '#3b82f6',
      element: createCustomMarkerElement(),
    })
      .setLngLat([deliveryLocation.lng, deliveryLocation.lat])
      .addTo(map.current);

    map.current.setMaxBounds([
      [68.1, 6.5], // SW corner of India
      [97.4, 35.7], // NE corner of India
    ]);

    const updateAddress = (lngLat: { lng: number; lat: number }) => {
      setDeliveryLocation(lngLat);
      fetchAddressFromCoords(lngLat.lng, lngLat.lat);
    };

    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) updateAddress(lngLat);
    });

    map.current.on('click', (e) => {
      marker.current?.setLngLat(e.lngLat);
      updateAddress(e.lngLat);
    });

    return () => {
      map.current?.remove();
    };
  }, [deliveryLocation]);

  const createCustomMarkerElement = () => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = '<div class="marker-pin"></div><div class="marker-pulse"></div>';
    return el;
  };

  const fetchAddressFromCoords = async (lng: number, lat: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`
      );
      const data = await response.json();
      if (data.features?.length > 0) {
        const primaryAddress = data.features[0];
        setAddress(primaryAddress.place_name || '');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to fetch address details');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_KEY}`
      );
      const data = await response.json();
      if (data.features?.length > 0) {
        const firstResult = data.features[0];
        const [lng, lat] = firstResult.center;

        map.current?.flyTo({
          center: [lng, lat],
          zoom: 14,
        });

        marker.current?.setLngLat([lng, lat]);
        setDeliveryLocation({ lng, lat });
        setAddress(firstResult.place_name || '');
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Location search failed');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 14,
          });
          marker.current?.setLngLat([longitude, latitude]);
          setDeliveryLocation({ lng: longitude, lat: latitude });
          fetchAddressFromCoords(longitude, latitude);
        },
        (error) => {
          toast.error('Could not get your location');
          console.error(error);
        },
        { timeout: 10000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const createOrder = async (
    items: { product_id: number; quantity: number; price: number }[],
    total: number,
    method: string,
    address: string,
    location: { lng: number; lat: number }
  ) => {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('createOrder - User:', user, 'Error:', error);

    if (error || !user) {
      throw new Error('Authentication failed');
    }

    const { data, error: insertError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          items,
          total,
          payment_method: method,
          address,
          delivery_location: location,
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('handleSubmit - Session:', session, 'Session Error:', sessionError);
    if (sessionError || !session) {
      useAuthStore.getState().set({ user: null, isAuthenticated: false });
      toast.error('Session expired. Please log in again.');
      navigate('/login', { replace: true });
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Please log in to proceed with checkout');
      navigate('/login', { replace: true });
      return;
    }

    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!address.trim() || address.length < 10) {
      toast.error('Please enter a valid delivery address');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const order = await createOrder(orderItems, total, selectedMethod, address, deliveryLocation);

      if (selectedMethod === 'cashfree') {
        if (!cashfreeLoaded) {
          toast.error('Payment gateway is not loaded. Please try again.');
          setIsProcessing(false);
          return;
        }

        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        console.log('Cashfree - User:', authUser, 'Error:', userError);
        if (userError || !authUser) {
          toast.error('Please log in to continue');
          setIsProcessing(false);
          navigate('/login', { replace: true });
          return;
        }

        await initializeCashfreePayment({
          orderId: order.id,
          amount: total,
          customerName: authUser.user_metadata?.name || user.name || '',
          customerEmail: authUser.email || '',
          customerPhone: authUser.user_metadata?.phone || user.phone || '',
        });
      } else {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order/${order.id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCheckingAuth) {
    return <div className="max-w-2xl mx-auto p-4">Checking authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between py-2">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>₹{total}</span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Location</h2>

          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              />
              <button
                type="button"
                onClick={searchLocation}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-500"
                aria-label="Search location"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
              aria-label="Use current location"
              title="Use my current location"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          <div
            ref={mapContainer}
            className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 mb-4"
          />

          <div className="relative">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery address will auto-fill or enter manually"
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
              disabled={isLoadingAddress}
            />
            {isLoadingAddress && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Click on the map or drag the marker to set your exact delivery location
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="space-y-4">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="h-4 w-4 text-blue-500"
                  disabled={isProcessing}
                />
                <div className="ml-4 flex items-center">
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        <button
          type="submit"
          disabled={isProcessing || !isAuthenticated || !selectedMethod || !address.trim()}
          className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
            isProcessing || !isAuthenticated || !selectedMethod || !address.trim()
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Place Order'
          )}
        </button>
      </form>

      <style jsx global>{`
        .custom-marker {
          position: relative;
          width: 30px;
          height: 30px;
        }
        .marker-pin {
          width: 30px;
          height: 30px;
          background-color: #3b82f6;
          border-radius: 50% 50% 50% 0;
          position: absolute;
          transform: rotate(-45deg);
          left: 0;
          top: 0;
          margin: -15px 0 0 -15px;
        }
        .marker-pin::after {
          content: '';
          width: 24px;
          height: 24px;
          margin: 3px 0 0 3px;
          background-color: white;
          position: absolute;
          border-radius: 50%;
        }
        .marker-pulse {
          background: #3b82f6;
          border-radius: 50%;
          height: 14px;
          width: 14px;
          position: absolute;
          left: 8px;
          top: 8px;
          margin: 0;
          transform: rotateX(55deg);
          z-index: -2;
        }
        .marker-pulse::after {
          content: '';
          border-radius: 50%;
          height: 40px;
          width: 40px;
          position: absolute;
          margin: -13px 0 0 -13px;
          animation: pulsate 1s ease-out;
          animation-iteration-count: infinite;
          opacity: 0;
          box-shadow: 0 0 1px 2px #3b82f6;
          animation-delay: 1.1s;
        }
        @keyframes pulsate {
          0% {
            transform: scale(0.1, 0.1);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1.2, 1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}