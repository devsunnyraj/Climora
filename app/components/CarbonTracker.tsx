import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Plus, Car, Zap, Utensils, Trash2, Target } from 'lucide-react';
import { CarbonActivity } from '../types';
import { 
  calculateTransportEmissions, 
  calculateEnergyEmissions, 
  calculateDietEmissions,
  getTotalEmissions,
  getEmissionsByCategory,
  getAverageEmissions
} from '../services/carbon';

const CarbonTracker: React.FC = () => {
  const [activities, setActivities] = useState<CarbonActivity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'transport' as 'transport' | 'energy' | 'diet',
    description: '',
    value: '',
    unit: 'km',
  });

  useEffect(() => {
    // Load activities from localStorage
    const savedActivities = localStorage.getItem('carbonActivities');
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    }
  }, []);

  useEffect(() => {
    // Save activities to localStorage
    localStorage.setItem('carbonActivities', JSON.stringify(activities));
  }, [activities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(formData.value);
    if (isNaN(value)) return;

    let emissions = 0;
    let unit = formData.unit;

    switch (formData.type) {
      case 'transport':
        emissions = calculateTransportEmissions(formData.description as any, value);
        unit = 'km';
        break;
      case 'energy':
        emissions = calculateEnergyEmissions(formData.description as any, value);
        unit = 'kWh';
        break;
      case 'diet':
        emissions = calculateDietEmissions(formData.description as any, value);
        unit = 'servings';
        break;
    }

    const newActivity: CarbonActivity = {
      id: Date.now().toString(),
      type: formData.type,
      description: formData.description,
      value,
      unit,
      emissions,
      date: new Date().toISOString(),
    };

    setActivities([newActivity, ...activities]);
    setFormData({ type: 'transport', description: '', value: '', unit: 'km' });
    setShowAddForm(false);
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const totalEmissions = getTotalEmissions(activities);
  const categoryEmissions = getEmissionsByCategory(activities);
  const averageEmissions = getAverageEmissions();
  const emissionsDifference = totalEmissions - (averageEmissions / 12); // Monthly comparison

  const pieData = {
    labels: ['Transport', 'Energy', 'Diet'],
    datasets: [
      {
        data: [categoryEmissions.transport, categoryEmissions.energy, categoryEmissions.diet],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Your Emissions',
        data: [320, 285, 310, 280, 295, totalEmissions],
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
      {
        label: 'Average Person',
        data: [400, 400, 400, 400, 400, 400],
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
      },
    ],
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transport': return <Car className="w-5 h-5 text-red-500" />;
      case 'energy': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'diet': return <Utensils className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Carbon Footprint Tracker</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalEmissions.toFixed(1)}</div>
              <div className="text-sm text-gray-600">kg CO₂ this month</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <Car className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{categoryEmissions.transport.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Transport</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{categoryEmissions.energy.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Energy</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <Utensils className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{categoryEmissions.diet.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Diet</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Card */}
      <div className={`rounded-xl shadow-lg p-6 ${
        emissionsDifference < 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Comparison</h3>
            <p className="text-gray-600">
              You're emitting {Math.abs(emissionsDifference).toFixed(1)} kg CO₂ {
                emissionsDifference < 0 ? 'less' : 'more'
              } than the average person this month.
            </p>
          </div>
          <div className={`text-3xl font-bold ${
            emissionsDifference < 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {emissionsDifference < 0 ? '-' : '+'}{Math.abs(emissionsDifference).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Emissions by Category</h2>
          <div className="h-64">
            <Pie data={pieData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Trend</h2>
          <div className="h-64">
            <Bar data={monthlyData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'kg CO₂',
                  },
                },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activities logged yet. Add your first activity to start tracking!
            </div>
          ) : (
            activities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {activity.description} - {activity.value} {activity.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-red-600">+{activity.emissions.toFixed(2)} kg CO₂</div>
                  </div>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Carbon Activity</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: e.target.value as 'transport' | 'energy' | 'diet',
                    description: '',
                    unit: e.target.value === 'transport' ? 'km' : e.target.value === 'energy' ? 'kWh' : 'servings'
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                >
                  <option value="transport">Transport</option>
                  <option value="energy">Energy</option>
                  <option value="diet">Diet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                <select
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                  required
                >
                  <option value="">Select activity</option>
                  {formData.type === 'transport' && (
                    <>
                      <option value="car">Car</option>
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                      <option value="plane">Plane</option>
                      <option value="bike">Bike</option>
                      <option value="walk">Walk</option>
                    </>
                  )}
                  {formData.type === 'energy' && (
                    <>
                      <option value="electricity">Electricity</option>
                      <option value="naturalGas">Natural Gas</option>
                    </>
                  )}
                  {formData.type === 'diet' && (
                    <>
                      <option value="beef">Beef</option>
                      <option value="pork">Pork</option>
                      <option value="chicken">Chicken</option>
                      <option value="fish">Fish</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="dairy">Dairy</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ({formData.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonTracker;