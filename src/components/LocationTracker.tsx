import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { supabase } from '../lib/supabase';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = 'CnmF9yUm0Mp7YvFuAHjX';

interface Location {
  lat: number;
  lng: number;
}

interface LocationTrackerProps {
  orderId: string;
  deliveryLocation: Location;
}

export default function LocationTracker({ orderId, deliveryLocation }: LocationTrackerProps) {
  const [agentLocation, setAgentLocation] = React.useState<Location | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const deliveryMarker = useRef<maplibregl.Marker | null>(null);
  const agentMarker = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
      center: [deliveryLocation.lng, deliveryLocation.lat],
      zoom: 13
    });

    // Add delivery location marker
    deliveryMarker.current = new maplibregl.Marker({ color: '#ef4444' })
      .setLngLat([deliveryLocation.lng, deliveryLocation.lat])
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [deliveryLocation]);

  useEffect(() => {
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
          if (payload.new.delivery_agent_location) {
            setAgentLocation(payload.new.delivery_agent_location as Location);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    const fetchInitialLocation = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('delivery_agent_location')
        .eq('id', orderId)
        .single();

      if (!error && data.delivery_agent_location) {
        setAgentLocation(data.delivery_agent_location);
      }
      setIsLoading(false);
    };

    fetchInitialLocation();
  }, [orderId]);

  useEffect(() => {
    if (!map.current || !agentLocation) return;

    if (agentMarker.current) {
      agentMarker.current.setLngLat([agentLocation.lng, agentLocation.lat]);
    } else {
      agentMarker.current = new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat([agentLocation.lng, agentLocation.lat])
        .addTo(map.current);
    }

    map.current.flyTo({
      center: [agentLocation.lng, agentLocation.lat],
      zoom: 14,
      duration: 2000
    });
  }, [agentLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Live Tracking
        </h3>
      </div>
      <div ref={mapContainer} className="h-[400px]" />
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Delivery Agent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Delivery Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
