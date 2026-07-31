import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import {
  Search, Lightbulb, Boxes, Presentation, Check, Clock, PlayCircle, Database, Layout, Beaker, Archive,
  Terminal, Activity, ArrowLeft, Loader2, AlertCircle, RefreshCcw, CheckCircle2, ChevronDown, Download, Trophy, Target, FileText, BarChart3, Layers, Sparkles, Settings, Network, Lock
} from "lucide-react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { auth } from "../firebase/firebase";
import { BACKEND_URL } from "../lib/api";

export const Route = createFileRoute("/app/workflow/$workflowId")({
  head: () => ({
    meta: [{ title: "AI Execution Engine" }],
  }),
  component: WorkflowExecutionPage,
});



const steps = [
  { id: "Idea", label: "Idea", icon: SparklesIcon, color: "from-slate-500 to-slate-700" },
  { id: "Research & Discovery", label: "Research", icon: Search, color: "from-blue-500 to-indigo-500" },
  { id: "Innovation & Strategy", label: "Innovation", icon: Lightbulb, color: "from-fuchsia-500 to-violet-500" },
  { id: "Architecture & Development", label: "Architecture", icon: Boxes, color: "from-emerald-500 to-teal-500" },
  { id: "Backend Generation", label: "Backend", icon: Database, color: "from-indigo-500 to-purple-500" },
  { id: "Frontend Generation", label: "Frontend", icon: Layout, color: "from-pink-500 to-rose-500" },
  { id: "Documentation & Presentation", label: "Docs", icon: Presentation, color: "from-rose-500 to-pink-500" },
  { id: "Project Analysis", label: "Analysis", icon: BarChart3, color: "from-amber-500 to-orange-500" }
];

function SparklesIcon(props: any) {
  return <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" fill="currentColor" {...props} />
}

