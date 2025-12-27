import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { series } = body as {
      series: Array<{
        pm25: number;
        pm10: number;
        no2: number;
        so2: number;
        o3: number;
        co: number;
        temp: number;
        humidity: number;
        wind: number;
        pressure: number;
      }>;
    };

    if (!Array.isArray(series) || !series.length) {
      return NextResponse.json(
        { error: 'series array required' },
        { status: 400 }
      );
    }

    const last = series[series.length - 1];
    const aqi = Math.round(
      0.6 * last.pm25 + 0.2 * last.pm10 + 0.1 * last.no2 + 0.05 * last.o3 + 0.05 * last.so2
    );
    const next = [aqi, aqi + 5, aqi + 10];

    return NextResponse.json({
      aqi_pred: next,
      horizon_hours: [24, 48, 72],
      method: 'heuristic',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'predict_failed', detail: err?.message },
      { status: 500 }
    );
  }
}
