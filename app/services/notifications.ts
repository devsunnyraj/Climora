import { NotificationData } from './geolocation';
import { AQIData } from '../types';
import { getAQILevel } from './api';

class NotificationService {
  private notifications: NotificationData[] = [];
  private notificationCallbacks: ((notifications: NotificationData[]) => void)[] = [];
  private permissionGranted = false;

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      // Browser does not support notifications
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  generateHealthNotifications(aqiData: AQIData, location: string): NotificationData[] {
    const notifications: NotificationData[] = [];
    const aqiLevel = getAQILevel(aqiData.aqi);
    const timestamp = new Date().toISOString();

    // AQI-based notifications
    if (aqiData.aqi > 150) {
      notifications.push({
        id: `aqi-critical-${Date.now()}`,
        type: 'alert',
        title: '🚨 Critical Air Quality Alert',
        message: `AQI is ${aqiData.aqi} in ${location}. Avoid outdoor activities and wear N95 masks if you must go outside.`,
        priority: 'critical',
        timestamp,
        actionRequired: true,
        icon: '🚨',
      });
    } else if (aqiData.aqi > 100) {
      notifications.push({
        id: `aqi-unhealthy-${Date.now()}`,
        type: 'health',
        title: '😷 Wear a Mask Outside',
        message: `Air quality is unhealthy (AQI: ${aqiData.aqi}) in ${location}. Consider wearing a mask and limiting outdoor exposure.`,
        priority: 'high',
        timestamp,
        actionRequired: true,
        icon: '😷',
      });
    } else if (aqiData.aqi > 50) {
      notifications.push({
        id: `aqi-moderate-${Date.now()}`,
        type: 'health',
        title: '⚠️ Moderate Air Quality',
        message: `Air quality is moderate in ${location}. Sensitive individuals should consider reducing outdoor activities.`,
        priority: 'medium',
        timestamp,
        actionRequired: false,
        icon: '⚠️',
      });
    } else {
      notifications.push({
        id: `aqi-good-${Date.now()}`,
        type: 'health',
        title: '✅ Great Air Quality',
        message: `Perfect day for outdoor activities in ${location}! AQI is ${aqiData.aqi}.`,
        priority: 'low',
        timestamp,
        actionRequired: false,
        icon: '✅',
      });
    }

    // PM2.5 specific warnings
    if (aqiData.pm25 > 75) {
      notifications.push({
        id: `pm25-warning-${Date.now()}`,
        type: 'health',
        title: '🫁 High PM2.5 Levels',
        message: `PM2.5 is ${aqiData.pm25} μg/m³. These fine particles can penetrate deep into lungs. Use air purifiers indoors.`,
        priority: 'high',
        timestamp,
        actionRequired: true,
        icon: '🫁',
      });
    }

    // Time-based recommendations
    const hour = new Date().getHours();
    if (aqiData.aqi > 100 && (hour >= 6 && hour <= 9)) {
      notifications.push({
        id: `morning-commute-${Date.now()}`,
        type: 'activity',
        title: '🚗 Morning Commute Alert',
        message: 'Consider working from home or using public transport during peak pollution hours.',
        priority: 'medium',
        timestamp,
        actionRequired: false,
        icon: '🚗',
      });
    }

    if (aqiData.aqi < 75 && (hour >= 6 && hour <= 8)) {
      notifications.push({
        id: `exercise-time-${Date.now()}`,
        type: 'activity',
        title: '🏃‍♂️ Perfect for Exercise',
        message: 'Great air quality for morning jog or outdoor workout!',
        priority: 'low',
        timestamp,
        actionRequired: false,
        icon: '🏃‍♂️',
      });
    }

    return notifications;
  }

  generateWeatherNotifications(weatherData: any, aqiData: AQIData): NotificationData[] {
    const notifications: NotificationData[] = [];
    const timestamp = new Date().toISOString();

    // Wind and pollution correlation
    if (weatherData.windSpeed < 5 && aqiData.aqi > 100) {
      notifications.push({
        id: `low-wind-${Date.now()}`,
        type: 'weather',
        title: '💨 Low Wind Alert',
        message: 'Low wind speeds may worsen air quality. Pollutants are likely to accumulate.',
        priority: 'medium',
        timestamp,
        actionRequired: false,
        icon: '💨',
      });
    }

    // High humidity and pollution
    if (weatherData.humidity > 80 && aqiData.aqi > 75) {
      notifications.push({
        id: `high-humidity-${Date.now()}`,
        type: 'weather',
        title: '💧 High Humidity Warning',
        message: 'High humidity can make air pollution feel worse. Stay hydrated and limit outdoor exposure.',
        priority: 'medium',
        timestamp,
        actionRequired: false,
        icon: '💧',
      });
    }

    return notifications;
  }

  addNotifications(newNotifications: NotificationData[]): void {
    // Remove duplicates and old notifications
    const now = Date.now();
    this.notifications = this.notifications.filter(n => 
      now - new Date(n.timestamp).getTime() < 3600000 // Keep notifications for 1 hour
    );

    // Add new notifications
    newNotifications.forEach(notification => {
      const exists = this.notifications.some(n => n.id === notification.id);
      if (!exists) {
        this.notifications.unshift(notification);
        
        // Show browser notification for high priority items
        if (this.permissionGranted && (notification.priority === 'high' || notification.priority === 'critical')) {
          this.showBrowserNotification(notification);
        }
      }
    });

    // Keep only latest 20 notifications
    this.notifications = this.notifications.slice(0, 20);
    
    // Notify callbacks
    this.notificationCallbacks.forEach(callback => callback([...this.notifications]));
  }

  private showBrowserNotification(notification: NotificationData): void {
    if (!this.permissionGranted) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/vite.svg', // You can replace with a custom icon
      badge: '/vite.svg',
      tag: notification.id,
      requireInteraction: notification.priority === 'critical',
    });

    // Auto close after 10 seconds for non-critical notifications
    if (notification.priority !== 'critical') {
      setTimeout(() => browserNotification.close(), 10000);
    }
  }

  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  markAsRead(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notificationCallbacks.forEach(callback => callback([...this.notifications]));
  }

  clearAll(): void {
    this.notifications = [];
    this.notificationCallbacks.forEach(callback => callback([]));
  }

  onNotificationsUpdate(callback: (notifications: NotificationData[]) => void): void {
    this.notificationCallbacks.push(callback);
  }

  removeNotificationCallback(callback: (notifications: NotificationData[]) => void): void {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
  }
}

export const notificationService = new NotificationService();