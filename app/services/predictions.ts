// src/services/predictions.ts
import { predictAQI, getAQILevel } from "./api";

/** The backend heuristic/model expects these keys in each time-step */
export type SeriesPoint = {
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
};

export type ForecastPoint = {
  hour: number;     // 24, 48, 72
  aqi: number;      // predicted AQI
  level: string;    // "Good" | "Moderate" | ...
};

/**
 * Wrapper so existing components can keep using:
 * 
 *    const model = new AQIPredictionModel();
 *    const results = await model.forecast(series);
 */
export class AQIPredictionModel {
  async forecast(series: SeriesPoint[]): Promise<ForecastPoint[]> {
    if (!Array.isArray(series) || series.length === 0) {
      throw new Error("series (SeriesPoint[]) is required");
    }

    // Backend call
    const { aqi_pred, horizon_hours } = await predictAQI(series);

    // Convert backend output → frontend ForecastPoint[]
    return aqi_pred.map((aqi, i) => {
      const levelInfo = getAQILevel(aqi) as any; // supports string or { level, color }
      const levelStr = typeof levelInfo === 'string' ? levelInfo : levelInfo?.level;
    
      return {
        hour: horizon_hours?.[i] ?? (i + 1) * 24,
        aqi,
        level: levelStr ?? 'Unknown',
      };
    });
  }
}
