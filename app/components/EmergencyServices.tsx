import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Navigation, Star, Clock, Shield } from 'lucide-react';
import { EmergencyService } from '../types';
import { emergencyServicesService } from '../services/emergencyServices';
import { geolocationService } from '../services/geolocation';

const EmergencyServices: React.FC = () => {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'ambulance' | 'clinic' | 'pharmacy'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadNearbyServices();
  }, [selectedType]);

  const loadNearbyServices = async () => {
    setLoading(true);
    try {
      // Get user location
      const location = await geolocationService.getCurrentLocation();
      setUserLocation({ lat: location.latitude, lng: location.longitude });
      
      // Use mock data for demo (Google Maps requires billing)
      const mockServices: EmergencyService[] = [
        {
          id: '1',
          name: 'City General Hospital',
          type: 'hospital',
          address: 'Main Road, City Center',
          phone: '1234567890',
          distance: 2.5,
          coordinates: [location.latitude + 0.01, location.longitude + 0.01],
          rating: 4.5,
          isOpen: true,
          emergencyServices: true,
        },
        {
          id: '2',
          name: 'Quick Ambulance Service',
          type: 'ambulance',
          address: 'Emergency Center',
          phone: '108',
          distance: 1.2,
          coordinates: [location.latitude + 0.005, location.longitude + 0.005],
          rating: 4.8,
          isOpen: true,
          emergencyServices: true,
        },
        {
          id: '3',
          name: 'Care Clinic',
          type: 'clinic',
          address: 'Medical Plaza, 2nd Floor',
          phone: '9876543210',
          distance: 3.1,
          coordinates: [location.latitude - 0.01, location.longitude + 0.01],
          rating: 4.2,
          isOpen: true,
          emergencyServices: false,
        },
        {
          id: '4',
          name: 'MedPlus Pharmacy',
          type: 'pharmacy',
          address: 'Shopping Complex',
          phone: '5555555555',
          distance: 1.8,
          coordinates: [location.latitude + 0.008, location.longitude - 0.008],
          rating: 4.0,
          isOpen: true,
          emergencyServices: false,
        },
      ];
      
      // Filter by selected type
      const filtered = selectedType === 'all' 
        ? mockServices 
        : mockServices.filter(s => s.type === selectedType);
      
      setServices(filtered);
    } catch (error) {
      console.error('Error loading emergency services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (serviceId: string) => {
    emergencyServicesService.callEmergency(serviceId);
  };

  const handleDirections = (serviceId: string) => {
    emergencyServicesService.getDirections(serviceId);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'ambulance': return '🚑';
      case 'clinic': return '🏥';
      case 'pharmacy': return '💊';
      default: return '🏥';
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-red-50 border-red-200 text-red-800';
      case 'ambulance': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'clinic': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'pharmacy': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const emergencyContacts = emergencyServicesService.getEmergencyContacts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Emergency Services</h1>
        </div>
        <button
          onClick={loadNearbyServices}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Refresh Location
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Hotlines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                <button
                  onClick={() => window.open(`tel:${contact.number}`)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              <p className="text-2xl font-bold text-red-600 mb-1">{contact.number}</p>
              <p className="text-sm text-gray-600">{contact.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Service Type Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Medical Services</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'hospital', 'ambulance', 'clinic', 'pharmacy'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All Services' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Services List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No services found in your area.</p>
                <p className="text-sm">Try refreshing your location or check your internet connection.</p>
              </div>
            ) : (
              services.map((service) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{getServiceIcon(service.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getServiceColor(service.type)}`}>
                            {service.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{service.address}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{service.distance} km away</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{service.rating}/5</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span className={service.isOpen ? 'text-green-600' : 'text-red-600'}>
                              {service.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {service.emergencyServices && (
                      <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        24/7 Emergency
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleCall(service.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </button>
                    
                    <button
                      onClick={() => handleDirections(service.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Directions</span>
                    </button>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{service.phone}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Safety Tips */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Safety Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Air Quality Emergency</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Move to indoor location immediately</li>
              <li>• Close all windows and doors</li>
              <li>• Use air purifiers if available</li>
              <li>• Wear N95 mask if going outside</li>
              <li>• Seek medical help if breathing difficulty</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Medical Emergency</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Call 108 for immediate ambulance</li>
              <li>• Stay calm and provide clear location</li>
              <li>• Don't move injured person unless necessary</li>
              <li>• Keep emergency contacts handy</li>
              <li>• Have medical history information ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyServices;