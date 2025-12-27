import { UserProfile, HealthRisk } from '../types';

class UserProfileService {
  private currentUser: UserProfile | null = null;

  async createProfile(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const profile: UserProfile = {
      ...profileData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('climoraUserProfile', JSON.stringify(profile));
    this.currentUser = profile;
    return profile;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No user profile found');
    }

    const updatedProfile: UserProfile = {
      ...this.currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('climoraUserProfile', JSON.stringify(updatedProfile));
    this.currentUser = updatedProfile;
    return updatedProfile;
  }

  getCurrentProfile(): UserProfile | null {
    if (!this.currentUser) {
      const saved = localStorage.getItem('climoraUserProfile');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    }
    return this.currentUser;
  }

  calculateHealthRisk(aqi: number, profile: UserProfile): HealthRisk {
    let baseScore = Math.min(aqi / 300, 1); // Normalize AQI to 0-1
    let riskFactors: string[] = [];
    let recommendations: string[] = [];

    // Age factor
    if (profile.age > 65) {
      baseScore += 0.2;
      riskFactors.push('Advanced age increases vulnerability');
      recommendations.push('Limit outdoor exposure during high pollution');
    } else if (profile.age < 18) {
      baseScore += 0.15;
      riskFactors.push('Children are more sensitive to air pollution');
      recommendations.push('Ensure indoor air quality is maintained');
    }

    // Medical conditions
    const respiratoryConditions = ['asthma', 'copd', 'bronchitis', 'lung disease'];
    const heartConditions = ['heart disease', 'hypertension', 'cardiovascular disease'];
    
    profile.medicalConditions.forEach(condition => {
      const lowerCondition = condition.toLowerCase();
      if (respiratoryConditions.some(rc => lowerCondition.includes(rc))) {
        baseScore += 0.3;
        riskFactors.push(`Respiratory condition: ${condition}`);
        recommendations.push('Use prescribed inhalers and avoid outdoor activities');
      }
      if (heartConditions.some(hc => lowerCondition.includes(hc))) {
        baseScore += 0.25;
        riskFactors.push(`Cardiovascular condition: ${condition}`);
        recommendations.push('Monitor heart rate and avoid strenuous activities');
      }
    });

    // Allergies
    if (profile.allergies.length > 0) {
      baseScore += 0.1;
      riskFactors.push('Allergies may worsen with poor air quality');
      recommendations.push('Take antihistamines as prescribed');
    }

    // Smoking status
    if (profile.smokingStatus === 'current') {
      baseScore += 0.2;
      riskFactors.push('Smoking significantly increases health risks');
      recommendations.push('Consider quitting smoking and avoid secondhand smoke');
    }

    // BMI calculation and factor
    const bmi = profile.weight / Math.pow(profile.height / 100, 2);
    if (bmi > 30) {
      baseScore += 0.1;
      riskFactors.push('Obesity increases vulnerability to air pollution');
      recommendations.push('Maintain indoor exercise routine during high pollution');
    }

    // Activity level
    if (profile.activityLevel === 'high' && aqi > 100) {
      baseScore += 0.1;
      riskFactors.push('High activity level increases exposure risk');
      recommendations.push('Reduce outdoor exercise intensity');
    }

    // Determine risk level
    const finalScore = Math.min(baseScore, 1);
    let level: HealthRisk['level'];
    let medicalAdvice: string | undefined;

    if (finalScore >= 0.8) {
      level = 'severe';
      medicalAdvice = 'Consult healthcare provider immediately if experiencing symptoms';
      recommendations.push('Stay indoors with air purification');
      recommendations.push('Have emergency medications readily available');
    } else if (finalScore >= 0.6) {
      level = 'high';
      medicalAdvice = 'Monitor symptoms closely and consult doctor if needed';
      recommendations.push('Wear N95 mask when outdoors');
      recommendations.push('Use air purifiers indoors');
    } else if (finalScore >= 0.3) {
      level = 'moderate';
      recommendations.push('Consider wearing a mask outdoors');
      recommendations.push('Limit prolonged outdoor activities');
    } else {
      level = 'low';
      recommendations.push('Normal activities are generally safe');
    }

    return {
      level,
      score: Math.round(finalScore * 100),
      factors: riskFactors,
      recommendations,
      medicalAdvice,
    };
  }

  logout(): void {
    localStorage.removeItem('climoraUserProfile');
    this.currentUser = null;
  }
}

export const userProfileService = new UserProfileService();