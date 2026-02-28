import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, city } = await request.json();

    // Exact Overpass query as specified
    const query = `[out:json][timeout:25];
(
  node["amenity"="hospital"](around:10000,${lat},${lng});
  way["amenity"="hospital"](around:10000,${lat},${lng});
  node["amenity"="clinic"](around:10000,${lat},${lng});
  node["amenity"="doctors"](around:10000,${lat},${lng});
  node["healthcare"="hospital"](around:10000,${lat},${lng});
);
out center;`;

    console.log('[v0] Overpass query for', city, ':', lat, lng);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MediReach-App/1.0',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    // Parse results correctly - nodes use element.lat/element.lon, ways use element.center.lat/element.center.lon
    const hospitals = elements
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any, idx: number) => {
        const latitude = el.lat || el.center?.lat;
        const longitude = el.lon || el.center?.lon;

        return {
          id: `hospital_${el.id || idx}`,
          name: el.tags.name || 'Unnamed Medical Centre',
          address:
            el.tags['addr:full'] ||
            el.tags['addr:street'] ||
            el.tags['addr:suburb'] ||
            city,
          phone: el.tags.phone || el.tags['contact:phone'] || null,
          lat: latitude || 0,
          lng: longitude || 0,
          type: el.tags.amenity || el.tags.healthcare || 'medical',
          rating: 4.5,
        };
      });

    console.log('[v0] Found', hospitals.length, 'hospitals');

    return NextResponse.json({
      hospitals: hospitals,
    });
  } catch (error) {
    console.error('[v0] Hospitals API error:', error);
    return NextResponse.json(
      { hospitals: [] },
      { status: 200 }
    );
  }
}
