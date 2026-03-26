'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  mode?: 'view' | 'picker';
  onChange?: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Singleton loader
let loader: Loader | null = null;
if (typeof window !== 'undefined' && GOOGLE_MAPS_KEY) {
  loader = new Loader({
    apiKey: GOOGLE_MAPS_KEY,
    version: 'weekly',
    libraries: ['places'] 
  });
}

export default function GoogleMap({
  latitude,
  longitude,
  zoom = 15,
  mode = 'view',
  onChange,
  height = '400px',
  className = '',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const locateBtnRef = useRef<HTMLButtonElement>(null);
  
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDirectionsUrl = () => {
    if (latitude && longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }
    return '#';
  };

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!mapRef.current || !loader) return;

      try {
        await loader.load();
        if (!isMounted || !mapRef.current) return;

        // Determine initial center
        let initialLat = latitude || 20.5937;
        let initialLng = longitude || 78.9629;
        let finalZoom = latitude ? zoom : 5;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: finalZoom,
          disableDefaultUI: false, // Turn on basic UI to allow maps to show more info
          gestureHandling: mode === 'view' ? 'cooperative' : 'auto',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: {
             position: google.maps.ControlPosition.RIGHT_TOP
          },
          zoomControl: true,
          zoomControlOptions: {
             position: google.maps.ControlPosition.RIGHT_CENTER
          }
        });

        const marker = new google.maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map: map,
          draggable: mode === 'picker',
          animation: google.maps.Animation.DROP,
        });

        mapInstance.current = map;
        markerInstance.current = marker;

        // Geolocation for picker if no coords
        if (!latitude && !longitude && mode === 'picker' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(newPos);
            map.setZoom(15);
            marker.setPosition(newPos);
            if (onChange) onChange(newPos.lat, newPos.lng);
          });
        }

        // Search bar
        if (mode === 'picker' && searchInputRef.current) {
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInputRef.current);
          searchInputRef.current.style.display = 'flex';
          const input = searchInputRef.current.querySelector('input')!;
          const autocomplete = new google.maps.places.Autocomplete(input, {
             fields: ['geometry'],
             componentRestrictions: { country: 'in' }
          });
          autocomplete.addListener('place_changed', () => {
             const place = autocomplete.getPlace();
             if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                map.setCenter({ lat, lng });
                map.setZoom(17);
                marker.setPosition({ lat, lng });
                if (onChange) onChange(lat, lng);
             }
          });
        }

        // Locate Me
        if (mode === 'picker' && locateBtnRef.current) {
          map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locateBtnRef.current);
          locateBtnRef.current.style.display = 'flex';
          locateBtnRef.current.addEventListener('click', () => {
             if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition((pos) => {
                 const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                 map.setCenter(newPos);
                 map.setZoom(17);
                 marker.setPosition(newPos);
                 if (onChange) onChange(newPos.lat, newPos.lng);
               });
             }
          });
        }

        if (mode === 'picker' && onChange) {
          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) onChange(position.lat(), position.lng());
          });
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
               marker.setPosition(e.latLng);
               onChange(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoaded(true);
      } catch (e: any) {
        console.error('Fail:', e);
        if (isMounted) setError(`Error: ${e.message}`);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Sync Props
  useEffect(() => {
    if (isLoaded && markerInstance.current && mapInstance.current && latitude && longitude) {
      const pos = { lat: latitude, lng: longitude };
      markerInstance.current.setPosition(pos);
      if (mode === 'view') mapInstance.current.panTo(pos);
    }
  }, [latitude, longitude, isLoaded, mode]);

  if (error) return <div className="text-rose-500 p-4">{error}</div>;

  return (
    <div className={`relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl ${className}`} style={{ height }}>
      
      {/* Picker UI Components */}
      {mode === 'picker' && (
        <div 
          ref={searchInputRef} 
          style={{ display: 'none' }}
          className="mt-3 ml-3 flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 w-[calc(100vw-80px)] sm:w-[350px]"
        >
          <input type="text" placeholder="Search..." className="flex-1 py-3 px-4 text-sm font-bold focus:outline-none" />
          <button className="bg-blue-600 text-white px-4 py-3 font-bold text-[10px]">GO</button>
        </div>
      )}

      {mode === 'picker' && (
        <button
          ref={locateBtnRef}
          style={{ display: 'none' }}
          className="mb-10 mr-3 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
        </button>
      )}

      {/* View Mode Directions Button */}
      {mode === 'view' && isLoaded && (
        <a 
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900/90 hover:bg-black backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group no-underline"
        >
          <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">Get Directions</span>
        </a>
      )}

      <div ref={mapRef} className="w-full h-full" />
      
      {!isLoaded && <div className="absolute inset-0 bg-slate-50 flex items-center justify-center font-black animate-pulse text-slate-300">CALIBRATING...</div>}

      <style jsx global>{`
        .pac-container { z-index: 1000000000 !important; border-radius: 12px; margin-top: 8px; border: none; box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important; padding: 6px 0; }
        .pac-item { padding: 8px 16px; border: none; display: flex; align-items: center; cursor: pointer; }
        .pac-item:hover { background-color: #f1f5f9; }
        .pac-item-query { font-size: 14px; font-weight: 700; color: #0f172a; }
        @keyframes bounce-slow { From, To { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
