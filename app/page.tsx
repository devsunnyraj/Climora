'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud, BarChart3, Calculator, Trophy, FileText,
  Menu, X, User, Mic, BookOpen, Shield, Moon, Sun, LogOut
} from 'lucide-react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';

import Dashboard from '@/components/Dashboard';
import Predictions from '@/components/Predictions';
import CarbonTracker from '@/components/CarbonTracker';
import Gamification from '@/components/Gamification';
import Reports from '@/components/Reports';
import UserProfileComponent from '@/components/UserProfile';
import VoiceAssistant from '@/components/VoiceAssistant';
import EmergencyServices from '@/components/EmergencyServices';
import { useAuth } from '@/context/AuthContext';

/* ---------------- Guard for protected tabs ---------------- */
function Guarded({ children }: { children: JSX.Element }) {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center transition-colors">
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center transition-colors">
        <p className="text-gray-700 dark:text-gray-300 mb-2">Please log in to access this feature.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the Login tab above.</p>
      </div>
    );
  }
  return children;
}

/* ---------------- Inline auth pages with Clerk components ---------------- */
function AuthLogin({ onSuccess }: { onSuccess: () => void }) {
  const { isSignedIn } = useAuth();
  
  React.useEffect(() => {
    if (isSignedIn) {
      onSuccess();
    }
  }, [isSignedIn, onSuccess]);
  
  return (
    <div className="max-w-md mx-auto">
      <SignIn />
    </div>
  );
}

function AuthRegister({ onSuccess }: { onSuccess: () => void }) {
  const { isSignedIn } = useAuth();
  
  React.useEffect(() => {
    if (isSignedIn) {
      onSuccess();
    }
  }, [isSignedIn, onSuccess]);
  
  return (
    <div className="max-w-md mx-auto">
      <SignUp />
    </div>
  );
}

/* ---------------- Main App ---------------- */
export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, isSignedIn, isLoaded, logout } = useAuth();
  const { user: clerkUser } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    setIsDarkMode(saved ? JSON.parse(saved) : false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-redirect to dashboard when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn && (activeTab === 'login' || activeTab === 'register')) {
      console.log('✅ User signed in, redirecting to dashboard');
      setActiveTab('dashboard');
    }
  }, [isLoaded, isSignedIn, activeTab]);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, protected: true },
    { id: 'predictions', name: 'AI Predictions', icon: Cloud, protected: false },
    { id: 'carbon', name: 'Carbon Tracker', icon: Calculator, protected: true },
    { id: 'achievements', name: 'Achievements', icon: Trophy, protected: true },
    { id: 'reports', name: 'Reports', icon: FileText, protected: true },
    { id: 'voice', name: 'Voice Assistant', icon: Mic, protected: false },
    { id: 'education', name: 'Learn', icon: BookOpen, protected: false },
    { id: 'emergency', name: 'Emergency', icon: Shield, protected: false },
    // auth tabs (public-only)
    { id: 'login', name: 'Login', icon: User, auth: true },
    { id: 'register', name: 'Register', icon: User, auth: true },
  ];

  const renderContent = () => {
    const protect = (el: JSX.Element) => <Guarded>{el}</Guarded>;
    switch (activeTab) {
      case 'dashboard':   return protect(<Dashboard />);
      case 'predictions': return <Predictions />;
      case 'carbon':      return protect(<CarbonTracker />);
      case 'achievements':return protect(<Gamification />);
      case 'reports':     return protect(<Reports />);
      case 'profile':     return protect(<UserProfileComponent />);
      case 'voice':       return <VoiceAssistant />;
      case 'education':   return <div>Educational content coming soon...</div>;
      case 'emergency':   return <EmergencyServices />;
      case 'login':       return <AuthLogin onSuccess={() => setActiveTab('dashboard')} />;
      case 'register':    return <AuthRegister onSuccess={() => setActiveTab('dashboard')} />;
      default:            return protect(<Dashboard />);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-full mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Climora</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">AI Powered</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-0.5 flex-1 justify-center">
              {navigation
                .filter(item => {
                  if (item.auth && isSignedIn) return false;
                  if (item.protected && !isSignedIn) return false;
                  return true;
                })
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === item.id
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
            </nav>

            {/* Right side: dark mode toggle & profile menu */}
            <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {isSignedIn && clerkUser && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={clerkUser.imageUrl}
                      alt={clerkUser.firstName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <img
                            src={clerkUser.imageUrl}
                            alt={clerkUser.firstName || 'User'}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {clerkUser.firstName && clerkUser.lastName 
                                ? `${clerkUser.firstName} ${clerkUser.lastName}`
                                : clerkUser.firstName || clerkUser.username || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {clerkUser.primaryEmailAddress?.emailAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setActiveTab('login');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation
                .filter(item => {
                  if (item.auth && isSignedIn) return false;
                  if (item.protected && !isSignedIn) return false;
                  return true;
                })
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-all ${
                        activeTab === item.id
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              {isSignedIn && clerkUser && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <img
                      src={clerkUser.imageUrl}
                      alt={clerkUser.firstName || 'User'}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {clerkUser.firstName && clerkUser.lastName 
                          ? `${clerkUser.firstName} ${clerkUser.lastName}`
                          : clerkUser.firstName || clerkUser.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {clerkUser.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                    className="w-full mt-2 px-3 py-2 rounded-md text-base font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => { logout(); setActiveTab('login'); setIsMobileMenuOpen(false); }}
                    className="w-full mt-2 px-3 py-2 rounded-md text-base font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 sm:px-4 py-6 transition-colors">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">Climora</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
                AI-powered platform combining real-time pollution monitoring with carbon footprint tracking
                and gamification to promote environmental awareness and sustainable living.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Real-time AQI monitoring</li>
                <li>AI pollution predictions</li>
                <li>Carbon footprint tracking</li>
                <li>Achievement system</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Data Sources</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>OpenWeatherMap API</li>
                <li>AQI.earth</li>
                <li>TensorFlow.js</li>
                <li>Real-time sensors</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Climora. Built with AI-powered environmental intelligence.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Powered by TensorFlow.js & Chart.js
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
