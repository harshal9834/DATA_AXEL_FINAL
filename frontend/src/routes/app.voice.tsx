import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { 
  Mic, Square, VolumeX, Settings, Globe, Loader2, Sparkles, BrainCircuit, 
  Send, Paperclip, FileCode2, Copy, RefreshCw, Sun, Moon, ChevronDown, LayoutTemplate 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io, { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { auth } from '../firebase/firebase';
import { BACKEND_URL } from '../lib/api';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const Route = createFileRoute('/app/voice')({
  component: SplitWorkspaceRoute,
});

type StatusType = 'Pending' | 'Running' | 'Completed' | 'Failed';

function SplitWorkspaceRoute() {
  const { language, speechLanguage, setLanguage } = useLanguage();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string, id: string }[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isResearchComplete, setIsResearchComplete] = useState(false);
  const [idea, setIdea] = useState<string>('');
  const [inputText, setInputText] = useState('');

  // Keep state for backend compatibility so socket events work
  const [workflowStages, setWorkflowStages] = useState<Record<string, StatusType>>({
    'Research': 'Pending', 'Innovation': 'Pending', 'Architecture': 'Pending',
    'Backend': 'Pending', 'Frontend': 'Pending', 'Documentation': 'Pending', 'Analysis': 'Pending'
  });
  const [mcpStatuses, setMcpStatuses] = useState<Record<string, StatusType>>({
    'GitHub': 'Pending', 'Context7': 'Pending', 'Firecrawl': 'Pending', 'Tavily': 'Pending', 'Serper': 'Pending'
  });

  const { state: status, errorMsg, startListening, stopListening, speak, stopAll } = useVoiceAI({
    language: speechLanguage,  // Full BCP-47 locale code (e.g. 'hi-IN', 'ta-IN')
    onTranscriptChange: (interim, final) => {
      setCurrentTranscript(interim);
    },
    onUserMessage: (text) => {
      setCurrentTranscript('');
      setMessages(prev => [...prev, { role: 'user', text, id: Math.random().toString() }]);
      socketRef.current?.emit('voice_message', { text });
    }
  });

  const socketRef = useRef<Socket | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Handle auto-scroll
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  useEffect(() => {
    const savedMessages = sessionStorage.getItem('voice_messages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    const savedIdea = sessionStorage.getItem('voice_idea');
    if (savedIdea) setIdea(savedIdea);
    const savedWorkflow = sessionStorage.getItem('voice_workflow');
    if (savedWorkflow) setWorkflowStages(JSON.parse(savedWorkflow));
    const savedMcp = sessionStorage.getItem('voice_mcp');
    if (savedMcp) setMcpStatuses(JSON.parse(savedMcp));
    const savedResearchComplete = sessionStorage.getItem('voice_research_complete');
    if (savedResearchComplete) setIsResearchComplete(savedResearchComplete === 'true');
  }, []);

  useEffect(() => {
    sessionStorage.setItem('voice_messages', JSON.stringify(messages));
    if (idea) sessionStorage.setItem('voice_idea', idea);
    sessionStorage.setItem('voice_workflow', JSON.stringify(workflowStages));
    sessionStorage.setItem('voice_mcp', JSON.stringify(mcpStatuses));
    sessionStorage.setItem('voice_research_complete', isResearchComplete.toString());
  }, [messages, idea, workflowStages, mcpStatuses, isResearchComplete]);

  useEffect(() => {
    const socket = io(`${BACKEND_URL}/voice-assistant`, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') socket.connect();
    });

    socket.on('workflow_update', (data: { stage: string, status: StatusType }) => {
      setWorkflowStages(prev => ({ ...prev, [data.stage]: data.status }));
    });

    socket.on('mcp_status', (data: { provider: string, status: StatusType }) => {
      setMcpStatuses(prev => ({ ...prev, [data.provider]: data.status }));
    });

    socket.on('voice_reply', (data: { reply: string, confirmResearch: boolean, workflowId?: string }) => {
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply, id: Math.random().toString() }]);
      speak(data.reply);
      if (data.confirmResearch) setIsResearchComplete(true);
      if (data.workflowId) {
        sessionStorage.setItem('voice_workspace_id', data.workflowId);
        if (!sessionStorage.getItem('voice_idea')) sessionStorage.setItem('voice_idea', data.workflowId);
      }
    });

    socket.on('research_complete', (data: { summary: string, idea: string }) => {
      setIdea(data.idea);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('workflow_update');
      socket.off('mcp_status');
      socket.off('voice_reply');
      socket.off('research_complete');
      socket.disconnect();
      stopAll();
    };
  }, []);

  useEffect(() => {
    if (errorMsg) toast.error(errorMsg);
  }, [errorMsg]);

  useEffect(() => {
    if (isResearchComplete) {
      const cachedWorkflowId = sessionStorage.getItem('voice_workspace_id');
      if (cachedWorkflowId) {
        toast.success("Workspace ready!", { position: 'top-center' });
        // Can add a button to navigate, or just let user click the generated link if any
      }
    }
  }, [isResearchComplete]);

  const handleMicClick = () => {
    if (status === 'IDLE' || status === 'ERROR') {
      const greeting = language === 'hi' ? "नमस्ते, मैं सुन रहा हूँ।" : "Hi! I'm listening.";
      speak(greeting);
    } else if (status === 'SPEAKING' || status === 'THINKING') {
      startListening();
    } else {
      stopListening();
    }
  };

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputText, id: Math.random().toString() }]);
    socketRef.current?.emit('voice_message', { text: inputText });
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const getOrbVariants = (): any => {
    return {
      idle: {
        scale: [1, 1.05, 1],
        boxShadow: ["0px 0px 40px rgba(59,130,246,0.3)", "0px 0px 80px rgba(59,130,246,0.5)", "0px 0px 40px rgba(59,130,246,0.3)"],
        transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
      },
      listening: {
        scale: [1, 1.2, 1],
        boxShadow: ["0px 0px 60px rgba(59,130,246,0.6)", "0px 0px 120px rgba(59,130,246,0.8)", "0px 0px 60px rgba(59,130,246,0.6)"],
        transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
      },
      thinking: {
        rotate: [0, 360],
        scale: [1.1, 1.15, 1.1],
        boxShadow: ["0px 0px 80px rgba(168,85,247,0.6)", "0px 0px 100px rgba(236,72,153,0.6)", "0px 0px 80px rgba(168,85,247,0.6)"],
        transition: { rotate: { repeat: Infinity, duration: 8, ease: "linear" }, scale: { repeat: Infinity, duration: 2 } }
      },
      speaking: {
        scale: [1.1, 1.4, 1.15, 1.3, 1.1],
        boxShadow: ["0px 0px 80px rgba(16,185,129,0.5)", "0px 0px 140px rgba(16,185,129,0.8)", "0px 0px 80px rgba(16,185,129,0.5)"],
        transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
      }
    };
  };

  const getOrbGradient = () => {
    switch(status) {
      case 'LISTENING': return 'from-[#3B82F6] to-[#60A5FA]';
      case 'THINKING': return 'from-[#A855F7] to-[#EC4899]';
      case 'SPEAKING': return 'from-[#10B981] to-[#34D399]';
      default: return 'from-[#1E3A8A] to-[#3B82F6]'; // IDLE
    }
  };

  // Format AI Document Cards
  const formatDocumentCard = (text: string) => {
    return (
      <div className="w-full bg-[#18181B] border border-[#27272A] rounded-xl shadow-lg overflow-hidden group">
        <div className="bg-[#27272A]/50 border-b border-[#3F3F46]/50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-[#A1A1AA]" />
            <span className="text-xs font-semibold text-[#E4E4E7] tracking-wide uppercase">AI Artifact</span>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex items-center gap-1 text-[11px] font-medium text-[#A1A1AA] hover:text-white transition bg-[#3F3F46]/50 px-2 py-1 rounded">
              <Copy className="h-3 w-3" /> Copy
            </button>
            <button className="flex items-center gap-1 text-[11px] font-medium text-[#A1A1AA] hover:text-white transition bg-[#3F3F46]/50 px-2 py-1 rounded">
              <RefreshCw className="h-3 w-3" /> Regenerate
            </button>
          </div>
        </div>
        <div className="p-5 text-[14px] text-[#E4E4E7] leading-relaxed whitespace-pre-wrap font-mono">
          {text}
        </div>
      </div>
    );
  };

  const formatUserMessage = (text: string) => {
    return (
      <div className="w-full flex justify-end">
        <div className="max-w-[85%] bg-[#27272A] border border-[#3F3F46] rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
          <div className="text-[15px] text-[#E4E4E7] leading-relaxed font-sans">
            {text}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-[#09090B] text-white overflow-hidden font-sans selection:bg-[#3B82F6]/30">
      
      {/* Top Navigation Bar */}
      <header className="shrink-0 h-14 flex items-center justify-between px-6 bg-[#09090B] border-b border-[#27272A] z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-[#3B82F6]" />
            <h1 className="font-semibold text-sm tracking-wide text-[#E4E4E7]">AI Mentor OS</h1>
          </div>
          <div className="h-4 w-[1px] bg-[#27272A] mx-2"></div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] cursor-pointer hover:text-white transition">
            Project Alpha <ChevronDown className="h-3 w-3" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-medium text-[#A1A1AA]">
            <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" /> GPT-4o
          </div>
          <LanguageSwitcher />
          <button className="text-[#A1A1AA] hover:text-white transition">
            <Moon className="h-4 w-4" />
          </button>
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center text-white font-bold text-[10px] shadow-sm cursor-pointer hover:shadow-md transition">
            {auth.currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        
        {/* LEFT PANEL: Conversation & Workspace (50%) */}
        <div className="w-full lg:w-1/2 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-[#27272A] bg-[#09090B] relative">
          
          {/* Document / Chat Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 scroll-smooth" ref={transcriptRef}>
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
              
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] opacity-60">
                  <LayoutTemplate className="h-12 w-12 text-[#3F3F46] mb-4" />
                  <p className="text-[#A1A1AA] text-sm">Conversation and documents will appear here.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="w-full">
                    {msg.role === 'user' ? formatUserMessage(msg.text) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                        {formatDocumentCard(msg.text)}
                      </motion.div>
                    )}
                  </div>
                ))
              )}

              {/* Streaming state on the left panel for visual continuity */}
              <AnimatePresence>
                {(status === 'THINKING' || currentTranscript) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full mt-2">
                    <div className="w-full bg-[#18181B] border border-[#27272A] border-dashed rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide">
                        {status === 'THINKING' ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin text-[#A855F7]" /> Synthesizing Artifact...</>
                        ) : (
                          <><Mic className="h-3.5 w-3.5 animate-pulse text-[#3B82F6]" /> Listening...</>
                        )}
                      </div>
                      {currentTranscript && (
                        <p className="text-[14px] text-[#E4E4E7] font-sans leading-relaxed">
                          {currentTranscript}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Sticky Cursor-style Composer */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex flex-col p-1">
              <div className="flex items-end px-2 py-2 gap-2">
                <button className="p-2.5 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg transition mb-0.5">
                  <Paperclip className="h-4 w-4" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or request a feature..."
                  className="flex-1 bg-transparent resize-none outline-none py-2.5 px-1 text-[14.5px] placeholder:text-[#71717A] text-[#E4E4E7] max-h-[300px] leading-relaxed font-sans"
                  rows={1}
                />
                <button 
                  onClick={handleTextSubmit}
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-lg transition mb-0.5 flex items-center justify-center ${inputText.trim() ? 'bg-[#E4E4E7] text-black hover:bg-white' : 'bg-[#27272A] text-[#71717A]'}`}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT PANEL: Live AI Voice Agent (50%) */}
        <div className="w-full lg:w-1/2 h-full relative flex flex-col items-center justify-center bg-[#030712] overflow-hidden">
          
          {/* Background Ambient Glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#A855F7] rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Animated AI Orb */}
          <div className="relative flex items-center justify-center h-[280px] w-[280px] z-10 mb-8">
            <AnimatePresence>
              {status === 'LISTENING' && (
                <>
                  <motion.div 
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-[#3B82F6]/50"
                  />
                  <motion.div 
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.6 }}
                    className="absolute inset-0 rounded-full border border-[#3B82F6]/30"
                  />
                </>
              )}
            </AnimatePresence>

            <motion.div
              variants={getOrbVariants()}
              initial="idle"
              animate={status.toLowerCase()}
              className={`relative h-[180px] w-[180px] rounded-full bg-gradient-to-tr ${getOrbGradient()} flex items-center justify-center shadow-2xl`}
            >
              <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm shadow-inner mix-blend-overlay"></div>
            </motion.div>
          </div>

          {/* Live Transcript / Status */}
          <div className="w-full max-w-md px-6 text-center z-10 h-24 flex flex-col items-center justify-start">
            <motion.div 
              key={status === 'LISTENING' ? currentTranscript : status}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xl font-light tracking-wide leading-relaxed ${
                status === 'LISTENING' ? 'text-white' : 
                status === 'THINKING' ? 'text-white/60 animate-pulse' : 
                status === 'IDLE' ? 'text-white/40' : 'text-white/90'
              }`}
            >
              {status === 'LISTENING' ? (currentTranscript || "Listening...") :
               status === 'THINKING' ? "Thinking..." :
               status === 'SPEAKING' ? "Speaking..." : "Ready"}
            </motion.div>
            
            <div className="mt-3 text-[10px] font-bold tracking-widest uppercase text-white/30">
              {status}
            </div>
          </div>

          {/* Floating Bottom Controls */}
          <div className="absolute bottom-10 z-20 w-full flex justify-center">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
              
              <button 
                onClick={handleMicClick}
                className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 ${
                  status === 'LISTENING' || status === 'SPEAKING' || status === 'THINKING'
                    ? 'bg-white text-black' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
              
              <button 
                onClick={stopAll}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-white/5 text-white hover:bg-[#EF4444]/20 hover:text-[#EF4444] transition-all duration-300"
              >
                <Square className="h-4 w-4 fill-current" />
              </button>

              <div className="w-[1px] h-6 bg-white/20 mx-1"></div>

              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-transparent text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300">
                <VolumeX className="h-4 w-4" />
              </button>
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-transparent text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300">
                <Globe className="h-4 w-4" />
              </button>
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-transparent text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300">
                <Settings className="h-4 w-4" />
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
