import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  phone: string;
  lat: number;
  lng: number;
  type: string;
}

declare global {
  interface Window {
    L: any;
  }
}

const DEFAULT_LAT = 21.1458;
const DEFAULT_LNG = 79.0882;
const DEFAULT_CITY = 'Nagpur';

export default function HospitalFinder({
  severity,
  onHospitalSelect,
  onBack,
}: {
  severity?: string;
  onHospitalSelect: (hospital: Hospital) => void;
  onBack: () => void;
}) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
  }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, city: DEFAULT_CITY });
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Load Leaflet library
  useEffect(() => {
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        console.log('[v0] Leaflet loaded');
      };
      document.head.appendChild(script);
    }
  }, []);

  // Load hospitals for Nagpur on page load
  useEffect(() => {
    console.log('[v0] Loading hospitals for', DEFAULT_CITY);
    fetchHospitalsByLocation(DEFAULT_LAT, DEFAULT_LNG, DEFAULT_CITY);
  }, []);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchHospitalsByLocation = async (
    lat: number,
    lng: number,
    city: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, city }),
      });

      if (!response.ok) throw new Error('Failed to fetch hospitals');
      const data = await response.json();

      // Calculate distances
      const hospitalsToProcess = (data?.hospitals || []);
      const hospitalsWithDistance = hospitalsToProcess.map((h: any) => ({
        ...h,
        distance: calculateDistance(lat, lng, h?.lat || 0, h?.lng || 0),
      }));

      // Sort by distance (nearest first)
      hospitalsWithDistance.sort((a: any, b: any) => a.distance - b.distance);
      setHospitals(hospitalsWithDistance);
      setCurrentLocation({ lat, lng, city });

      // Initialize map when hospitals are loaded
      if (hospitalsWithDistance.length > 0) {
        setTimeout(() => {
          initializeMap(lat, lng, hospitalsWithDistance);
        }, 100);
      }
    } catch (error) {
      console.error('[v0] Error fetching hospitals:', error);
      setHospitals([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const initializeMap = (
    userLat: number,
    userLng: number,
    hospitalsData: Hospital[]
  ) => {
    if (!window.L || !mapContainerRef.current) return;

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Create map
    mapRef.current = window.L.map(mapContainerRef.current).setView(
      [userLat, userLng],
      14
    );

    // Add tile layer
    window.L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '© OpenStreetMap contributors',
        maxZoom: 19,
      }
    ).addTo(mapRef.current);

    // Add user location marker (blue pulsing)
    window.L.circleMarker([userLat, userLng], {
      radius: 8,
      fillColor: '#2563EB',
      fillOpacity: 1,
      color: '#fff',
      weight: 2,
    })
      .addTo(mapRef.current)
      .bindPopup('Your Location');

    // Add hospital markers (red)
    hospitalsData.forEach((hospital) => {
      window.L.marker([hospital.lat, hospital.lng], {
        title: hospital.name,
      })
        .addTo(mapRef.current)
        .bindPopup(
          `<strong>${hospital.name}</strong><br/>${hospital.type}<br/>${hospital.distance.toFixed(1)} km away`
        );
    });
  };

  const handleAreaSearch = async () => {
    if (!searchInput.trim()) return;

    setIsSearching(true);
    try {
      // Search for area within Nagpur using Nominatim
      const query = `${searchInput}+Nagpur`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'MediReach-App/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Area not found');
      const results = await response.json();

      if (!results || results.length === 0) {
        console.log('[v0] No area found for:', searchInput);
        setIsSearching(false);
        return;
      }

      const { lat, lon } = results[0];
      console.log('[v0] Nominatim coords for', searchInput, ':', lat, lon);
      
      const lat_num = parseFloat(lat);
      const lng_num = parseFloat(lon);
      fetchHospitalsByLocation(lat_num, lng_num, searchInput);
    } catch (error) {
      console.error('[v0] Error searching area:', error);
      setIsSearching(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <style>{`
            @keyframes pulse-animation {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .pulse-text {
              animation: pulse-animation 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `}</style>
          <div className="text-6xl">🔍</div>
          <p className="text-lg text-foreground font-sans pulse-text">
            Finding hospitals in {currentLocation.city}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onBack}
          className="text-primary hover:text-primary/80 transition-colors mb-2 font-sans text-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-foreground font-sans">
          Hospitals in {currentLocation.city}
        </h1>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 min-h-96 lg:min-h-screen rounded-lg overflow-hidden border border-border bg-muted">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Area Search Bar */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground font-sans">
              Search area in {currentLocation.city} (e.g. Dharampeth, Sitabuldi)
            </label>
            <div className="flex gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleAreaSearch()
                }
                placeholder="Enter area name..."
                className="flex-1 font-sans"
              />
              <Button
                onClick={handleAreaSearch}
                disabled={isSearching || !searchInput.trim()}
                className="px-4 font-sans"
              >
                {isSearching ? '...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Hospitals List */}
          {(hospitals || []).length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <p className="text-sm font-semibold text-foreground font-sans sticky top-0 bg-background pb-2">
                {(hospitals || []).length} hospitals found in {currentLocation.city}
              </p>
              {(hospitals || []).map((hospital) => (
                <button
                  key={hospital.id}
                  onClick={() => onHospitalSelect(hospital)}
                  className="w-full text-left bg-card p-3 rounded-lg border border-border hover:border-primary transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground font-sans pr-2 text-sm">
                      {hospital.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 font-sans line-clamp-1">
                    {hospital.address || 'Nagpur'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary font-sans">
                      {hospital.distance.toFixed(1)} km
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">
                      {hospital.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && (hospitals || []).length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-sans text-sm">
                No hospitals found in this area.
              </p>
            </div>
          )}

          {/* Back Button */}
          {(hospitals || []).length > 0 && (
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full font-sans mt-auto"
            >
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
