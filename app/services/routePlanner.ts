import { Route, RoutePoint, HealthRisk } from '../types';
import { fetchAQIData } from './api';
import { userProfileService } from './userProfile';

class RoutePlannerService {
  async planRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    routeName: string = 'My Route'
  ): Promise<Route> {
    // Generate route points (simplified - in real app would use Google Maps API)
    const points: RoutePoint[] = [];
    const numPoints = 10;
    
    for (let i = 0; i <= numPoints; i++) {
      const progress = i / numPoints;
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;
      
      // Fetch AQI data for each point (in real app, would batch these requests)
      try {
        const aqiData = await fetchAQIData(lat, lng);
        points.push({
          latitude: lat,
          longitude: lng,
          aqi: aqiData.aqi,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Fallback with simulated data
        points.push({
          latitude: lat,
          longitude: lng,
          aqi: Math.floor(Math.random() * 200) + 50,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Calculate route metrics
    const averageAQI = points.reduce((sum, point) => sum + point.aqi, 0) / points.length;
    const distance = this.calculateDistance(startLat, startLng, endLat, endLng);
    const duration = Math.round(distance * 2); // Rough estimate: 2 minutes per km

    // Calculate health risk
    const userProfile = userProfileService.getCurrentProfile();
    const healthRisk: HealthRisk = userProfile 
      ? userProfileService.calculateHealthRisk(averageAQI, userProfile)
      : {
          level: 'moderate',
          score: Math.round(averageAQI / 3),
          factors: ['No user profile available'],
          recommendations: ['Create a profile for personalized recommendations'],
        };

    const route: Route = {
      id: Date.now().toString(),
      name: routeName,
      points,
      averageAQI: Math.round(averageAQI),
      duration,
      distance: Math.round(distance * 10) / 10,
      healthRisk,
    };

    return route;
  }

  async findAlternativeRoutes(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<Route[]> {
    const routes: Route[] = [];

    // Generate 3 alternative routes with different paths
    const routeVariations = [
      { name: 'Direct Route', latOffset: 0, lngOffset: 0 },
      { name: 'Northern Route', latOffset: 0.01, lngOffset: 0 },
      { name: 'Southern Route', latOffset: -0.01, lngOffset: 0 },
    ];

    for (const variation of routeVariations) {
      const midLat = (startLat + endLat) / 2 + variation.latOffset;
      const midLng = (startLng + endLng) / 2 + variation.lngOffset;
      
      // Create route through midpoint
      const route1 = await this.planRoute(startLat, startLng, midLat, midLng, `${variation.name} (Part 1)`);
      const route2 = await this.planRoute(midLat, midLng, endLat, endLng, `${variation.name} (Part 2)`);
      
      // Combine routes
      const combinedRoute: Route = {
        id: Date.now().toString() + Math.random(),
        name: variation.name,
        points: [...route1.points, ...route2.points],
        averageAQI: Math.round((route1.averageAQI + route2.averageAQI) / 2),
        duration: route1.duration + route2.duration,
        distance: route1.distance + route2.distance,
        healthRisk: route1.healthRisk.level === 'high' || route2.healthRisk.level === 'high' 
          ? route1.healthRisk.level === 'high' ? route1.healthRisk : route2.healthRisk
          : route1.healthRisk,
      };

      routes.push(combinedRoute);
    }

    // Sort by health risk and AQI
    routes.sort((a, b) => {
      const riskOrder = { low: 1, moderate: 2, high: 3, severe: 4 };
      const riskDiff = riskOrder[a.healthRisk.level] - riskOrder[b.healthRisk.level];
      return riskDiff !== 0 ? riskDiff : a.averageAQI - b.averageAQI;
    });

    return routes;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  getRouteRecommendations(route: Route): string[] {
    const recommendations: string[] = [];
    
    if (route.averageAQI > 150) {
      recommendations.push('🚨 Avoid this route - Very unhealthy air quality');
      recommendations.push('😷 Wear N95 mask if travel is essential');
      recommendations.push('🚗 Keep windows closed and use AC recirculation');
    } else if (route.averageAQI > 100) {
      recommendations.push('⚠️ Use caution on this route');
      recommendations.push('😷 Consider wearing a mask');
      recommendations.push('⏰ Travel during off-peak hours if possible');
    } else if (route.averageAQI > 50) {
      recommendations.push('✅ Generally safe route');
      recommendations.push('🌬️ Good ventilation recommended');
    } else {
      recommendations.push('🌟 Excellent air quality route');
      recommendations.push('🚴‍♂️ Perfect for walking or cycling');
    }

    return recommendations;
  }
}

export const routePlannerService = new RoutePlannerService();