import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../lib/api';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResearch: (idea: string) => void;
}

export function VoiceModal({ isOpen, onClose, onConfirmResearch }: VoiceModalProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setCurrentTranscript('');
      initSpeech();
      greetUser();
    } else {
      stopAll();
    }
    return () => stopAll();
  }, [isOpen]);

  const stopAll = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setVoiceState('idle');
  };

  const greetUser = () => {
    const greeting = "Hi there! Tell me about the project you want to build.";
    setMessages([{ role: 'ai', text: greeting }]);
    speak(greeting, () => {
      startListening();
    });
  };

  const initSpeech = () => {
    synthRef.current = window.speechSynthesis;

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setCurrentTranscript(interim);

        if (final) {
          handleUserUtterance(final);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setVoiceState('error');
        }
      };

      recognition.onend = () => {
        // Auto-restart if we should be listening but it died
        if (voiceState === 'listening') {
          try { recognition.start(); } catch(e){}
        }
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceState('error');
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setVoiceState('listening');
      } catch (e) {
        // Already started
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a good voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.onstart = () => setVoiceState('speaking');
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      synthRef.current.speak(utterance);
    }
  };

  const handleUserUtterance = async (text: string) => {
    if (!text.trim()) return;
    
    stopListening();
    setCurrentTranscript('');
    
    const newHistory = [...messages, { role: 'user' as const, text }];
    setMessages(newHistory);
    setVoiceState('processing');

    try {
      const response = await fetch(`${BACKEND_URL}/api/voice/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
      });

      const data = await response.json();
      
      if (data.confirmResearch && data.idea) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        speak(data.reply, () => {
          onConfirmResearch(data.idea);
          onClose();
        });
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        speak(data.reply, () => {
          startListening();
        });
      }
    } catch (err) {
      setVoiceState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl h-[600px] flex flex-col rounded-3xl border border-border/60 bg-white shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 bg-white/50 backdrop-blur text-muted-foreground hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white self-end shadow-glow' 
                    : 'bg-accent/50 text-foreground self-start'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              </motion.div>
            ))}
            
            {/* Live Transcript bubble */}
            {currentTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[80%] rounded-2xl px-5 py-4 bg-primary/20 text-primary self-end"
              >
                <p className="text-sm font-medium leading-relaxed animate-pulse">{currentTranscript}...</p>
              </motion.div>
            )}
            
            {/* Auto-scroll anchor */}
            <div className="h-4" />
          </div>

          {/* Visualizer Area */}
          <div className="h-40 bg-slate-50 flex flex-col items-center justify-center border-t border-border/50">
            <div className="relative flex h-16 w-16 items-center justify-center mb-2">
              {voiceState === 'listening' && (
                <>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 rounded-full bg-primary/20" />
                  <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="absolute inset-0 rounded-full bg-primary/10" />
                </>
              )}
              {voiceState === 'speaking' && (
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute inset-0 rounded-full bg-indigo-500/20" />
              )}
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
                voiceState === 'listening' ? 'bg-primary text-white shadow-glow' :
                voiceState === 'speaking' ? 'bg-indigo-500 text-white shadow-glow' :
                voiceState === 'processing' ? 'bg-amber-500 text-white' :
                'bg-accent text-primary'
              }`}>
                {voiceState === 'listening' ? <Mic className="h-5 w-5 animate-pulse" /> :
                 voiceState === 'speaking' ? <Volume2 className="h-5 w-5" /> :
                 voiceState === 'processing' ? <Loader2 className="h-5 w-5 animate-spin" /> :
                 <Mic className="h-5 w-5 opacity-50" />}
              </div>
            </div>
            
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {voiceState === 'listening' ? 'Listening...' :
               voiceState === 'speaking' ? 'AI is speaking...' :
               voiceState === 'processing' ? 'Thinking...' :
               voiceState === 'error' ? 'Error. Check Mic permissions.' : 'Ready'}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
