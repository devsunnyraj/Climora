export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  accuracy: number;
}

export interface NotificationData {
  id: string;
  type: 'health' | 'weather' | 'activity' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  actionRequired?: boolean;
  icon: string;
}

class GeolocationService {
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;
  private locationCallbacks: ((location: LocationData) => void)[] = [];

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            // Reverse geocoding to get city name
            const locationData = await this.reverseGeocode(latitude, longitude);
            const location: LocationData = {
              latitude,
              longitude,
              city: locationData.city,
              country: locationData.country,
              accuracy: accuracy || 0,
            };
            
            this.currentLocation = location;
            resolve(location);
          } catch (error) {
            // Fallback without city name
            const location: LocationData = {
              latitude,
              longitude,
              city: 'Unknown Location',
              country: 'Unknown',
              accuracy: accuracy || 0,
            };
            resolve(location);
          }
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  startWatchingLocation(): void {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          const locationData = await this.reverseGeocode(latitude, longitude);
          const location: LocationData = {
            latitude,
            longitude,
            city: locationData.city,
            country: locationData.country,
            accuracy: accuracy || 0,
          };
          
          this.currentLocation = location;
          this.locationCallbacks.forEach(callback => callback(location));
        } catch (error) {
          // Error updating location
        }
      },
      (error) => {
        // Geolocation watch error
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // 1 minute
      }
    );
  }

  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  onLocationUpdate(callback: (location: LocationData) => void): void {
    this.locationCallbacks.push(callback);
  }

  removeLocationCallback(callback: (location: LocationData) => void): void {
    this.locationCallbacks = this.locationCallbacks.filter(cb => cb !== callback);
  }

  private async reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string }> {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      return {
        city: data.city || data.locality || 'Unknown City',
        country: data.countryName || 'Unknown Country',
      };
    } catch (error) {
      // Reverse geocoding error
      return { city: 'Unknown City', country: 'Unknown Country' };
    }
  }

  getCurrentLocationSync(): LocationData | null {
    return this.currentLocation;
  }
}

export const geolocationService = new GeolocationService();