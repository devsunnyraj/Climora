import { EducationalContent } from '../types';

class EducationalContentService {
  private content: EducationalContent[] = [
    {
      id: '1',
      title: 'Understanding Air Quality Index (AQI)',
      category: 'air-quality',
      level: 'beginner',
      readTime: 5,
      tags: ['AQI', 'basics', 'health'],
      lastUpdated: '2025-01-08',
      content: `
        The Air Quality Index (AQI) is a standardized way to communicate air pollution levels to the public. It ranges from 0 to 500, with higher values indicating worse air quality.

        **AQI Categories:**
        • 0-50 (Green): Good - Air quality is satisfactory
        • 51-100 (Yellow): Moderate - Acceptable for most people
        • 101-150 (Orange): Unhealthy for Sensitive Groups
        • 151-200 (Red): Unhealthy for everyone
        • 201-300 (Purple): Very Unhealthy
        • 301-500 (Maroon): Hazardous

        **Key Pollutants Measured:**
        • PM2.5 and PM10 (Particulate Matter)
        • Ozone (O₃)
        • Carbon Monoxide (CO)
        • Sulfur Dioxide (SO₂)
        • Nitrogen Dioxide (NO₂)

        Understanding AQI helps you make informed decisions about outdoor activities and health protection measures.
      `
    },
    {
      id: '2',
      title: 'Health Effects of Air Pollution',
      category: 'health',
      level: 'intermediate',
      readTime: 8,
      tags: ['health', 'pollution', 'respiratory'],
      lastUpdated: '2025-01-08',
      content: `
        Air pollution affects human health in both short-term and long-term ways. Understanding these effects helps you take appropriate protective measures.

        **Short-term Effects:**
        • Eye, nose, and throat irritation
        • Coughing and sneezing
        • Headaches and fatigue
        • Worsening of asthma symptoms
        • Reduced lung function

        **Long-term Effects:**
        • Chronic respiratory diseases
        • Cardiovascular problems
        • Reduced life expectancy
        • Increased cancer risk
        • Developmental issues in children

        **Vulnerable Groups:**
        • Children and elderly
        • People with asthma or COPD
        • Pregnant women
        • Individuals with heart disease
        • Outdoor workers

        **Protection Strategies:**
        • Monitor daily AQI levels
        • Use air purifiers indoors
        • Wear appropriate masks outdoors
        • Limit outdoor activities during high pollution
        • Maintain good indoor air quality
      `
    },
    {
      id: '3',
      title: 'Carbon Footprint and Climate Change',
      category: 'environment',
      level: 'intermediate',
      readTime: 10,
      tags: ['carbon', 'climate', 'sustainability'],
      lastUpdated: '2025-01-08',
      content: `
        Your carbon footprint is the total amount of greenhouse gases produced directly and indirectly by your activities, measured in CO₂ equivalents.

        **Major Sources of Personal Carbon Emissions:**
        • Transportation (cars, flights, public transport)
        • Home energy use (electricity, heating, cooling)
        • Food consumption (especially meat and dairy)
        • Consumer goods and services
        • Waste production

        **Global Impact:**
        • Average global carbon footprint: 4 tons CO₂/year
        • Target for climate stability: 2.3 tons CO₂/year
        • Current US average: 16 tons CO₂/year

        **Reduction Strategies:**
        • Use public transportation or electric vehicles
        • Improve home energy efficiency
        • Adopt plant-based diet options
        • Reduce, reuse, and recycle
        • Choose renewable energy sources
        • Support sustainable businesses

        **Why It Matters:**
        Reducing carbon footprints is crucial for limiting global warming to 1.5°C and preventing catastrophic climate change effects.
      `
    },
    {
      id: '4',
      title: 'Indoor Air Quality Management',
      category: 'health',
      level: 'beginner',
      readTime: 6,
      tags: ['indoor', 'air quality', 'home'],
      lastUpdated: '2025-01-08',
      content: `
        Indoor air quality can be 2-5 times worse than outdoor air. Here's how to improve it:

        **Common Indoor Pollutants:**
        • Dust and pet dander
        • Volatile Organic Compounds (VOCs)
        • Mold and mildew
        • Cooking fumes
        • Cleaning product chemicals
        • Tobacco smoke

        **Improvement Strategies:**
        • Use HEPA air purifiers
        • Ensure proper ventilation
        • Control humidity (30-50%)
        • Use natural cleaning products
        • Add air-purifying plants
        • Regular HVAC maintenance

        **Air-Purifying Plants:**
        • Snake Plant (Sansevieria)
        • Spider Plant (Chlorophytum comosum)
        • Peace Lily (Spathiphyllum)
        • Rubber Plant (Ficus elastica)
        • Aloe Vera

        **Quick Tips:**
        • Open windows when outdoor air is clean
        • Use exhaust fans while cooking
        • Keep humidity levels optimal
        • Replace air filters regularly
        • Avoid synthetic fragrances
      `
    },
    {
      id: '5',
      title: 'Sustainable Transportation Choices',
      category: 'sustainability',
      level: 'beginner',
      readTime: 7,
      tags: ['transport', 'sustainability', 'carbon'],
      lastUpdated: '2025-01-08',
      content: `
        Transportation accounts for about 29% of greenhouse gas emissions. Making sustainable choices can significantly reduce your carbon footprint.

        **Transportation Carbon Emissions (per km):**
        • Walking/Cycling: 0g CO₂
        • Electric Bus: 89g CO₂
        • Train: 41g CO₂
        • Car (gasoline): 210g CO₂
        • Airplane: 255g CO₂

        **Sustainable Options:**
        • Walking and cycling for short distances
        • Public transportation
        • Electric or hybrid vehicles
        • Carpooling and ride-sharing
        • Remote work when possible
        • Combining trips efficiently

        **Benefits Beyond Environment:**
        • Cost savings on fuel and maintenance
        • Improved physical health
        • Reduced traffic congestion
        • Better air quality in cities
        • Enhanced community connections

        **Making the Switch:**
        • Start with one day per week
        • Plan routes using public transport apps
        • Consider e-bikes for longer distances
        • Join local cycling or walking groups
        • Advocate for better public transport
      `
    },
    {
      id: '6',
      title: 'Emergency Preparedness for Air Quality Events',
      category: 'health',
      level: 'advanced',
      readTime: 12,
      tags: ['emergency', 'health', 'preparedness'],
      lastUpdated: '2025-01-08',
      content: `
        Severe air pollution events require immediate action to protect your health. Here's how to prepare and respond:

        **Emergency Situations:**
        • Wildfire smoke events
        • Industrial accidents
        • Dust storms
        • Smog episodes
        • Chemical spills

        **Immediate Actions (AQI > 200):**
        • Stay indoors with windows and doors closed
        • Use air purifiers on high setting
        • Avoid outdoor activities completely
        • Wear N95 or P100 masks if you must go outside
        • Seek medical attention if experiencing symptoms

        **Emergency Kit Essentials:**
        • N95 or P100 masks for all family members
        • Portable air purifier
        • Emergency medications (inhalers, etc.)
        • Battery-powered radio for updates
        • Sealed food and water supplies
        • First aid supplies

        **Vulnerable Population Actions:**
        • Have evacuation plan ready
        • Keep emergency contacts updated
        • Maintain medication supplies
        • Consider temporary relocation
        • Monitor health symptoms closely

        **Recovery Phase:**
        • Wait for official all-clear
        • Gradually resume outdoor activities
        • Clean indoor surfaces thoroughly
        • Replace air filters
        • Monitor health for delayed effects
      `
    }
  ];

