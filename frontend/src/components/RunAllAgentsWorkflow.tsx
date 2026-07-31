import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Search, Lightbulb, Boxes, Presentation,
  CheckCircle2, Download, Trophy, FileText, Activity,
  Server, Database, Lock, Globe, File, Code, Settings
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

type WorkflowState = "idle" | "running" | "completed";
type AgentStatus = "waiting" | "running" | "completed";

interface RunAllAgentsWorkflowProps {
  onClose: () => void;
}

const agents = [
  { id: "research", name: "Research Agent", icon: Search },
  { id: "innovation", name: "Innovation Agent", icon: Lightbulb },
  { id: "architecture", name: "Architecture Agent", icon: Boxes },
  { id: "documentation", name: "Documentation Agent", icon: Presentation },
];

const mockTerminalLogs = [
  "Initializing workflow orchestrator...",
  "Searching IEEE Papers...",
  "18 papers found and synthesized.",
  "Analyzing GitHub repositories...",
  "Ranking repositories by similarity...",
  "Research Phase Complete.",
  "Calculating Innovation Score...",
  "Generating Business Model Canvas...",
  "Estimating Cost & ROI...",
  "Innovation & Strategy Phase Complete.",
  "Building system architecture...",
  "Designing database schema...",
  "Generating API documentation...",
  "Architecture & Development Phase Complete.",
  "Drafting Software Requirement Specification...",
  "Creating pitch deck...",
  "Preparing judge Q&A...",
  "Documentation Phase Complete.",
  "Finalizing Project Package...",
  "Done."
];

export function RunAllAgentsWorkflow({ onClose }: RunAllAgentsWorkflowProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>("running");
  const [agentProgress, setAgentProgress] = useState<number[]>([0, 0, 0, 0]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (workflowState !== "running") return;

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < mockTerminalLogs.length) {
        setLogs(prev => [...prev, mockTerminalLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 800);

    const runAgent = async (index: number) => {
      setCurrentAgentIndex(index);
      for (let p = 0; p <= 100; p += 5) {
        await new Promise(r => setTimeout(r, 100)); // Simulate work
        setAgentProgress(prev => {
          const newProgress = [...prev];
          newProgress[index] = p;
          return newProgress;
        });
      }
      if (index < agents.length - 1) {
        runAgent(index + 1);
      } else {
        setTimeout(() => setWorkflowState("completed"), 1000);
      }
    };

    runAgent(0);

    return () => clearInterval(logInterval);
  }, [workflowState]);

  if (workflowState === "running") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">AI EXECUTION CENTER</h2>
            <p className="text-slate-400">Orchestrating multi-agent workflow...</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              {agents.map((agent, index) => {
                const Icon = agent.icon;
                const status: AgentStatus = index < currentAgentIndex ? "completed" : index === currentAgentIndex ? "running" : "waiting";
                return (
                  <div key={agent.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 font-semibold text-white">
                        <div className={`grid h-8 w-8 place-items-center rounded-lg ${status === "completed" ? "bg-emerald-500/20 text-emerald-400" : status === "running" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-slate-500"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {agent.name}
                      </div>
                      <span className={status === "completed" ? "text-emerald-400" : status === "running" ? "text-blue-400" : "text-slate-500"}>
                        {status === "completed" ? "Completed" : status === "running" ? "Running..." : "Waiting"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        className={`h-full rounded-full ${status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${agentProgress[index]}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs text-green-400 shadow-inner">
              <div className="mb-4 flex items-center gap-2 text-slate-400 border-b border-white/10 pb-2">
                <Terminal className="h-4 w-4" /> Live Terminal
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[320px]">
                {logs.map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <span className="text-slate-600 mr-2">&gt;</span> {log}
                  </motion.div>
                ))}
                {workflowState === "running" && (
                  <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity }}>
                    <span className="text-slate-600 mr-2">&gt;</span> _
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workflowState === "completed") {
    return <FinalDashboard onClose={onClose} />;
  }

  return null;
}

export function FinalDashboard({ onClose, results }: { onClose: () => void, results?: any }) {
  const data = results || {};
  // Extracting data safely from the backend result format we defined earlier
  const research = data.research || {};
  const innovation = data.innovation || {};
  const architecture = data.architecture || {};
  const docs = data.documentation || {};

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Final AI Project Report (MVP)</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
            Generate Detailed Report (Pro)
          </button>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Close Dashboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl space-y-8 pb-12">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-center items-center">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Innovation Score</div>
              <div className="text-6xl font-black text-primary">{innovation.innovationScore || 92}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Tech Stack</h3>
              <pre className="text-sm font-mono text-slate-800 whitespace-pre-wrap">{architecture.techStack || 'React, Node.js, PostgreSQL'}</pre>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Research Summary</h3>
            <div className="prose prose-sm max-w-none">
              {research.executiveSummary || 'Research summary goes here...'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Business Model Summary</h3>
            <div className="prose prose-sm max-w-none">
              {innovation.businessModelSummary || 'Business model insights...'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Architecture (Mermaid)</h3>
            <pre className="text-xs font-mono bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto">
              {architecture.mermaidDiagram || 'graph TD; A-->B;'}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Database Tables</h3>
            <pre className="text-xs font-mono bg-slate-100 text-slate-800 p-4 rounded-xl overflow-x-auto">
              {JSON.stringify(architecture.database, null, 2) || 'Users, Projects, Settings'}
            </pre>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">API Endpoints</h3>
            <pre className="text-xs font-mono bg-slate-100 text-slate-800 p-4 rounded-xl overflow-x-auto">
              {JSON.stringify(architecture.apis, null, 2) || 'GET /api/v1/health'}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Roadmap</h3>
            <div className="prose prose-sm max-w-none">
              {innovation.roadmap || 'Phase 1 -> Phase 2 -> Phase 3'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">README Summary</h3>
            <div className="prose prose-sm max-w-none">
              {docs.readmeSummary || '# Project Title\n\nA great project...'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
