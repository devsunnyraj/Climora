import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const mode = searchParams.get('mode');
    const smooth = searchParams.get('smooth');
    
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'lat and lon required' },
        { status: 400 }
      );
    }

    // --- CPCB from OpenWeather components ---
    if (mode === 'cpcb') {
      const key = process.env.OPENWEATHER_KEY;
      if (!key) {
        return NextResponse.json(
          { error: 'OPENWEATHER_KEY missing' },
          { status: 500 }
        );
      }

      const subIndex = (
        C: number,
        bps: Array<{ lo: number; hi: number; Ilo: number; Ihi: number }>
      ) => {
        for (const bp of bps) {
          if (C >= bp.lo && C <= bp.hi) {
            return ((bp.Ihi - bp.Ilo) / (bp.hi - bp.lo)) * (C - bp.lo) + bp.Ilo;
          }
        }
        return 0;
      };

      // CPCB breakpoints
      const BP_PM25 = [
        { lo: 0, hi: 30, Ilo: 0, Ihi: 50 }, { lo: 31, hi: 60, Ilo: 51, Ihi: 100 },
        { lo: 61, hi: 90, Ilo: 101, Ihi: 200 }, { lo: 91, hi: 120, Ilo: 201, Ihi: 300 },
        { lo: 121, hi: 250, Ilo: 301, Ihi: 400 }, { lo: 251, hi: 9999, Ilo: 401, Ihi: 500 },
      ];
      const BP_PM10 = [
        { lo: 0, hi: 50, Ilo: 0, Ihi: 50 }, { lo: 51, hi: 100, Ilo: 51, Ihi: 100 },
        { lo: 101, hi: 250, Ilo: 101, Ihi: 200 }, { lo: 251, hi: 350, Ilo: 201, Ihi: 300 },
        { lo: 351, hi: 430, Ilo: 301, Ihi: 400 }, { lo: 431, hi: 9999, Ilo: 401, Ihi: 500 },
      ];
      const BP_NO2 = [
        { lo: 0, hi: 40, Ilo: 0, Ihi: 50 }, { lo: 41, hi: 80, Ilo: 51, Ihi: 100 },
        { lo: 81, hi: 180, Ilo: 101, Ihi: 200 }, { lo: 181, hi: 280, Ilo: 201, Ihi: 300 },
        { lo: 281, hi: 400, Ilo: 301, Ihi: 400 }, { lo: 401, hi: 9999, Ilo: 401, Ihi: 500 },
      ];
      const BP_SO2 = [
        { lo: 0, hi: 40, Ilo: 0, Ihi: 50 }, { lo: 41, hi: 80, Ilo: 51, Ihi: 100 },
        { lo: 81, hi: 380, Ilo: 101, Ihi: 200 }, { lo: 381, hi: 800, Ilo: 201, Ihi: 300 },
        { lo: 801, hi: 1600, Ilo: 301, Ihi: 400 }, { lo: 1601, hi: 999999, Ilo: 401, Ihi: 500 },
      ];
      const BP_O3 = [
        { lo: 0, hi: 50, Ilo: 0, Ihi: 50 }, { lo: 51, hi: 100, Ilo: 51, Ihi: 100 },
        { lo: 101, hi: 168, Ilo: 101, Ihi: 200 }, { lo: 169, hi: 208, Ilo: 201, Ihi: 300 },
        { lo: 209, hi: 748, Ilo: 301, Ihi: 400 }, { lo: 749, hi: 999999, Ilo: 401, Ihi: 500 },
      ];
      const BP_CO = [
        { lo: 0, hi: 1.0, Ilo: 0, Ihi: 50 }, { lo: 1.1, hi: 2.0, Ilo: 51, Ihi: 100 },
        { lo: 2.1, hi: 10.0, Ilo: 101, Ihi: 200 }, { lo: 10.1, hi: 17.0, Ilo: 201, Ihi: 300 },
        { lo: 17.1, hi: 34.0, Ilo: 301, Ihi: 400 }, { lo: 34.1, hi: 9999, Ilo: 401, Ihi: 500 },
      ];

      let pm25 = 0, pm10 = 0, no2 = 0, so2 = 0, o3 = 0, co_mg_m3 = 0, ts = new Date().toISOString();

      if (smooth === 'true') {
        const now = Math.floor(Date.now() / 1000);
        const dayAgo = now - 24 * 3600;
        const eightAgo = now - 8 * 3600;

        const histUrl24 = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${dayAgo}&end=${now}&appid=${key}`;
        const hist24 = await axios.get(histUrl24).then((r) => r.data?.list || []);

        const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

        pm25 = avg(hist24.map((x: any) => Number(x.components?.pm2_5 ?? 0)));
        pm10 = avg(hist24.map((x: any) => Number(x.components?.pm10 ?? 0)));
        no2 = avg(hist24.map((x: any) => Number(x.components?.no2 ?? 0)));
        so2 = avg(hist24.map((x: any) => Number(x.components?.so2 ?? 0)));

        const hist8 = hist24.filter((x: any) => (x.dt ?? 0) >= eightAgo);
        o3 = avg(hist8.map((x: any) => Number(x.components?.o3 ?? 0)));
        const co_ugm3 = avg(hist8.map((x: any) => Number(x.components?.co ?? 0)));
        co_mg_m3 = co_ugm3 / 1000;

        if (hist24.length) ts = new Date(hist24[hist24.length - 1].dt * 1000).toISOString();
      } else {
        const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
        const cur = await axios.get(airUrl).then((r) => r.data?.list?.[0]);
        const c = cur?.components || {};
        pm25 = Number(c.pm2_5 ?? 0);
        pm10 = Number(c.pm10 ?? 0);
        no2 = Number(c.no2 ?? 0);
        so2 = Number(c.so2 ?? 0);
        o3 = Number(c.o3 ?? 0);
        co_mg_m3 = Number(c.co ?? 0) / 1000;
        if (cur?.dt) ts = new Date(cur.dt * 1000).toISOString();
      }

      const si = {
        pm25: subIndex(pm25, BP_PM25),
        pm10: subIndex(pm10, BP_PM10),
        no2: subIndex(no2, BP_NO2),
        so2: subIndex(so2, BP_SO2),
        o3: subIndex(o3, BP_O3),
        co: subIndex(co_mg_m3, BP_CO),
      };
      const aqi = Math.round(Math.max(si.pm25, si.pm10, si.no2, si.so2, si.o3, si.co));

      return NextResponse.json({
        source: 'openweather+cpcb',
        aqi,
        components: { pm25, pm10, no2, so2, o3, co_mg_m3 },
        subIndices: si,
        time: ts,
        updatedAt: ts,
      });
    }

    // --- default to WAQI ---
    const token = process.env.WAQI_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'WAQI_TOKEN missing' },
        { status: 500 }
      );
    }
    
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
    const { data } = await axios.get(url);
    
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { 
        error: 'aqi_fetch_failed', 
        detail: err?.response?.data || err?.message 
      },
      { status: 500 }
    );
  }
}
