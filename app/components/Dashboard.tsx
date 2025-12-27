import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Activity, Wind, Thermometer, Droplets } from 'lucide-react';
import {getAQILevel } from '../services/api';
import { AQIData, WeatherData } from '../types';
import LocationTracker from './LocationTracker';
import { LocationData } from '../services/geolocation';
const safeDateText = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-IN', { hour12: true });
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Data will be loaded when location is available
    setLoading(false);
  }, []);

  const handleLocationUpdate = (location: LocationData) => {
    setCurrentLocation(location);
  };

  const handleDataUpdate = (aqi: AQIData, weather: WeatherData) => {
    setAqiData(aqi);
    setWeatherData(weather);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const aqiLevel = aqiData ? getAQILevel(aqiData.aqi) : null;

  const pollutantData = {
    labels: ['PM2.5', 'PM10', 'CO', 'NO₂', 'SO₂', 'O₃'],
    datasets: [
      {
        label: 'Concentration (μg/m³)',
        data: aqiData ? [aqiData.pm25, aqiData.pm10, aqiData.co, aqiData.no2, aqiData.so2, aqiData.o3] : [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          '#EF4444',
          '#F59E0B',
          '#10B981',
          '#3B82F6',
          '#8B5CF6',
          '#F97316',
        ],
        borderWidth: 0,
      },
    ],
  };

  const aqiTrendData = {
    labels: ['6 hours ago', '5 hours ago', '4 hours ago', '3 hours ago', '2 hours ago', '1 hour ago', 'Now'],
    datasets: [
      {
        label: 'AQI',
        data: [120, 115, 108, 95, 102, 98, aqiData?.aqi || 0],
        borderColor: aqiLevel?.color || '#10B981',
        backgroundColor: `${aqiLevel?.color || '#10B981'}20`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#374151',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
        },
      },
      x: {
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB',
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real-Time Air Quality Dashboard</h1>
          {currentLocation && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Live data for {currentLocation.city}, {currentLocation.country}
            </p>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
        {aqiData && `Last updated: ${safeDateText(aqiData.updatedAt || aqiData.time)}`}
        </div>
      </div>

      {/* Location Tracker */}
      <LocationTracker 
        onLocationUpdate={handleLocationUpdate}
        onDataUpdate={handleDataUpdate}
      />

      {/* AQI Overview */}
      {aqiData && weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Air Quality</h2>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: aqiLevel?.color }}
                ></div>
                <span className="text-sm font-medium" style={{ color: aqiLevel?.color }}>
                  {aqiLevel?.level}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-6xl font-bold" style={{ color: aqiLevel?.color }}>
                {aqiData.aqi}
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {aqiLevel?.level}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {aqiLevel?.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Location: {aqiData.location || '—'}
                </div>
              </div>
            </div>

            <div className="h-64">
              <Line data={aqiTrendData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Weather Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weather Conditions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{weatherData.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Humidity</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{weatherData.humidity}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wind className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Wind Speed</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{weatherData.windSpeed} km/h</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">Pressure</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{weatherData.pressure} hPa</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Impact</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">PM2.5 Level</span>
                <span className={`font-semibold ${aqiData.pm25 > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {aqiData.pm25 > 50 ? 'High' : 'Normal'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Outdoor Activity</span>
                <span className={`font-semibold ${aqiData.aqi > 100 ? 'text-red-600' : 'text-green-600'}`}>
                  {aqiData.aqi > 100 ? 'Not Recommended' : 'Safe'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Mask Required</span>
                <span className={`font-semibold ${aqiData.aqi > 150 ? 'text-red-600' : 'text-green-600'}`}>
                  {aqiData.aqi > 150 ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* No Data State */}
      {!aqiData && !weatherData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Activity className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Waiting for Location</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Allow location access to get real-time air quality data for your area.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            We'll automatically fetch pollution data and provide personalized health recommendations.
          </p>
        </div>
      )}
      {/* Pollutant Breakdown */}
      {aqiData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Pollutant Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <Doughnut data={pollutantData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#374151',
                  },
                },
              },
            }} />
          </div>
          <div className="h-64">
            <Bar data={pollutantData} options={chartOptions} />
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;