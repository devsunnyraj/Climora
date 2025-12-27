import React, { useState, useEffect } from 'react';
import { Trophy, Award, Target, Star, Calendar, Users, TrendingUp } from 'lucide-react';
import { Badge, Challenge, User } from '../types';
import { badges, challenges, calculateLevel, getPointsForNextLevel } from '../services/gamification';

const Gamification: React.FC = () => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Eco Warrior',
    email: 'user@example.com',
    totalEmissions: 280,
    badges: [],
    level: 1,
    points: 1250,
  });
  
  const [userBadges, setUserBadges] = useState<Badge[]>(badges);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>(challenges);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'challenges'>('overview');

  useEffect(() => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('climoraUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser({
        ...userData,
        level: calculateLevel(userData.points),
      });
    }
  }, []);

  useEffect(() => {
    // Save user data to localStorage
    localStorage.setItem('climoraUser', JSON.stringify(user));
  }, [user]);

  const completeChallenge = (challengeId: string) => {
    setUserChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, current: challenge.target }
        : challenge
    ));
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setUser(prev => ({
        ...prev,
        points: prev.points + challenge.reward,
        level: calculateLevel(prev.points + challenge.reward),
      }));
    }
  };

  const earnBadge = (badgeId: string) => {
    setUserBadges(prev => prev.map(badge => 
      badge.id === badgeId 
        ? { ...badge, earned: true, earnedDate: new Date().toISOString() }
        : badge
    ));
    
    setUser(prev => ({
      ...prev,
      points: prev.points + 100,
      level: calculateLevel(prev.points + 100),
    }));
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const earnedBadges = userBadges.filter(badge => badge.earned);
  const availableBadges = userBadges.filter(badge => !badge.earned);
  const activeChallenges = userChallenges.filter(challenge => !challenge.completed);
  const completedChallenges = userChallenges.filter(challenge => challenge.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Eco Achievements</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg">
            <div className="text-sm font-medium">Level {user.level}</div>
            <div className="text-xs opacity-90">{user.points} points</div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{user.level}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{user.points}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{completedChallenges.length}</div>
            <div className="text-sm text-gray-600">Challenges Completed</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress to Level {user.level + 1}</span>
            <span className="text-sm text-gray-500">{getPointsForNextLevel(user.points)} points to go</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((user.points % 1000) / 1000) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex space-x-1">
          {(['overview', 'badges', 'challenges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium capitalize transition-all ${
                selectedTab === tab
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Achievements</h2>
            </div>
            <div className="space-y-3">
              {earnedBadges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {badge.earnedDate && new Date(badge.earnedDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {earnedBadges.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  Complete activities to earn your first badge!
                </div>
              )}
            </div>
          </div>

          {/* Active Challenges */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Active Challenges</h2>
            </div>
            <div className="space-y-4">
              {activeChallenges.slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                    <div className="text-sm font-medium text-blue-600">{challenge.reward} pts</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{challenge.current} / {challenge.target} {challenge.unit}</span>
                      <span>{Math.round((challenge.current / challenge.target) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(challenge.current, challenge.target)}`}
                        style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => completeChallenge(challenge.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {selectedTab === 'badges' && (
        <div className="space-y-6">
          {/* Earned Badges */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Earned Badges ({earnedBadges.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    <div className="text-xs text-green-600 font-medium">
                      Earned {badge.earnedDate && new Date(badge.earnedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Badges */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Badges ({availableBadges.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBadges.map((badge) => (
                <div key={badge.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-75">
                  <div className="text-center">
                    <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    <button
                      onClick={() => earnBadge(badge.id)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded-full hover:bg-gray-700 transition-colors"
                    >
                      Unlock Badge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {selectedTab === 'challenges' && (
        <div className="space-y-6">
          {/* Active Challenges */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Challenges ({activeChallenges.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {challenge.reward} pts
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress: {challenge.current} / {challenge.target} {challenge.unit}</span>
                      <span className="font-medium">{Math.round((challenge.current / challenge.target) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(challenge.current, challenge.target)}`}
                        style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Due: {new Date(challenge.deadline).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => completeChallenge(challenge.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Complete Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Challenges */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Challenges ({completedChallenges.length})</h2>
            <div className="space-y-3">
              {completedChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">+{challenge.reward}</div>
                    <div className="text-xs text-gray-500">points earned</div>
                  </div>
                </div>
              ))}
              {completedChallenges.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No completed challenges yet. Start with an active challenge!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gamification;