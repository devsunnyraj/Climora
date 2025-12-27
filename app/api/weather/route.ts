import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'lat and lon required' },
        { status: 400 }
      );
    }

    const key = process.env.OPENWEATHER_KEY;
    if (!key) {
      return NextResponse.json(
        { error: 'OPENWEATHER_KEY missing' },
        { status: 500 }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    const { data } = await axios.get(url);
    
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { 
        error: 'weather_fetch_failed', 
        detail: err?.response?.data || err?.message 
      },
      { status: 500 }
    );
  }
}
