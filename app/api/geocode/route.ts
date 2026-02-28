import { NextRequest, NextResponse } from 'next/server';

// City coordinate database
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'new york': { lat: 40.7128, lng: -74.006 },
  'new york city': { lat: 40.7128, lng: -74.006 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  houston: { lat: 29.7604, lng: -95.3698 },
  phoenix: { lat: 33.4484, lng: -112.074 },
  philadelphia: { lat: 39.9526, lng: -75.1652 },
  san antonio: { lat: 29.4241, lng: -98.4936 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  dallas: { lat: 32.7767, lng: -96.797 },
  'san jose': { lat: 37.3382, lng: -121.8863 },
  austin: { lat: 30.2672, lng: -97.7431 },
  jacksonville: { lat: 30.3322, lng: -81.6557 },
  'fort worth': { lat: 32.7555, lng: -97.3308 },
  columbus: { lat: 39.9612, lng: -82.9988 },
  charlotte: { lat: 35.2271, lng: -80.8431 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  indianapolis: { lat: 39.7684, lng: -86.1581 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  denver: { lat: 39.7392, lng: -104.9903 },
  boston: { lat: 42.3601, lng: -71.0589 },
  miami: { lat: 25.7617, lng: -80.1918 },
  portland: { lat: 45.5152, lng: -122.6784 },
  atlanta: { lat: 33.749, lng: -84.388 },
  las vegas: { lat: 36.1699, lng: -115.1398 },
  detroit: { lat: 42.3314, lng: -83.0458 },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter required' },
        { status: 400 }
      );
    }

    // Look up city coordinates
    const key = city.toLowerCase();
    const coordinates = CITY_COORDINATES[key];

    if (!coordinates) {
      // Try partial match
      for (const [cityKey, coords] of Object.entries(CITY_COORDINATES)) {
        if (cityKey.includes(key) || key.includes(cityKey)) {
          return NextResponse.json(coords);
        }
      }

      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(coordinates);
  } catch (error) {
    console.error('[v0] Geocode API error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode city' },
      { status: 500 }
    );
  }
}
