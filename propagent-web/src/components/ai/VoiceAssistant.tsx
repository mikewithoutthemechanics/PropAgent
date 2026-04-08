'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Home, 
  Building2, 
  Users, 
  Wrench, 
  DollarSign, 
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  Sparkles,
  ArrowRight,
  Search,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface VoiceCommand {
  command: string;
  keywords: string[];
  action: () => void;
  icon: React.ReactNode;
  description: string;
}

interface VoiceAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function VoiceAssistant({ isOpen: externalOpen, onClose: externalClose }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(externalOpen ?? false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<{command: string; response: string}[]>([]);
  const [suggestedCommands, setSuggestedCommands] = useState<string[]>([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const router = useRouter();

  const commandExamples = [
    "Go to Properties",
    "Show me maintenance requests",
    "Find 3-bedroom apartments",
    "What's my revenue?",
    "Open tenants",
    "Create new property",
    "Show calendar",
    "Go to financials"
  ];

  const navigationCommands: VoiceCommand[] = [
    { command: 'go to properties', keywords: ['properties', 'property', 'listings'], action: () => router.push('/properties'), icon: <Building2 className="w-4 h-4" />, description: 'View all properties' },
    { command: 'go to tenants', keywords: ['tenants', 'tenant', 'renters'], action: () => router.push('/tenants'), icon: <Users className="w-4 h-4" />, description: 'Manage tenants' },
    { command: 'go to maintenance', keywords: ['maintenance', 'repairs', 'fix'], action: () => router.push('/maintenance'), icon: <Wrench className="w-4 h-4" />, description: 'View maintenance requests' },
    { command: 'go to financials', keywords: ['financials', 'revenue', 'money', 'income'], action: () => router.push('/financials'), icon: <DollarSign className="w-4 h-4" />, description: 'View financial overview' },
    { command: 'go to documents', keywords: ['documents', 'files', 'leases'], action: () => router.push('/documents'), icon: <FileText className="w-4 h-4" />, description: 'Manage documents' },
    { command: 'go to calendar', keywords: ['calendar', 'schedule', 'events'], action: () => router.push('/calendar'), icon: <Calendar className="w-4 h-4" />, description: 'View calendar' },
    { command: 'go to chat', keywords: ['chat', 'messages', 'conversations'], action: () => router.push('/chat'), icon: <MessageSquare className="w-4 h-4" />, description: 'Open messaging' },
    { command: 'go to notifications', keywords: ['notifications', 'alerts'], action: () => router.push('/notifications'), icon: <Bell className="w-4 h-4" />, description: 'View notifications' },
    { command: 'go to dashboard', keywords: ['dashboard', 'overview', 'home'], action: () => router.push('/dashboard'), icon: <Home className="w-4 h-4" />, description: 'Back to dashboard' },
    { command: 'go to valuations', keywords: ['valuations', 'valuation', 'appraisal'], action: () => router.push('/valuations'), icon: <DollarSign className="w-4 h-4" />, description: 'View valuations' },
    { command: 'go to rent ai', keywords: ['rent ai', 'rent suggestion', 'pricing'], action: () => router.push('/rent-ai'), icon: <Sparkles className="w-4 h-4" />, description: 'AI rent suggestions' },
    { command: 'go to matching', keywords: ['matching', 'tenant match'], action: () => router.push('/matching'), icon: <Users className="w-4 h-4" />, description: 'Tenant matching' },
  ];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current?.start();
          } catch {
            setIsListening(false);
          }
        }
      };
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, [isListening]);

  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    let matchedCommand: VoiceCommand | null = null;
    let responseText = '';

    for (const cmd of navigationCommands) {
      if (lowerText.includes(cmd.command) || cmd.keywords.some(k => lowerText.includes(k))) {
        matchedCommand = cmd;
        break;
      }
    }

    if (matchedCommand) {
      responseText = `Navigating to ${matchedCommand.description}...`;
      setTimeout(() => matchedCommand!.action(), 800);
    } else if (lowerText.includes('search') || lowerText.includes('find')) {
      if (lowerText.includes('bedroom')) {
        const beds = lowerText.match(/(\d+)\s*bedroom/)?.[1];
        responseText = beds ? `Searching for ${beds} bedroom properties...` : 'Searching properties...';
        setTimeout(() => router.push(`/properties?beds=${beds || 2}`), 800);
      } else {
        responseText = 'Opening properties page with search...';
        setTimeout(() => router.push('/properties'), 800);
      }
    } else if (lowerText.includes('revenue') || lowerText.includes('income') || lowerText.includes('earnings')) {
      responseText = 'Opening financials dashboard...';
      setTimeout(() => router.push('/financials'), 800);
    } else if (lowerText.includes('add') || lowerText.includes('create') || lowerText.includes('new')) {
      if (lowerText.includes('property')) {
        responseText = 'Creating new property...';
        setTimeout(() => router.push('/properties/new'), 800);
      } else {
        responseText = 'Opening properties page...';
        setTimeout(() => router.push('/properties'), 800);
      }
    } else if (lowerText.includes('help') || lowerText.includes('what can')) {
      responseText = 'You can say: "Go to properties", "Show maintenance", "Find 3 bedroom apartments", "What\'s my revenue", or any navigation command. Try the suggestions below!';
      setSuggestedCommands(commandExamples);
    } else {
      responseText = `I heard "${text}". Try saying "Go to properties", "Show maintenance", or "Find apartments".`;
    }

    setResponse(responseText);
    setCommandHistory(prev => [...prev, { command: text, response: responseText }]);
    setTranscript('');
  }, [router]);

  useEffect(() => {
    if (transcript) {
      processCommand(transcript);
    }
  }, [transcript, processCommand]);

  const toggleListening = () => {
    if (!speechSupported) {
      setResponse('Voice not supported. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      setTranscript('');
      setResponse(null);
      setSuggestedCommands([]);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setResponse('Could not start voice recognition');
      }
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setTranscript(cmd);
    setResponse(`Processing: ${cmd}...`);
  };

  const currentIsOpen = externalOpen !== undefined ? externalOpen : isOpen;
  const currentOnClose = externalClose || (() => setIsOpen(false));

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#D8F053] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
      >
        <Mic className="w-6 h-6 text-black" />
      </button>

      {/* Assistant Panel */}
      {currentIsOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-black p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D8F053] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span className="text-white font-semibold">PropAgent Voice</span>
            </div>
            <button onClick={currentOnClose} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {/* Status */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isListening ? "bg-red-500 animate-pulse" : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-black" />}
              </button>
              <div className="flex-1">
                {isListening ? (
                  <p className="text-sm text-gray-600">Listening: "{interimTranscript || '...'}"</p>
                ) : (
                  <p className="text-sm text-gray-500">Tap the mic and speak a command</p>
                )}
              </div>
            </div>

            {/* Response */}
            {response && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-sm text-gray-800">{response}</p>
              </div>
            )}

            {/* Command History */}
            {commandHistory.length > 0 && (
              <div className="space-y-2">
                {commandHistory.slice(-2).map((item, i) => (
                  <div key={i} className="text-xs text-gray-400">
                    <span className="font-medium">You:</span> {item.command}
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Commands */}
            {suggestedCommands.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Try saying:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedCommands.slice(0, 4).map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickCommand(cmd)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            ) : !response && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Quick commands:</p>
                <div className="flex flex-wrap gap-2">
                  {commandExamples.slice(0, 4).map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickCommand(cmd)}
                      className="text-xs bg-[#D8F053]/20 hover:bg-[#D8F053]/30 px-3 py-1.5 rounded-full transition-colors text-black"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default VoiceAssistant;