import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, Bell, X, AlertTriangle } from 'lucide-react';
import { geolocationService, LocationData, NotificationData } from '../services/geolocation';
import { notificationService } from '../services/notifications';
import { fetchAQIData, fetchWeatherData } from '../services/api';

interface LocationTrackerProps {
  onLocationUpdate?: (location: LocationData) => void;
  onDataUpdate?: (aqiData: any, weatherData: any) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ onLocationUpdate, onDataUpdate }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Request notification permission on component mount
    notificationService.requestPermission();
    
    // Set up notification listener
    const handleNotifications = (newNotifications: NotificationData[]) => {
      setNotifications(newNotifications);
    };
    
    notificationService.onNotificationsUpdate(handleNotifications);
    
    // Auto-get location on mount
    getCurrentLocation();
    
    return () => {
      notificationService.removeNotificationCallback(handleNotifications);
      geolocationService.stopWatchingLocation();
    };
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const locationData = await geolocationService.getCurrentLocation();
      setLocation(locationData);
      onLocationUpdate?.(locationData);
      
      // Fetch air quality and weather data for this location
      await updateEnvironmentalData(locationData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const updateEnvironmentalData = async (locationData: LocationData) => {
    try {
      const [aqiData, weatherData] = await Promise.all([
        fetchAQIData(locationData.latitude, locationData.longitude),
        fetchWeatherData(locationData.latitude, locationData.longitude),
      ]);

      onDataUpdate?.(aqiData, weatherData);

      // Generate smart notifications
      const healthNotifications = notificationService.generateHealthNotifications(
        aqiData, 
        locationData.city
      );
      const weatherNotifications = notificationService.generateWeatherNotifications(
        weatherData, 
        aqiData
      );

      notificationService.addNotifications([...healthNotifications, ...weatherNotifications]);
      
    } catch (error) {
      // Error fetching environmental data
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    geolocationService.startWatchingLocation();
    
    const handleLocationUpdate = (newLocation: LocationData) => {
      setLocation(newLocation);
      onLocationUpdate?.(newLocation);
      updateEnvironmentalData(newLocation);
    };
    
    geolocationService.onLocationUpdate(handleLocationUpdate);
  };

  const stopTracking = () => {
    setIsTracking(false);
    geolocationService.stopWatchingLocation();
  };

  const dismissNotification = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <MapPin className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Location & Alerts</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Tracking Toggle */}
          <button
            onClick={isTracking ? stopTracking : startTracking}
            className={`p-2 rounded-lg transition-colors ${
              isTracking 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Navigation className={`w-5 h-5 ${isTracking ? 'animate-pulse' : ''}`} />
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Location Display */}
      <div className="mb-4">
        {loading && (
          <div className="flex items-center space-x-2 text-gray-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Getting your location...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {location && !loading && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">{location.city}, {location.country}</span>
              {isTracking && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Live Tracking
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              {location.accuracy > 0 && ` (±${Math.round(location.accuracy)}m)`}
            </div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Smart Alerts</h3>
            <button
              onClick={() => notificationService.clearAll()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No notifications yet. We'll alert you about air quality changes.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getPriorityIcon(notification.priority)}
                        <span className="font-medium text-sm">{notification.title}</span>
                      </div>
                      <p className="text-sm opacity-90">{notification.message}</p>
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {location && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank')}
              className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View on Map
            </button>
            <button
              onClick={() => navigator.share?.({
                title: 'My Location - Climora',
                text: `I'm at ${location.city}, ${location.country}`,
                url: window.location.href,
              })}
              className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
            >
              Share Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;