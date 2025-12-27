export interface AQIData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;

  // NEW (used by Dashboard)
  updatedAt?: string;    // ISO string
  time?: string;         // ISO string
  locationName?: string; // "Kharar, India"

  // OLD (keep so legacy code still compiles)
  location?: string;
}

export interface WeatherData {
  // what your cards render
  temperature: number; // °C
  humidity: number;    // %
  windSpeed: number;   // km/h
  pressure: number;    // hPa

  // extras / legacy
  temp?: number; // °C
  wind?: number; // m/s
  condition?: any;
  desc?: string;
  updatedAt?: string;
}

export interface CarbonActivity {
  id: string;
  type: 'transport' | 'energy' | 'diet';
  description: string;
  value: number;
  unit: string;
  emissions: number;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalEmissions: number;
  badges: Badge[];
  level: number;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  reward: number;
  deadline: string;
  completed: boolean;
}

export interface PredictionData {
  date: string;
  predictedAQI: number;
  confidence: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  medicalConditions: string[];
  allergies: string[];
  activityLevel: 'low' | 'moderate' | 'high';
  smokingStatus: 'never' | 'former' | 'current';
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
  };
  preferences: {
    language: 'en' | 'hi';
    notifications: boolean;
    voiceAssistant: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HealthRisk {
  level: 'low' | 'moderate' | 'high' | 'severe';
  score: number;
  factors: string[];
  recommendations: string[];
  medicalAdvice?: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  aqi: number;
  timestamp: string;
}

export interface Route {
  id: string;
  name: string;
  points: RoutePoint[];
  averageAQI: number;
  duration: number; // in minutes
  distance: number; // in km
  healthRisk: HealthRisk;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'ambulance' | 'clinic' | 'pharmacy';
  address: string;
  phone: string;
  distance: number; // in km
  coordinates: [number, number];
  rating: number;
  isOpen: boolean;
  emergencyServices: boolean;
}

export interface EducationalContent {
  id: string;
  title: string;
  category: 'air-quality' | 'health' | 'environment' | 'sustainability';
  content: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  readTime: number; // in minutes
  tags: string[];
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  medicalConditions: string[];
  allergies: string[];
  activityLevel: 'low' | 'moderate' | 'high';
  smokingStatus: 'never' | 'former' | 'current';
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
  };
  preferences: {
    language: 'en' | 'hi';
    notifications: boolean;
    voiceAssistant: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HealthRisk {
  level: 'low' | 'moderate' | 'high' | 'severe';
  score: number;
  factors: string[];
  recommendations: string[];
  medicalAdvice?: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  aqi: number;
  timestamp: string;
}

export interface Route {
  id: string;
  name: string;
  points: RoutePoint[];
  averageAQI: number;
  duration: number; // in minutes
  distance: number; // in km
  healthRisk: HealthRisk;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'ambulance' | 'clinic' | 'pharmacy';
  address: string;
  phone: string;
  distance: number; // in km
  coordinates: [number, number];
  rating: number;
  isOpen: boolean;
  emergencyServices: boolean;
}

export interface EducationalContent {
  id: string;
  title: string;
  category: 'air-quality' | 'health' | 'environment' | 'sustainability';
  content: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  readTime: number; // in minutes
  tags: string[];
  lastUpdated: string;
}