  getContent(category?: string, level?: string): EducationalContent[] {
    let filtered = this.content;

    if (category) {
      filtered = filtered.filter(content => content.category === category);
    }

    if (level) {
      filtered = filtered.filter(content => content.level === level);
    }

    return filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  getContentById(id: string): EducationalContent | null {
    return this.content.find(content => content.id === id) || null;
  }

  searchContent(query: string): EducationalContent[] {
    const lowercaseQuery = query.toLowerCase();
    return this.content.filter(content => 
      content.title.toLowerCase().includes(lowercaseQuery) ||
      content.content.toLowerCase().includes(lowercaseQuery) ||
      content.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  getCategories(): string[] {
    return [...new Set(this.content.map(content => content.category))];
  }

  getLevels(): string[] {
    return [...new Set(this.content.map(content => content.level))];
  }

  getRecommendedContent(userProfile: any): EducationalContent[] {
    // Recommend content based on user profile
    const recommendations: EducationalContent[] = [];

    // For users with medical conditions, prioritize health content
    if (userProfile?.medicalConditions?.length > 0) {
      recommendations.push(...this.getContent('health'));
    }

    // For beginners, start with basic content
    if (!userProfile || userProfile.isNewUser) {
      recommendations.push(...this.getContent(undefined, 'beginner'));
    }

    // Remove duplicates and limit to 6 items
    const unique = recommendations.filter((content, index, self) => 
      index === self.findIndex(c => c.id === content.id)
    );

    return unique.slice(0, 6);
  }
}

export const educationalContentService = new EducationalContentService();