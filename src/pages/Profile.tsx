import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = 'CnmF9yUm0Mp7YvFuAHjX';
const defaultCenter = { lng: 78.9629, lat: 20.5937 }; // Center of India

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [deliveryLocation, setDeliveryLocation] = useState(defaultCenter);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: 4,
    });

    map.current.addControl(new maplibregl.NavigationControl());

    marker.current = new maplibregl.Marker({
      draggable: true,
      color: '#3b82f6',
      element: createCustomMarkerElement(),
    })
      .setLngLat([defaultCenter.lng, defaultCenter.lat])
      .addTo(map.current);

    map.current.setMaxBounds([
      [68.1, 6.5], // SW corner of India
      [97.4, 35.7], // NE corner of India
    ]);

    const updateAddress = (lngLat) => {
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
  }, []);

  const createCustomMarkerElement = () => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = '<div class="marker-pin"></div><div class="marker-pulse"></div>';
    return el;
  };

  const fetchAddressFromCoords = async (lng, lat) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name, address, phone, deliveryLocation });
    toast.success('Profile updated successfully!');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Delivery Address
            </label>
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
                </button>
              </div>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                aria-label="Use current location"
                title="Use my current location"
              >
              </button>
            </div>

            <div
              ref={mapContainer}
              className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 mb-4"
            />

            <div className="relative">
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address will auto-fill or enter manually"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                rows={3}
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
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update Profile
          </button>
        </form>
      </div>

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
          content: "";
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