import { UserProfile } from '../types';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

class VoiceAssistantService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private language = 'en-US';
  private commands: VoiceCommand[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.initializeSpeechRecognition();
      this.setupCommands();
    }
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = this.language;

      this.recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        this.processCommand(transcript);
      };

      this.recognition.onerror = (event) => {
        // Speech recognition error
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  private setupCommands(): void {
    this.commands = [
      {
        command: 'what is the air quality',
        action: () => this.announceAirQuality(),
        description: 'Get current air quality information'
      },
      {
        command: 'should i wear a mask',
        action: () => this.provideMaskAdvice(),
        description: 'Get mask wearing recommendation'
      },
      {
        command: 'is it safe to exercise outside',
        action: () => this.provideExerciseAdvice(),
        description: 'Get outdoor exercise safety advice'
      },
      {
        command: 'show my health risk',
        action: () => this.announceHealthRisk(),
        description: 'Get personalized health risk assessment'
      },
      {
        command: 'find nearest hospital',
        action: () => this.findNearestHospital(),
        description: 'Locate nearest medical facilities'
      },
      {
        command: 'emergency help',
        action: () => this.provideEmergencyHelp(),
        description: 'Get emergency assistance information'
      },
      {
        command: 'weather forecast',
        action: () => this.announceWeatherForecast(),
        description: 'Get weather and air quality forecast'
      },
      {
        command: 'carbon footprint',
        action: () => this.announceCarbonFootprint(),
        description: 'Get carbon footprint information'
      }
    ];
  }

  setLanguage(lang: 'en' | 'hi'): void {
    this.language = lang === 'hi' ? 'hi-IN' : 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.language;
    }
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
      this.speak(this.language === 'hi-IN' ? 'मैं सुन रहा हूं' : 'I am listening');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, lang?: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || this.language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Find appropriate voice
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.lang === utterance.lang) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    this.synthesis.speak(utterance);
  }

  private processCommand(transcript: string): void {
    const matchedCommand = this.commands.find(cmd => 
      transcript.includes(cmd.command) || 
      this.fuzzyMatch(transcript, cmd.command)
    );

    if (matchedCommand) {
      matchedCommand.action();
    } else {
      const response = this.language === 'hi-IN' 
        ? 'मुझे समझ नहीं आया। कृपया दोबारा कहें।'
        : 'I did not understand that command. Please try again.';
      this.speak(response);
    }
  }

  private fuzzyMatch(input: string, command: string): boolean {
    const inputWords = input.split(' ');
    const commandWords = command.split(' ');
    const matchCount = commandWords.filter(word => 
      inputWords.some(inputWord => inputWord.includes(word) || word.includes(inputWord))
    ).length;
    return matchCount >= Math.ceil(commandWords.length * 0.6);
  }

  private announceAirQuality(): void {
    // This would integrate with the actual AQI data
    const mockAQI = 85;
    const response = this.language === 'hi-IN'
      ? `वर्तमान वायु गुणवत्ता सूचकांक ${mockAQI} है। यह मध्यम स्तर है।`
      : `The current Air Quality Index is ${mockAQI}. This is at a moderate level.`;
    this.speak(response);
  }

  private provideMaskAdvice(): void {
    const mockAQI = 85;
    const shouldWearMask = mockAQI > 100;
    const response = this.language === 'hi-IN'
      ? shouldWearMask 
        ? 'हां, बाहर जाते समय मास्क पहनना सुरक्षित होगा।'
        : 'वर्तमान में मास्क की आवश्यकता नहीं है, लेकिन सावधानी बरतें।'
      : shouldWearMask
        ? 'Yes, it would be safe to wear a mask when going outside.'
        : 'A mask is not currently required, but exercise caution.';
    this.speak(response);
  }

  private provideExerciseAdvice(): void {
    const mockAQI = 85;
    const isSafe = mockAQI < 100;
    const response = this.language === 'hi-IN'
      ? isSafe
        ? 'हां, बाहर व्यायाम करना सुरक्षित है।'
        : 'बाहर व्यायाम करने से बचें। घर के अंदर व्यायाम करें।'
      : isSafe
        ? 'Yes, it is safe to exercise outside.'
        : 'Avoid outdoor exercise. Consider indoor activities instead.';
    this.speak(response);
  }

  private announceHealthRisk(): void {
    const response = this.language === 'hi-IN'
      ? 'आपका स्वास्थ्य जोखिम मध्यम है। सावधानी बरतें और डॉक्टर की सलाह लें।'
      : 'Your health risk is moderate. Exercise caution and consult your doctor if needed.';
    this.speak(response);
  }

  private findNearestHospital(): void {
    const response = this.language === 'hi-IN'
      ? 'निकटतम अस्पताल 2 किलोमीटर दूर है। क्या आपको दिशा-निर्देश चाहिए?'
      : 'The nearest hospital is 2 kilometers away. Would you like directions?';
    this.speak(response);
  }

  private provideEmergencyHelp(): void {
    const response = this.language === 'hi-IN'
      ? 'आपातकाल में 108 डायल करें। निकटतम अस्पताल की जानकारी भेजी जा रही है।'
      : 'In emergency, dial 108. Sending nearest hospital information.';
    this.speak(response);
  }

  private announceWeatherForecast(): void {
    const response = this.language === 'hi-IN'
      ? 'आज का मौसम साफ है, तापमान 25 डिग्री। वायु गुणवत्ता मध्यम है।'
      : 'Today\'s weather is clear with temperature at 25 degrees. Air quality is moderate.';
    this.speak(response);
  }

  private announceCarbonFootprint(): void {
    const response = this.language === 'hi-IN'
      ? 'आपका मासिक कार्बन फुटप्रिंट 285 किलो है। यह औसत से कम है।'
      : 'Your monthly carbon footprint is 285 kilograms. This is below average.';
    this.speak(response);
  }

  getAvailableCommands(): VoiceCommand[] {
    return this.commands;
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const voiceAssistantService = new VoiceAssistantService();