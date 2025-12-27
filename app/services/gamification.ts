import { Badge, Challenge, User } from '../types';

export const badges: Badge[] = [
  {
    id: 'eco-warrior',
    name: 'Eco Warrior',
    description: 'Reduce emissions by 100kg CO2',
    icon: '🌱',
    earned: false,
  },
  {
    id: 'carbon-neutral',
    name: 'Carbon Neutral',
    description: 'Achieve net-zero emissions for a month',
    icon: '♻️',
    earned: false,
  },
  {
    id: 'green-commuter',
    name: 'Green Commuter',
    description: 'Use public transport for 7 days straight',
    icon: '🚌',
    earned: false,
  },
  {
    id: 'energy-saver',
    name: 'Energy Saver',
    description: 'Reduce energy consumption by 50%',
    icon: '⚡',
    earned: false,
  },
  {
    id: 'plant-based',
    name: 'Plant Based',
    description: 'Go vegetarian for 7 days',
    icon: '🥬',
    earned: false,
  },
];

export const challenges: Challenge[] = [
  {
    id: 'no-car-week',
    title: 'No Car Week',
    description: 'Avoid using personal car for 7 days',
    target: 7,
    current: 0,
    unit: 'days',
    reward: 500,
    deadline: '2025-02-15',
    completed: false,
  },
  {
    id: 'energy-reduction',
    title: 'Energy Reduction',
    description: 'Reduce energy consumption by 25%',
    target: 25,
    current: 0,
    unit: '%',
    reward: 300,
    deadline: '2025-02-28',
    completed: false,
  },
  {
    id: 'green-meals',
    title: 'Green Meals',
    description: 'Have 20 plant-based meals',
    target: 20,
    current: 0,
    unit: 'meals',
    reward: 250,
    deadline: '2025-02-20',
    completed: false,
  },
];

export const calculateLevel = (points: number): number => {
  return Math.floor(points / 1000) + 1;
};

export const getPointsForNextLevel = (points: number): number => {
  const currentLevel = calculateLevel(points);
  return currentLevel * 1000 - points;
};

export const checkBadgeEligibility = (user: User, activities: any[]): Badge[] => {
  const earnedBadges: Badge[] = [];
  
  // Check each badge condition
  badges.forEach(badge => {
    if (badge.earned) return;
    
    let eligible = false;
    
    switch (badge.id) {
      case 'eco-warrior':
        // Check if user has reduced emissions by 100kg
        eligible = user.totalEmissions < 4700; // Assuming average is 4800kg
        break;
      case 'green-commuter':
        // Check public transport usage
        eligible = activities.filter(a => 
          a.type === 'transport' && 
          ['bus', 'train'].includes(a.description.toLowerCase())
        ).length >= 7;
        break;
      // Add more badge logic here
    }
    
    if (eligible) {
      earnedBadges.push({
        ...badge,
        earned: true,
        earnedDate: new Date().toISOString(),
      });
    }
  });
  
  return earnedBadges;
};