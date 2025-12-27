// src/services/emergencyServices.ts
import { EmergencyService } from '../types';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type PlacesCategory = 'all' | 'hospital' | 'ambulance' | 'clinic' | 'pharmacy';

type PlaceItem = {
  place_id: string;
  name: string;
  types: string[];
  rating: number | null;
  user_ratings_total: number;
  open_now: boolean | null;
  vicinity: string;
  location: { lat: number; lon: number };
  distance_m: number;
};

async function getNearbyPlaces(
  lat: number,
  lon: number,
  category: PlacesCategory,
  radius = 50000,
  pagetoken?: string
): Promise<{ results: PlaceItem[]; next_page_token: string | null }> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    category,
    radius: String(radius),
  });
  if (pagetoken) params.set('pagetoken', pagetoken);

  const res = await fetch(`${BASE}/api/places/nearby?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('Places API error:', errorData);
    throw new Error(`places_fetch_failed: ${errorData.error_message || errorData.status || res.status}`);
  }
  return res.json();
}

// Heuristic: convert Google 'types' to our app categories if filter not supplied
function inferType(types: string[], requested?: PlacesCategory): EmergencyService['type'] {
  if (requested && requested !== 'all') return requested;
  const t = types.map(s => s.toLowerCase());
  if (t.includes('hospital')) return 'hospital';
  if (t.includes('pharmacy')) return 'pharmacy';
  // Google uses 'doctor' for clinics/OPD
  if (t.includes('doctor') || t.includes('health') || t.includes('clinic')) return 'clinic';
  // There is no official 'ambulance' type; we search by keyword in backend,
  // but if it still appears in types, map it:
  if (t.includes('ambulance')) return 'ambulance';
  // fallback
  return 'clinic';
}

class EmergencyServicesService {
  private services: EmergencyService[] = [];
  private nextPageToken: string | null = null;
  private lastQuery:
    | { lat: number; lon: number; category: PlacesCategory; radius: number }
    | null = null;

  /**
   * Find nearby services by live location using Google Places (via backend).
   * @param latitude
   * @param longitude
   * @param type Optional filter: 'hospital' | 'ambulance' | 'clinic' | 'pharmacy'
   * @returns Sorted by distance (km)
   */
  async findNearbyServices(
    latitude: number,
    longitude: number,
    type?: 'hospital' | 'ambulance' | 'clinic' | 'pharmacy'
  ): Promise<EmergencyService[]> {
    const category: PlacesCategory = (type as PlacesCategory) || 'all';
    const radius = 5000;

    this.lastQuery = { lat: latitude, lon: longitude, category, radius };

    try {
      const { results, next_page_token } = await getNearbyPlaces(latitude, longitude, category, radius);
      this.nextPageToken = next_page_token;

      console.log(`Found ${results.length} places from Google Maps API`);

      const mapped: EmergencyService[] = results.map((p) => {
        const mappedType = inferType(p.types, category);
        const distanceKm = Number((p.distance_m / 1000).toFixed(1));

        return {
          id: p.place_id,
          name: p.name,
          type: mappedType,
          address: p.vicinity || '',
          // Nearby Search does not return phone; you can add a Place Details call if you need it.
          phone: '', // unknown from Nearby Search
          distance: distanceKm,
          coordinates: [p.location.lat, p.location.lon],
          rating: p.rating ?? 0,
          isOpen: p.open_now ?? true,
          // Treat hospital & ambulance as emergency-capable for highlighting
          emergencyServices: mappedType === 'hospital' || mappedType === 'ambulance',
        };
      });

      // Sort by distance ascending
      mapped.sort((a, b) => a.distance - b.distance);

      this.services = mapped;
      return mapped;
    } catch (error) {
      console.error('Error in findNearbyServices:', error);
      throw error;
    }
  }

  /**
   * Load more results (if available) using Google Places pagination.
   * Google issues a next_page_token that becomes valid ~2 seconds after the previous response.
   */
  async loadMore(): Promise<EmergencyService[]> {
    if (!this.lastQuery || !this.nextPageToken) return this.services;
    const { lat, lon, category, radius } = this.lastQuery;

    // It’s safe to call immediately; backend already passes token straight to Google.
    const { results, next_page_token } = await getNearbyPlaces(lat, lon, category, radius, this.nextPageToken);
    this.nextPageToken = next_page_token;

    const extra = results.map((p) => {
      const mappedType = inferType(p.types, category);
      const distanceKm = Number((p.distance_m / 1000).toFixed(1));
      return {
        id: p.place_id,
        name: p.name,
        type: mappedType,
        address: p.vicinity || '',
        phone: '',
        distance: distanceKm,
        coordinates: [p.location.lat, p.location.lon],
        rating: p.rating ?? 0,
        isOpen: p.open_now ?? true,
        emergencyServices: mappedType === 'hospital' || mappedType === 'ambulance',
      } as EmergencyService;
    });

    this.services = [...this.services, ...extra].sort((a, b) => a.distance - b.distance);
    return this.services;
  }

  async callEmergency(serviceId: string): Promise<void> {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return;

    // If we don’t have a phone, fall back to India emergency codes by type
    let number = service.phone;
    if (!number) {
      if (service.type === 'ambulance' || service.type === 'hospital') number = '108';
      else number = '100'; // fallback (police) to at least open dialer
    }
    window.open(`tel:${number}`);
  }

  async getDirections(serviceId: string): Promise<void> {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return;
    const [lat, lng] = service.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }

  async shareLocation(serviceId: string): Promise<void> {
    const service = this.services.find(s => s.id === serviceId);
    if (!service || !navigator.share) return;
    try {
      await navigator.share({
        title: `Emergency: ${service.name}`,
        text: `I need help at ${service.address}`,
        url: `https://www.google.com/maps/search/?api=1&query=${service.coordinates[0]},${service.coordinates[1]}`,
      });
    } catch (error) {
      // Error sharing location
    }
  }

  getEmergencyContacts(): { name: string; number: string; description: string }[] {
    return [
      { name: 'Emergency Services', number: '108', description: 'Medical Emergency' },
      { name: 'Fire Department', number: '101', description: 'Fire Emergency' },
      { name: 'Police', number: '100', description: 'Police Emergency' },
      { name: 'Disaster Management', number: '1078', description: 'Natural Disasters' },
      { name: 'Women Helpline', number: '1091', description: 'Women in Distress' },
      { name: 'Child Helpline', number: '1098', description: 'Child in Need' },
    ];
  }
}

export const emergencyServicesService = new EmergencyServicesService();
