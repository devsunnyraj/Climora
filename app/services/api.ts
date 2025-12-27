// src/services/api.ts
export type LatLon = { lat: number; lon: number };


const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export type PlaceItem = {
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

type AQIResult = {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;          // leave in µg/m³ if you don’t have mg/m³
  location: string;
  updatedAt: string;
  time?: string;
  _source: 'waqi' | 'cpcb';
  _raw?: any;
};

export async function getNearbyPlaces(
  lat: number,
  lon: number,
  category: 'all' | 'hospital' | 'pharmacy' | 'clinic' | 'ambulance' = 'all',
  radius = 5000,
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
  if (!res.ok) throw new Error('places_fetch_failed');
  return res.json();
}

export async function fetchAQIData(lat: number, lon: number): Promise<AQIResult> {
  
  // 1) Try WAQI via backend proxy (default /api/aqi)
  try {
    const url = `${BASE}/api/aqi?lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('WAQI API error:', response.status, response.statusText);
      throw new Error(`WAQI API failed: ${response.status}`);
    }
    
    const waqi = await response.json();

    if (waqi?.status === 'ok' && waqi.data) {
      const d = waqi.data;
      const iaqi = d.iaqi || {};
      const toNum = (v: any) => (v == null ? 0 : Number(v));

      return {
        aqi: toNum(d.aqi),
        pm25: toNum(iaqi.pm25?.v ?? iaqi.pm2_5?.v),
        pm10: toNum(iaqi.pm10?.v),
        no2: toNum(iaqi.no2?.v),
        so2: toNum(iaqi.so2?.v),
        o3: toNum(iaqi.o3?.v),
        co: toNum(iaqi.co?.v),
        location: d.city?.name ?? '',
        updatedAt: d.time?.s ? new Date(d.time.s).toISOString() : new Date().toISOString(),
        _source: 'waqi',
        _raw: waqi,
      };
    }
  } catch (err) {
    console.error('WAQI fetch failed:', err);
  }

  // 2) Try CPCB computed from OpenWeather (smoothed)
  try {
    const url = `${BASE}/api/aqi?lat=${lat}&lon=${lon}&mode=cpcb&smooth=true`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('CPCB API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('CPCB error details:', errorText);
      throw new Error(`CPCB API failed: ${response.status}`);
    }
    
    const cpcb = await response.json();

    return {
      aqi: Number(cpcb?.aqi ?? 0),
      pm25: Number(cpcb?.components?.pm25 ?? 0),
      pm10: Number(cpcb?.components?.pm10 ?? 0),
      no2: Number(cpcb?.components?.no2 ?? 0),
      so2: Number(cpcb?.components?.so2 ?? 0),
      o3: Number(cpcb?.components?.o3 ?? 0),
      co: Number(cpcb?.components?.co_mg_m3 ?? 0),
      location: '',
      updatedAt: cpcb?.updatedAt || new Date().toISOString(),
      _source: 'cpcb',
      _raw: cpcb,
    };
  } catch (err) {
    console.error('CPCB fetch failed:', err);
    throw new Error('Failed to fetch AQI data from all sources. Please check your internet connection and API keys.');
  }
}




export async function fetchWeatherData(lat: number, lon: number) {
  try {
    const url = `${BASE}/api/weather?lat=${lat}&lon=${lon}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Weather API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Weather error details:', errorText);
      throw new Error(`Weather API failed: ${response.status}`);
    }
    
    const raw = await response.json();

    // OpenWeather (metric): temp in °C, wind.speed in m/s
    const tempC = Number(raw?.main?.temp ?? 0);
    const windMs = Number(raw?.wind?.speed ?? 0);
    const windKmh = Math.round(windMs * 3.6);

    return {
      // Use the exact keys your card expects
      temperature: Math.round(tempC),           // shows "19°C"
      humidity: Number(raw?.main?.humidity ?? 0), // "34%"
      windSpeed: windKmh,                       // "11 km/h"
      pressure: Number(raw?.main?.pressure ?? 0), // "1015 hPa"

      // extras/aliases for other parts of the app
      temp: tempC,
      wind: windMs,
      condition: raw?.weather?.[0]?.main ?? "Unknown",
      desc: raw?.weather?.[0]?.description ?? "Unknown",
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Weather fetch failed:', err);
    throw new Error('Failed to fetch weather data. Please check your internet connection and API keys.');
  }
}




export async function predictAQI(series: Array<Record<string, number>>) {
  try {
    const url = `${BASE}/api/predict`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series }),
    });
    
    if (!res.ok) {
      console.error('Prediction API error:', res.status, res.statusText);
      throw new Error(`Prediction failed: ${res.status}`);
    }
    
    const result = await res.json();
    return result as { aqi_pred: number[]; horizon_hours: number[] };
  } catch (err) {
    console.error('Prediction fetch failed:', err);
    throw new Error('Failed to fetch predictions. The prediction service may be unavailable.');
  }
}

/** Keep this helper so your components can still import { getAQILevel } */
export function getAQILevel(aqi: number): { level: string; color: string; description: string } {
  if (aqi <= 50)   return { level: "Good",      color: "#22c55e", description: "Air quality is satisfactory." };
  if (aqi <= 100)  return { level: "Moderate",  color: "#f59e0b", description: "Acceptable; sensitive groups should take care." };
  if (aqi <= 200)  return { level: "Poor",      color: "#ef4444", description: "Health effects possible for sensitive people." };
  if (aqi <= 300)  return { level: "Very Poor", color: "#a855f7", description: "Increased health risk for everyone." };
  return                { level: "Severe",     color: "#7f1d1d", description: "Serious health effects. Avoid outdoor activity." };
}

