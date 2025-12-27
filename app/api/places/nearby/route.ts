import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const category = searchParams.get('category') || 'all';
    const radius = searchParams.get('radius') || '5000';
    const pagetoken = searchParams.get('pagetoken');
    
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'lat and lon required' },
        { status: 400 }
      );
    }

    const key = process.env.GOOGLE_MAPS_KEY;
    if (!key) {
      return NextResponse.json(
        { error: 'GOOGLE_MAPS_KEY missing' },
        { status: 500 }
      );
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&key=${key}`;

    // Category → keyword / type mapping
    if (category && category !== 'all') {
      if (category === 'ambulance') {
        url += `&keyword=ambulance`;
      } else {
        url += `&type=${category}`;
      }
    }

    if (pagetoken) {
      url += `&pagetoken=${pagetoken}`;
    }

    console.log('Calling Google Places API:', url.replace(key, 'API_KEY_HIDDEN'));

    const r = await axios.get(url);
    const data = r.data;

    console.log('Google Places API status:', data.status);
    console.log('Results count:', data.results?.length || 0);
    
    if (data.error_message) {
      console.error('Google Places API error message:', data.error_message);
    }

    // ZERO_RESULTS is actually a success case (just no results found)
    if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json({
        results: [],
        next_page_token: null,
      });
    }

    if (data.status !== 'OK' && data.status !== 'INVALID_REQUEST') {
      console.error('Places API error:', data);
      return NextResponse.json(
        { 
          error: 'places_api_failed', 
          detail: data, 
          status: data.status,
          error_message: data.error_message 
        },
        { status: 500 }
      );
    }

    const results = (data.results || []).map((p: any) => {
      const placeLat = p.geometry?.location?.lat;
      const placeLon = p.geometry?.location?.lng;
      const distance = calculateDistance(userLat, userLon, placeLat, placeLon);

      return {
        place_id: p.place_id,
        name: p.name,
        rating: p.rating || 0,
        user_ratings_total: p.user_ratings_total || 0,
        open_now: p.opening_hours?.open_now ?? null,
        vicinity: p.vicinity || '',
        location: {
          lat: placeLat,
          lon: placeLon,
        },
        distance_m: Math.round(distance),
        types: p.types || [],
      };
    });

    return NextResponse.json({
      results,
      next_page_token: data.next_page_token || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'places_backend_error', detail: err?.message },
      { status: 500 }
    );
  }
}