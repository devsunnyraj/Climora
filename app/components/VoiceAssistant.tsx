import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Settings } from 'lucide-react';
import { voiceAssistantService } from '../services/voiceAssistant';
import { userProfileService } from '../services/userProfile';

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showCommands, setShowCommands] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');

  useEffect(() => {
    // Load user preferences
    const profile = userProfileService.getCurrentProfile();
    if (profile?.preferences) {
      setIsEnabled(profile.preferences.voiceAssistant);
      setLanguage(profile.preferences.language);
      voiceAssistantService.setLanguage(profile.preferences.language);
    }

    // Monitor speech synthesis
    const checkSpeaking = () => {
      setIsSpeaking(window.speechSynthesis.speaking);
    };

    const interval = setInterval(checkSpeaking, 100);
    return () => clearInterval(interval);
  }, []);

  const toggleListening = () => {
    if (!isEnabled) return;

    if (isListening) {
      voiceAssistantService.stopListening();
      setIsListening(false);
    } else {
      voiceAssistantService.startListening();
      setIsListening(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const testVoice = () => {
    const message = language === 'hi' 
      ? 'नमस्ते! मैं आपका वॉयस असिस्टेंट हूं।'
      : 'Hello! I am your voice assistant.';
    voiceAssistantService.speak(message);
  };

  const commands = voiceAssistantService.getAvailableCommands();

  if (!isEnabled) {
    return (
      <div className="bg-gray-100 rounded-xl p-4 text-center">
        <MicOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">Voice Assistant is disabled</p>
        <p className="text-gray-500 text-xs">Enable in your profile settings</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Mic className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Voice Assistant</h2>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value as 'en' | 'hi';
              setLanguage(newLang);
              voiceAssistantService.setLanguage(newLang);
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>

        <button
          onClick={isSpeaking ? stopSpeaking : testVoice}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isSpeaking
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-6 h-6 text-white" />
          ) : (
            <Volume2 className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center mb-4">
        {isListening && (
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {language === 'hi' ? 'सुन रहा हूं...' : 'Listening...'}
            </span>
          </div>
        )}
        
        {isSpeaking && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'hi' ? 'बोल रहा हूं...' : 'Speaking...'}
            </span>
          </div>
        )}
        
        {!isListening && !isSpeaking && (
          <p className="text-gray-600 text-sm">
            {language === 'hi' 
              ? 'माइक बटन दबाकर बोलना शुरू करें'
              : 'Press the microphone button to start speaking'
            }
          </p>
        )}
      </div>

      {/* Last Command */}
      {lastCommand && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {language === 'hi' ? 'अंतिम कमांड:' : 'Last Command:'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{lastCommand}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => voiceAssistantService.speak(
            language === 'hi' 
              ? 'वर्तमान वायु गुणवत्ता सूचकांक 85 है।'
              : 'Current Air Quality Index is 85.'
          )}
          className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-100 transition-colors"
        >
          {language === 'hi' ? 'AQI बताएं' : 'Tell AQI'}
        </button>
        
        <button
          onClick={() => voiceAssistantService.speak(
            language === 'hi'
              ? 'बाहर जाते समय मास्क पहनना सुरक्षित होगा।'
              : 'It would be safe to wear a mask when going outside.'
          )}
          className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors"
        >
          {language === 'hi' ? 'मास्क सलाह' : 'Mask Advice'}
        </button>
        
        <button
          onClick={() => voiceAssistantService.speak(
            language === 'hi'
              ? 'निकटतम अस्पताल 2 किलोमीटर दूर है।'
              : 'The nearest hospital is 2 kilometers away.'
          )}
          className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-100 transition-colors"
        >
          {language === 'hi' ? 'अस्पताल खोजें' : 'Find Hospital'}
        </button>
        
        <button
          onClick={() => voiceAssistantService.speak(
            language === 'hi'
              ? 'आज का मौसम साफ है, तापमान 25 डिग्री।'
              : 'Today\'s weather is clear with temperature at 25 degrees.'
          )}
          className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm hover:bg-yellow-100 transition-colors"
        >
          {language === 'hi' ? 'मौसम बताएं' : 'Weather Info'}
        </button>
      </div>

      {/* Available Commands */}
      {showCommands && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-900 mb-3">
            {language === 'hi' ? 'उपलब्ध कमांड:' : 'Available Commands:'}
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {commands.map((command, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-900">
                  "{command.command}"
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {command.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;