import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Rocket, Loader2, CheckCircle2, Circle, XCircle, Activity, Globe, Database, Cpu, Github, LayoutTemplate, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io, { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { auth } from '../firebase/firebase';
import { BACKEND_URL } from '../lib/api';

export const Route = createFileRoute('/app/voice')({
  component: VoiceAssistantRoute,
});

type StatusType = 'Pending' | 'Running' | 'Completed' | 'Failed';

function VoiceAssistantRoute() {
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR'>('IDLE');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string, id: string }[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isResearchComplete, setIsResearchComplete] = useState(false);
  const [idea, setIdea] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [workflowStages, setWorkflowStages] = useState<Record<string, StatusType>>({
    'Research': 'Pending',
    'Innovation': 'Pending',
    'Architecture': 'Pending',
    'Backend': 'Pending',
    'Frontend': 'Pending',
    'Documentation': 'Pending',
    'Analysis': 'Pending'
  });

  const [mcpStatuses, setMcpStatuses] = useState<Record<string, StatusType>>({
    'GitHub': 'Pending',
    'Context7': 'Pending',
    'Firecrawl': 'Pending',
    'Tavily': 'Pending',
    'Serper': 'Pending'
  });

  const socketRef = useRef<Socket | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  // Ref to track speaking state without stale closures (prevents feedback loop)
  const isSpeakingRef = useRef(false);
  const navigate = useNavigate();

  // Load session storage on mount
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

  // Save session storage on change
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
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to AI Mentor socket');
      setStatus(prev => prev === 'ERROR' ? 'IDLE' : prev);
      toast.dismiss('socket_error');
    });
    
    socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
      setStatus('ERROR');
      toast.error('Connection lost. Reconnecting...', { id: 'socket_error' });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setStatus('ERROR');
    });
    
    socket.on('reconnect_attempt', (attempt) => {
      toast.loading(`Reconnecting... (Attempt ${attempt})`, { id: 'socket_error' });
    });

    socket.on('ai_status', (data: { status: string }) => {
      if (data.status === 'Thinking...') setStatus('THINKING');
      if (data.status === 'Listening...') setStatus('LISTENING');
      if (data.status === 'Researching' || data.status === 'Innovating' || data.status === 'Designing' || data.status === 'Completed' || data.status === 'ERROR') {
         // Just visual updates, handled in other panels
      }
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
      if (data.confirmResearch) {
        setIsResearchComplete(true);
      }
      if (data.workflowId) {
        // Show workspace button with the workflow ID
        sessionStorage.setItem('voice_workspace_id', data.workflowId);
        const savedIdea2 = sessionStorage.getItem('voice_idea');
        if (!savedIdea2) sessionStorage.setItem('voice_idea', data.workflowId);
      }
    });

    socket.on('research_complete', (data: { summary: string, idea: string }) => {
      setIdea(data.idea);
    });

    initSpeech();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect_attempt');
      socket.off('ai_status');
      socket.off('voice_reply');
      socket.off('workflow_update');
      socket.off('mcp_status');
      socket.off('research_complete');
      socket.disconnect();
      stopAll();
    };
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  const initSpeech = () => {
    synthRef.current = window.speechSynthesis;
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = () => synthRef.current?.getVoices();
    }

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

        // Interruption Logic
        if ((interim.trim() || final.trim()) && isSpeakingRef.current) {
           console.log('User interruption detected!');
           isSpeakingRef.current = false;
           if (synthRef.current) synthRef.current.cancel();
           socketRef.current?.emit('voice_interrupt');
           setStatus('LISTENING');
        }

        setCurrentTranscript(interim);

        if (final) {
          handleUserUtterance(final);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setStatus('ERROR');
          toast.error("Microphone access denied. Please allow permissions.");
        }
      };

      recognition.onend = () => {
        // Use ref (not stale state) to prevent restarting while the AI is speaking
        if (!isSpeakingRef.current) {
          try { recognition.start(); } catch(e){}
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast.error("Speech Recognition is not supported in this browser.", { duration: 10000 });
      setStatus('ERROR');
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setStatus('LISTENING');
        if (messages.length === 0) {
          socketRef.current?.emit('voice_message', { text: "Hello!" });
        }
      } catch (e) {
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const stopAll = () => {
    stopListening();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setStatus('IDLE');
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      // CRITICAL: Set speaking ref, and make sure we are listening to catch interruptions
      isSpeakingRef.current = true;
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      setStatus('SPEAKING');
      
      // Start listening to detect interruption while AI is speaking
      try { recognitionRef.current?.start(); } catch(e){}

      utterance.onend = () => {
        // Clear speaking ref only if it hasn't been interrupted
        if (isSpeakingRef.current) {
          isSpeakingRef.current = false;
          setStatus('IDLE');
          setTimeout(() => {
            startListening();
          }, 500); // Small delay to let synthesis completely release audio stream
        }
      };
      synthRef.current.speak(utterance);
    }
  };

  const handleUserUtterance = (text: string) => {
    if (!text || !text.trim() || text.trim().length < 2) return;
    
    stopListening();
    setCurrentTranscript('');
    
    setMessages(prev => [...prev, { role: 'user', text, id: Math.random().toString() }]);
    setStatus('THINKING');

    socketRef.current?.emit('voice_message', { text });
  };

  const handleGenerateProject = async () => {
    // If workspace is already created from voice session, navigate directly
    const cachedWorkflowId = sessionStorage.getItem('voice_workspace_id');
    if (cachedWorkflowId) {
      navigate({ to: `/app/workspace/${cachedWorkflowId}` });
      return;
    }

    setIsGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/workflows`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ idea })
      });
      const data = await res.json();
      if (res.ok && data.workflowId) {
        toast.success("Workspace launched!");
        navigate({ to: `/app/workspace/${data.workflowId}` });
      } else {
        toast.error("Failed to start workspace.");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStatusIcon = (st: StatusType) => {
    switch (st) {
      case 'Pending': return <Circle className="h-4 w-4 text-slate-300" />;
      case 'Running': return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
      case 'Completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
      
      {/* Left Panel: AI Interaction */}
      <div className="flex-1 flex flex-col border-r border-border/60 relative">
        
        {/* Status Header */}
        <div className="h-20 shrink-0 border-b border-border/60 bg-card/50 flex flex-col items-center justify-center relative">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">AI Mentor Status</h2>
          <div className="flex gap-4 items-center">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${
              status === 'LISTENING' ? 'bg-primary/20 text-primary border border-primary/30' :
              status === 'THINKING' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
              status === 'SPEAKING' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
              'bg-slate-500/20 text-slate-500 border border-slate-500/30'
            }`}>
              {status === 'LISTENING' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
              {status === 'THINKING' && <Loader2 className="h-3 w-3 animate-spin" />}
              {status === 'SPEAKING' && <div className="flex gap-0.5 items-center">
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-green-500 rounded-full" />
                  <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-green-500 rounded-full" />
                  <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-green-500 rounded-full" />
              </div>}
              {status}
            </div>
          </div>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-hidden flex justify-center p-6 bg-slate-50/50">
          <div ref={transcriptRef} className="w-full max-w-3xl overflow-y-auto space-y-6 pb-20">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Mic className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-xl font-medium text-foreground">Click the microphone to start talking.</p>
                  <p className="text-sm mt-2 text-center max-w-md">Your AI Mentor will guide you through the process.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-[85%] rounded-3xl p-5 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-br-sm shadow-glow'
                        : 'bg-white text-foreground border border-border/50 rounded-bl-sm shadow-lg'
                    }`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">
                        {msg.role === 'user' ? 'You' : 'AI Mentor'}
                      </div>
                      <div className="text-[15px] leading-relaxed">
                        {msg.text}
                      </div>
                    </motion.div>
                  </div>
                ))
              )}
              
              {/* Live Transcript Bubble */}
              {currentTranscript && (
                <div className="flex justify-end">
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="max-w-[85%] rounded-3xl p-5 bg-primary/20 text-primary rounded-br-sm">
                    <p className="text-[15px] leading-relaxed font-medium animate-pulse">{currentTranscript}...</p>
                  </motion.div>
                </div>
              )}
          </div>
        </div>

        {/* Voice Controls */}
        <div className="h-28 shrink-0 bg-white border-t border-border/60 flex items-center justify-center gap-8 relative shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <button 
            onClick={stopAll}
            className="absolute left-8 px-5 py-2 rounded-xl border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-50 transition"
          >
            End Chat
          </button>
          
          <div className="relative">
            <AnimatePresence>
              {(status === 'LISTENING' || status === 'SPEAKING') && (
                <>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
                </>
              )}
            </AnimatePresence>
            <button
              onClick={status === 'IDLE' || status === 'ERROR' ? startListening : stopListening}
              className={`relative grid h-16 w-16 place-items-center rounded-full transition-all duration-300 shadow-xl ${
                status === 'LISTENING' ? 'bg-primary scale-110' : 
                status === 'SPEAKING' ? 'bg-green-500 scale-110' :
                'bg-white border-2 border-primary/20 hover:border-primary/50 text-primary'
              }`}
            >
              {status === 'LISTENING' || status === 'SPEAKING' ? (
                <Mic className="h-6 w-6 text-white animate-pulse" />
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {isResearchComplete && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-8"
              >
                <button 
                  onClick={handleGenerateProject}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white shadow-glow hover:scale-105 transition disabled:opacity-50 font-bold"
                >
                  {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                  {isGenerating ? "Generating..." : "Generate App"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: Workflow and MCP Status */}
      <div className="w-[380px] bg-slate-50/80 flex flex-col border-l border-border/60">
        <div className="p-6 border-b border-border/60 bg-white shadow-[0_5px_20px_rgba(0,0,0,0.02)] z-10">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Project Workflow
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time generation progress</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Stages</h3>
            <div className="relative pl-3 space-y-6">
              {/* Vertical line connecting timeline nodes */}
              <div className="absolute left-4 top-2 bottom-4 w-0.5 bg-border/80"></div>
              
              {Object.entries(workflowStages).map(([stage, stageStatus], idx) => (
                <div key={stage} className="relative flex items-center gap-4 z-10">
                  <div className="bg-white rounded-full">
                    {renderStatusIcon(stageStatus)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${stageStatus === 'Running' ? 'text-amber-600' : stageStatus === 'Completed' ? 'text-slate-800' : 'text-slate-500'}`}>
                      {stage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/60" />

          {/* MCP Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Live MCP Services
            </h3>
            <div className="grid gap-3">
              {Object.entries(mcpStatuses).map(([provider, mcpStatus]) => (
                <div key={provider} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    {provider === 'GitHub' && <Activity className="h-4 w-4 text-slate-500" />}
                    {provider === 'Context7' && <Database className="h-4 w-4 text-slate-500" />}
                    {provider === 'Firecrawl' && <Globe className="h-4 w-4 text-slate-500" />}
                    {provider === 'Tavily' && <Globe className="h-4 w-4 text-slate-500" />}
                    {provider === 'Serper' && <Globe className="h-4 w-4 text-slate-500" />}
                    {provider}
                  </div>
                  {renderStatusIcon(mcpStatus)}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
