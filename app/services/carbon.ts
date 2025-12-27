import { CarbonActivity } from '../types';

export const carbonEmissionFactors = {
  // Transport (kg CO2 per km)
  car: 0.21,
  bus: 0.089,
  train: 0.041,
  plane: 0.255,
  bike: 0,
  walk: 0,
  
  // Energy (kg CO2 per kWh)
  electricity: 0.92,
  naturalGas: 0.185, // per kWh equivalent
  
  // Diet (kg CO2 per serving)
  beef: 6.61,
  pork: 2.45,
  chicken: 1.57,
  fish: 1.24,
  vegetables: 0.43,
  dairy: 1.37,
};

export const calculateTransportEmissions = (
  mode: keyof typeof carbonEmissionFactors,
  distance: number
): number => {
  const factor = carbonEmissionFactors[mode] || 0;
  return distance * factor;
};

export const calculateEnergyEmissions = (
  type: 'electricity' | 'naturalGas',
  consumption: number
): number => {
  const factor = carbonEmissionFactors[type];
  return consumption * factor;
};

export const calculateDietEmissions = (
  foodType: keyof typeof carbonEmissionFactors,
  servings: number
): number => {
  const factor = carbonEmissionFactors[foodType] || 0;
  return servings * factor;
};

export const getTotalEmissions = (activities: CarbonActivity[]): number => {
  return activities.reduce((total, activity) => total + activity.emissions, 0);
};

export const getEmissionsByCategory = (activities: CarbonActivity[]) => {
  const categories = {
    transport: 0,
    energy: 0,
    diet: 0,
  };

  activities.forEach(activity => {
    categories[activity.type] += activity.emissions;
  });

  return categories;
};

export const getAverageEmissions = (): number => {
  // Average annual CO2 emissions per person globally (in kg)
  return 4800;
};