function WorkflowExecutionPage() {
  const { workflowId } = Route.useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("RUNNING");
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentAgentName, setCurrentAgentName] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyInstructions, setModifyInstructions] = useState('');
  
  const [activeAgent, setActiveAgent] = useState<any>(null);
  const [aiThinking, setAiThinking] = useState("Initializing...");
  const [currentOutputChunk, setCurrentOutputChunk] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [completedOutputs, setCompletedOutputs] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [backendData, setBackendData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  // useRef for socket to prevent duplicate connections on re-render
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (outputEndRef.current) outputEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentOutputChunk]);

  useEffect(() => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;
    
    // Auto-scroll logs
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });

    socket.on("workflow_progress", (data) => {
      if (data.id === workflowId) {
        setOverallProgress(data.overallProgress);
        setCurrentAgentName(data.currentAgent);
      }
    });

    socket.on("agent_started", (task) => {
      setActiveAgent({ ...task, status: "RUNNING", progress: 0 });
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), detail: `${task.name} Started`, color: "text-blue-400" }]);
      setCurrentOutputChunk(""); // Reset output view for new agent
    });

    socket.on("agent_progress", (task) => {
      setActiveAgent((prev: any) => ({ ...prev, progress: task.progress, currentTask: task.currentTask }));
    });

    socket.on("agent_completed", (task) => {
      setActiveAgent((prev: any) => ({ ...prev, status: "COMPLETED", progress: 100 }));
      setCompletedOutputs(prev => ({ ...prev, [task.name]: currentOutputChunk }));
    });
    
    socket.on("agent_failed", (task) => {
      setActiveAgent((prev: any) => ({ ...prev, status: "FAILED" }));
      setStatus("FAILED");
      setErrorMsg(task.error);
    });

    socket.on("ai_thinking", (data) => {
      if (data.workflowId === workflowId) setAiThinking(data.thought);
    });

    socket.on("output_stream", (data) => {
      if (data.workflowId === workflowId) {
        setCurrentOutputChunk(data.fullContent);
      }
    });

    socket.on("log_created", (log) => {
      if (log.workflowId === workflowId) {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), detail: log.detail || log.title, color: "text-slate-300" }]);
      }
    });
    
    socket.on("analysis_generated", (data) => {
      if (data.workflowId === workflowId) setAnalysis(data.analysis);
    });

    socket.on("backend_generated", (data) => {
      if (data.workflowId === workflowId) setBackendData(data.backendData);
    });

    socket.on("workflow_completed", (data) => {
      if (data.id === workflowId) {
        setStatus("COMPLETED");
        setOverallProgress(100);
        setCurrentAgentName(null);
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), detail: "Workflow Completed Successfully", color: "text-emerald-400" }]);
        toast.success("Workflow completed successfully!");
      }
    });
    
    socket.on("workflow_failed", (data) => {
      if (data.id === workflowId) {
        setStatus("FAILED");
        toast.error("Workflow encountered an error.");
      }
    });

    socket.on("workflow_status", async (data) => {
      if (data.id === workflowId) {
        setStatus(data.status);
        if (data.status === "WAITING_APPROVAL") {
           try {
             const res = await fetch(`${BACKEND_URL}/api/workflows/${workflowId}/blueprint`, {
               headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
             });
             const bp = await res.json();
             setBlueprint(bp);
           } catch (err) {
             console.error("Failed to load blueprint", err);
           }
        }
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [workflowId]);

  async function getAuthToken() {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      return await auth.currentUser?.getIdToken(true) || '';
    } catch {
      return '';
    }
  }

  const approveBlueprint = async () => {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken(true) || '';
      
      const res = await fetch(`${BACKEND_URL}/api/workflows/${workflowId}/approve-blueprint`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatus("COMPLETED");
        toast.success("Blueprint Approved! Workflow Completed.");
      }
    } catch (err) {
      toast.error("Failed to approve blueprint");
    }
  };

  const modifyBlueprint = async () => {
    if (!modifyInstructions.trim()) {
      toast.error("Please provide instructions for the modification.");
      return;
    }
    
    setShowModifyModal(false);
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken(true) || '';
      
      const res = await fetch(`${BACKEND_URL}/api/workflows/${workflowId}/modify-blueprint`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ instructions: modifyInstructions })
      });
      
      if (res.ok) {
        setStatus("RUNNING");
        toast.success("Modifications sent! Architecture Agent is running again.");
        setModifyInstructions('');
      } else {
        toast.error("Failed to send modifications");
      }
    } catch (err) {
      toast.error("Failed to send modifications");
    }
  };

  const handleRetry = async () => {
    if (!activeAgent) return;
    setStatus("RUNNING");
    setErrorMsg(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${BACKEND_URL}/api/workflows/${workflowId}/retry`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ agentName: activeAgent.name })
      });
      toast.success(`Retrying ${activeAgent.name}...`);
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex-col relative pt-16">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-border/60 flex items-center justify-between px-6 z-10 shadow-soft">
        <div className="flex items-center gap-4">
          <Link to="/app/agents" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-6 w-px bg-border/60" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Project Execution Engine</span>
              <span className="text-xs text-muted-foreground font-mono bg-slate-100 px-1.5 py-0.5 rounded">ID: {workflowId.split('-')[0]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${status === 'RUNNING' ? 'bg-primary/10 text-primary animate-pulse' : status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
              {status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Overall Progress</span>
            <div className="font-bold">{overallProgress}%</div>
          </div>
          {status === 'COMPLETED' && (
            <button onClick={() => navigate({ to: `/app/projects/${workflowId}` })} className="rounded-lg bg-gradient-brand px-4 py-1.5 text-xs font-bold text-white shadow-glow">
              View Project
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Agents, Thinking, Logs */}
        <div className="w-[400px] shrink-0 border-r border-border/60 bg-white/50 flex flex-col">
          
          {/* Current Agent Panel */}
          <div className="p-6 border-b border-border/60">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Active Agent
            </h3>
            {activeAgent ? (
              <div className={`rounded-xl border ${status === 'FAILED' ? 'border-rose-500/50 bg-rose-50' : 'border-primary/20 bg-primary/5'} p-4 shadow-sm`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{activeAgent.name}</h4>
                    <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${status === 'FAILED' ? 'bg-rose-500 text-white' : 'bg-primary text-white'}`}>
                      {activeAgent.status}
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-800">{activeAgent.progress || 0}%</div>
                </div>
                
                {status === 'FAILED' ? (
                  <div className="mt-4">
                    <div className="text-xs text-rose-600 mb-3 flex items-start gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {errorMsg}
                    </div>
                    <button onClick={handleRetry} className="w-full flex justify-center items-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition">
                      <RefreshCcw className="h-3.5 w-3.5" /> Retry Agent
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                      {activeAgent.status === 'RUNNING' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                      {activeAgent.currentTask || "Preparing..."}
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeAgent.progress || 0}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
               <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                 <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                 Waiting for engine...
               </div>
            )}
          </div>

          {/* AI Thinking Panel */}
          <div className="p-6 border-b border-border/60 bg-[#fafafa]">
             <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
               <Lightbulb className="h-3.5 w-3.5" /> Live AI Thinking
             </h3>
             <div className="text-sm font-mono text-slate-700 leading-relaxed min-h-[60px] animate-pulse">
               {aiThinking}
             </div>
          </div>

          {/* Execution Logs */}
          <div className="flex-1 p-6 flex flex-col min-h-0 bg-[#0f172a]">
             <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
               <Terminal className="h-3.5 w-3.5" /> System Logs
             </h3>
             <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 hide-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic">Waiting...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className={log.color || "text-slate-300"}>{log.detail}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
             </div>
          </div>

        </div>
        
        {/* Right Column: Timeline, Stream, Results */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          
          {/* Top Progress Pipeline */}
          <div className="p-6 border-b border-border/60 overflow-x-auto hide-scrollbar bg-slate-50/50">
            <div className="flex items-center min-w-[800px]">
               {steps.map((s, i) => {
                 const Icon = s.icon;
                 let stepState = "waiting";
                 if (overallProgress === 100) stepState = "completed";
                 else if (currentAgentName === s.id) stepState = "running";
                 else {
                   const myIndex = steps.findIndex(st => st.id === s.id);
                   const currIndex = steps.findIndex(st => st.id === currentAgentName);
                   if (currIndex > myIndex) stepState = "completed";
                   if (s.id === "Idea" && overallProgress > 0) stepState = "completed";
                 }
                 
                 const isRunning = stepState === "running";
                 const isCompleted = stepState === "completed";

                 return (
                   <div key={s.id} className="flex flex-1 items-center">
                     <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                        <div className={`grid h-8 w-8 place-items-center rounded-lg transition-all duration-300 ${isRunning ? `bg-primary text-white shadow-glow ring-2 ring-primary/20 scale-110` : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                           {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className={`text-[9px] font-bold whitespace-nowrap absolute -bottom-5 ${isRunning ? 'text-primary' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</div>
                     </div>
                     {i < steps.length - 1 && (
                        <div className="h-[2px] flex-1 mx-2 rounded bg-slate-100 overflow-hidden relative">
                           {(isCompleted || isRunning) && (
                             <motion.div initial={{ width: 0 }} animate={{ width: isCompleted ? "100%" : "50%" }} className="absolute inset-y-0 left-0 bg-primary" />
                           )}
                        </div>
                     )}
                   </div>
                 )
               })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 hide-scrollbar bg-[#0a0a0a]">
             
             {/* Streaming Output Pane */}
             {status === 'RUNNING' && activeAgent && (
               <div className="mb-8">
                 <h2 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Live Streaming Output
                 </h2>
                 <div className="rounded-xl border border-slate-800 bg-[#111] p-5 shadow-2xl">
                   <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                     {currentOutputChunk || "Connecting to LLM..."}
                   </pre>
                   <div ref={outputEndRef} />
                 </div>
               </div>
             )}

             {/* Completed Outputs Accordion Removed */}
             
             {status === 'RUNNING' && activeAgent?.name === 'Project Analysis' && (
                <div className="mb-8 p-12 text-center rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/5 shadow-[0_0_50px_rgba(217,70,239,0.1)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  <Sparkles className="h-12 w-12 text-fuchsia-400 mx-auto mb-6 animate-pulse" />
                  <h2 className="text-2xl font-black text-white mb-2">Generating Final AI Project Report...</h2>
                  <p className="text-sm font-bold text-slate-400">Combining outputs from 6 AI Agents and synthesizing a premium architecture report.</p>
                </div>
             )}

             {status === 'WAITING_APPROVAL' && blueprint && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <div className="p-8 rounded-3xl bg-slate-900 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                    <h2 className="text-3xl font-black text-blue-400 mb-6 flex items-center gap-3">
                      <Lightbulb className="h-8 w-8" />
                      Project Blueprint Ready
                    </h2>
                    
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">Research Summary</h3>
                        <p className="text-sm text-slate-400">{blueprint.researchSummary}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">Innovation Summary</h3>
                        <p className="text-sm text-slate-400">{blueprint.innovationSummary}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">Architecture</h3>
                        <p className="text-sm text-slate-400">{blueprint.architecture}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">Database Schema</h3>
                        <pre className="text-xs bg-black p-4 rounded-lg text-emerald-400 overflow-x-auto">{blueprint.databaseSchema}</pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">Folder Structure</h3>
                        <pre className="text-xs bg-black p-4 rounded-lg text-blue-400 overflow-x-auto">{blueprint.folderStructure}</pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">API Design</h3>
                        <pre className="text-xs bg-black p-4 rounded-lg text-fuchsia-400 overflow-x-auto">{blueprint.apiDesign}</pre>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col md:flex-row justify-center gap-4">
                      <button 
                        onClick={() => setShowModifyModal(true)}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-lg transition border border-slate-700"
                      >
                        ⚙️ Modify Architecture
                      </button>
                      <button 
                        onClick={approveBlueprint}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-lg transition shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
                      >
                        🚀 Approve Architecture
                      </button>
                    </div>
                 </div>
               </motion.div>
             )}
             
             {/* Final Analysis & Downloads */}
             {(status === 'COMPLETED' || backendData) && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 
                  <BackendGenerationView data={backendData} />

                  {analysis && <ProjectAnalysisView analysis={analysis} />}

                  <div className="p-8 rounded-3xl bg-black/40 border border-emerald-500/30 mt-6 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <h2 className="text-3xl font-black text-emerald-400 mb-2 text-center flex items-center justify-center gap-3">
                      🎉 Project Completed Successfully
                    </h2>
                    <p className="text-center text-slate-400 font-bold">All AI agents have successfully collaborated to generate the final premium report below.</p>
                  </div>

               </motion.div>
             )}

          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    fuchsia: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20"
  };
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <div className="text-[10px] uppercase font-bold opacity-80 mb-1">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function BackendGenerationView({ data }: { data: any }) {
  if (!data || typeof data !== 'object') return null;

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
        <Database className="h-8 w-8 text-indigo-500" /> Backend Generation Results
      </h2>

      {data.backendAnalysis && (
        <AnalysisCard title="Backend Analysis & Strategy" icon={Search} defaultOpen>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{data.backendAnalysis}</p>
          </div>
        </AnalysisCard>
      )}

      {data.generatedPrismaModels && data.generatedPrismaModels.length > 0 && (
        <AnalysisCard title="Generated Prisma Models" icon={Database}>
          <div className="space-y-4">
            {data.generatedPrismaModels.map((model: any, i: number) => (
              <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="text-lg font-bold text-emerald-400 mb-1">{model.modelName}</div>
                <div className="text-xs text-slate-400 mb-3">{model.description}</div>
                <pre className="text-xs text-slate-300 bg-black p-3 rounded overflow-x-auto border border-white/10">
                  {model.schema}
                </pre>
              </div>
            ))}
          </div>
        </AnalysisCard>
      )}

      {data.generatedAPIs && data.generatedAPIs.length > 0 && (
        <AnalysisCard title="API Design Blueprint" icon={Network}>
          <div className="space-y-4">
            {data.generatedAPIs.map((api: any, i: number) => (
              <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${api.method === 'GET' ? 'bg-blue-500' : api.method === 'POST' ? 'bg-emerald-500' : api.method === 'DELETE' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                    {api.method}
                  </span>
                  <span className="font-mono text-sm text-slate-200">{api.endpoint}</span>
                </div>
                <div className="text-xs text-slate-400 mb-3">{api.description}</div>
                {api.reqBody && api.reqBody !== "{}" && api.reqBody !== "N/A" && (
                  <div className="mb-2">
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Request Body</div>
                    <pre className="text-[10px] text-slate-300 bg-black p-2 rounded overflow-x-auto">{api.reqBody}</pre>
                  </div>
                )}
                {api.resBody && api.resBody !== "{}" && api.resBody !== "N/A" && (
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Response Body</div>
                    <pre className="text-[10px] text-slate-300 bg-black p-2 rounded overflow-x-auto">{api.resBody}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnalysisCard>
      )}

      {data.generatedControllers && data.generatedControllers.length > 0 && (
        <AnalysisCard title="Generated Controllers" icon={Terminal}>
          <div className="space-y-4">
            {data.generatedControllers.map((ctrl: any, i: number) => (
              <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="text-lg font-bold text-blue-400 mb-1">{ctrl.name}</div>
                <div className="text-xs text-slate-400 mb-3">{ctrl.description}</div>
                <pre className="text-xs text-slate-300 bg-black p-3 rounded overflow-x-auto border border-white/10">
                  {ctrl.code}
                </pre>
              </div>
            ))}
          </div>
        </AnalysisCard>
      )}

      {data.generatedServices && data.generatedServices.length > 0 && (
        <AnalysisCard title="Generated Services" icon={Settings}>
          <div className="space-y-4">
            {data.generatedServices.map((svc: any, i: number) => (
              <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="text-lg font-bold text-fuchsia-400 mb-1">{svc.name}</div>
                <div className="text-xs text-slate-400 mb-3">{svc.description}</div>
                <pre className="text-xs text-slate-300 bg-black p-3 rounded overflow-x-auto border border-white/10">
                  {svc.code}
                </pre>
              </div>
            ))}
          </div>
        </AnalysisCard>
      )}

      {data.securityFeatures && data.securityFeatures.length > 0 && (
        <AnalysisCard title="Security & Middleware" icon={Lock}>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 bg-black/40 p-4 rounded-xl border border-white/5">
            {data.securityFeatures.map((feat: string, i: number) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>
        </AnalysisCard>
      )}

      {(data.filesCreated || data.routesCreated) && (
        <AnalysisCard title="Backend Summary" icon={CheckCircle2} defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {data.filesCreated && (
               <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                 <div className="text-xs text-slate-400 font-bold mb-2 uppercase">Files Created</div>
                 <ul className="list-disc list-inside text-xs text-emerald-400 space-y-1">
                   {data.filesCreated.map((f: string, i: number) => <li key={i}>{f}</li>)}
                 </ul>
               </div>
             )}
             {data.routesCreated && (
               <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                 <div className="text-xs text-slate-400 font-bold mb-2 uppercase">Routes Mounted</div>
                 <ul className="list-disc list-inside text-xs text-blue-400 space-y-1">
                   {data.routesCreated.map((r: string, i: number) => <li key={i}>{r}</li>)}
                 </ul>
               </div>
             )}
          </div>
        </AnalysisCard>
      )}
    </div>
  );
}

function ProjectAnalysisView({ analysis }: { analysis: any }) {
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyInstructions, setModifyInstructions] = useState('');

  const modifyBlueprint = async () => {
    setShowModifyModal(false);
    // Modification logic can be wired here
  };

  if (!analysis || typeof analysis !== 'object') return null;
  
  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-fuchsia-500" /> Complete AI Project Analysis
      </h2>
      
      {/* 1. Executive Summary */}
      {analysis.executiveSummary && (
        <AnalysisCard title="Executive Summary" icon={FileText} defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 font-bold mb-1">Project Name</div>
              <div className="text-lg text-white font-bold">{analysis.executiveSummary.projectName}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 font-bold mb-1">Target Audience</div>
              <div className="text-lg text-white font-bold">{analysis.executiveSummary.targetAudience}</div>
            </div>
          </div>
          <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-400 font-bold mb-2">Problem Statement</div>
            <p className="text-sm text-slate-300">{analysis.executiveSummary.problemStatement}</p>
          </div>
          <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-400 font-bold mb-2">Solution Overview</div>
            <p className="text-sm text-slate-300">{analysis.executiveSummary.solutionOverview}</p>
          </div>
        </AnalysisCard>
      )}

      {/* 3. Innovation Score */}
      {analysis.innovationAnalysis && (
        <AnalysisCard title="Innovation Analysis" icon={Lightbulb}>
          <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
            <div className="w-48 h-48 relative flex items-center justify-center shrink-0">
               <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                 <circle cx="96" cy="96" r="80" stroke="#d946ef" strokeWidth="12" fill="none" strokeDasharray="502" strokeDashoffset={502 - (502 * analysis.innovationAnalysis.innovationScore) / 100} className="transition-all duration-1000" />
               </svg>
               <div className="text-center">
                 <div className="text-4xl font-black text-white">{analysis.innovationAnalysis.innovationScore}</div>
                 <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mt-1">Score</div>
               </div>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-bold mb-2">Originality</div>
                <p className="text-sm text-slate-300">{analysis.innovationAnalysis.originality}</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-slate-400 font-bold mb-2">Market Gap</div>
                <p className="text-sm text-slate-300">{analysis.innovationAnalysis.marketGap}</p>
              </div>
            </div>
          </div>
        </AnalysisCard>
      )}

      {/* 5. Tech Stack */}
      {analysis.technologyStack && (
        <AnalysisCard title="Technology Stack" icon={Layers}>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {Object.entries(analysis.technologyStack).map(([key, val]) => (
               <div key={key} className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                 <div className="text-[10px] uppercase text-emerald-400 font-bold mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                 <div className="text-sm text-white font-bold">{val as string}</div>
               </div>
             ))}
           </div>
        </AnalysisCard>
      )}

      {/* All Other Raw JSON Sections for now to save space */}
      <AnalysisCard title="Detailed Reports (JSON Dump)" icon={Database}>
         <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap">
           {JSON.stringify(analysis, null, 2)}
         </pre>
      </AnalysisCard>

      {/* 18. Final Recommendation */}
      {analysis.finalRecommendation && (
        <AnalysisCard title="Final AI Recommendation" icon={Trophy} defaultOpen>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Hackathon Score" value={String(analysis.finalRecommendation.hackathonScore)} color="emerald" />
            <StatCard label="Overall Rating" value={analysis.finalRecommendation.overallRating} color="fuchsia" />
            <StatCard label="Scalability" value={analysis.finalRecommendation.scalability} color="blue" />
            <StatCard label="Prod Ready" value={analysis.finalRecommendation.productionReadiness} color="emerald" />
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-400 font-bold mb-2">Commercial Viability</div>
            <p className="text-sm text-slate-300">{analysis.finalRecommendation.commercialViability}</p>
          </div>
        </AnalysisCard>
      )}

      {/* Modify Modal */}
      <AnimatePresence>
        {showModifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-w-full m-4"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                <Settings className="h-5 w-5 text-slate-500" />
                Modify Architecture
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Describe what you want to change. The Architecture Agent will regenerate the blueprint based on your feedback.
              </p>
              
              <textarea 
                value={modifyInstructions}
                onChange={(e) => setModifyInstructions(e.target.value)}
                className="w-full h-32 rounded-xl border border-slate-200 bg-white text-slate-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                placeholder="E.g. Switch from PostgreSQL to MongoDB, or add a Redis caching layer..."
              />
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowModifyModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={modifyBlueprint}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white shadow-lg hover:bg-slate-800"
                >
                  Send Modifications
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function AnalysisCard({ title, icon: Icon, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] overflow-hidden shadow-xl">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-lg border border-white/10">
             <Icon className="h-5 w-5 text-slate-300" />
           </div>
           <span className="text-lg font-bold text-white">{title}</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-5 border-t border-slate-800 bg-black/20">
           {children}
        </div>
      )}
    </div>
  );
}
