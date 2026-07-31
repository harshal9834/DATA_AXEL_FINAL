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

function FinalDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Trophy },
    { id: "research", label: "Research", icon: Search },
    { id: "innovation", label: "Innovation", icon: Lightbulb },
    { id: "architecture", label: "Architecture", icon: Boxes },
    { id: "documentation", label: "Documentation", icon: Presentation },
    { id: "downloads", label: "Downloads", icon: Download },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Final AI Project Report</h1>
        </div>
        <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          Close Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === t.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          {activeTab === "dashboard" && <TabDashboard />}
          {activeTab === "research" && <TabResearch />}
          {activeTab === "innovation" && <TabInnovation />}
          {activeTab === "architecture" && <TabArchitecture />}
          {activeTab === "documentation" && <TabDocumentation />}
          {activeTab === "downloads" && <TabDownloads />}
        </div>
      </div>
    </div>
  );
}

// --- TAB COMPONENTS ---

function TabDashboard() {
  const scores = [
    { name: "Innovation", value: 92, color: "#8b5cf6" },
    { name: "Feasibility", value: 88, color: "#10b981" },
    { name: "Architecture", value: 95, color: "#3b82f6" },
    { name: "Security", value: 90, color: "#f59e0b" },
    { name: "Scalability", value: 94, color: "#ec4899" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Overall Project Score</h3>
          <div className="flex items-center justify-center">
             <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-indigo-100">
                <span className="text-5xl font-extrabold text-indigo-600">92</span>
                <span className="absolute bottom-6 text-sm font-semibold text-slate-400">/ 100</span>
             </div>
          </div>
          <p className="mt-4 text-center text-sm text-slate-600">Implementation Ready</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Score Breakdown</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={scores}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
         <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Executive Summary</h3>
         <p className="text-slate-600 leading-relaxed">
            The proposed project idea has been thoroughly analyzed by the AI Copilot team. Research indicates a strong market need with 18 key papers supporting the technical viability. The business model is highly innovative (Score: 92) with clear monetization strategies. The architecture uses a scalable, modern microservices approach suited for enterprise-grade deployment. All documentation, including pitch decks and SRS, is complete and ready for presentation to investors or hackathon judges.
         </p>
      </div>
    </div>
  );
}

function TabResearch() {
  const papers = [
    { title: "Attention Is All You Need", authors: "Vaswani et al.", year: 2017, contribution: "Transformer architecture", limitation: "High compute cost" },
    { title: "BERT: Pre-training of Deep Bidirectional Transformers", authors: "Devlin et al.", year: 2018, contribution: "Bidirectional training", limitation: "Not suited for generation" },
    { title: "Retrieval-Augmented Generation for Knowledge-Intensive Tasks", authors: "Lewis et al.", year: 2020, contribution: "RAG framework", limitation: "Retrieval latency" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-800">Top Research Papers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Paper</th>
                <th className="px-4 py-3">Authors</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Contribution</th>
                <th className="px-4 py-3">Limitation</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((p, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.title}</td>
                  <td className="px-4 py-3">{p.authors}</td>
                  <td className="px-4 py-3">{p.year}</td>
                  <td className="px-4 py-3 text-emerald-600">{p.contribution}</td>
                  <td className="px-4 py-3 text-rose-600">{p.limitation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">API Suggestions</h3>
            <ul className="space-y-3 text-sm">
               <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-medium text-slate-700">OpenAI API</span> <span className="text-slate-500">LLM Inference</span></li>
               <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-medium text-slate-700">Pinecone</span> <span className="text-slate-500">Vector Database</span></li>
               <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-medium text-slate-700">Stripe</span> <span className="text-slate-500">Payments</span></li>
            </ul>
         </div>
         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800">GitHub Repository Analysis</h3>
            <ul className="space-y-3 text-sm">
               <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-medium text-slate-700">langchain-ai/langchain</span> <span className="text-slate-500">⭐ 95k</span></li>
               <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-medium text-slate-700">vercel/next.js</span> <span className="text-slate-500">⭐ 118k</span></li>
               <li className="flex justify-between border-b border-slate-100 pb-2"><span className="font-medium text-slate-700">huggingface/transformers</span> <span className="text-slate-500">⭐ 120k</span></li>
            </ul>
         </div>
      </div>
    </div>
  );
}

function TabInnovation() {
  const swot = [
    { title: "Strengths", items: ["Novel AI integration", "Low operational cost", "Scalable architecture"], color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
    { title: "Weaknesses", items: ["High initial API costs", "Dependence on third-party LLMs"], color: "text-rose-700", bg: "bg-rose-50 border-rose-100" },
    { title: "Opportunities", items: ["B2B SaaS expansion", "Enterprise licensing", "New market segments"], color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
    { title: "Threats", items: ["Rapid AI advancements", "Open-source competitors"], color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
         <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-500">Innovation Score</div>
            <div className="mt-2 text-4xl font-extrabold text-indigo-600">92</div>
         </div>
         <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-500">Market Feasibility</div>
            <div className="mt-2 text-4xl font-extrabold text-emerald-600">High</div>
         </div>
         <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-500">Est. ROI (Year 1)</div>
            <div className="mt-2 text-4xl font-extrabold text-blue-600">240%</div>
         </div>
         <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-500">Risk Level</div>
            <div className="mt-2 text-4xl font-extrabold text-amber-500">Medium</div>
         </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-800">SWOT Analysis</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {swot.map(s => (
            <div key={s.title} className={`rounded-xl border p-5 ${s.bg}`}>
              <h4 className={`mb-3 font-bold ${s.color}`}>{s.title}</h4>
              <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-700">
                {s.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
         <h3 className="mb-4 text-lg font-bold text-slate-800">Business Model Canvas Highlights</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
               <div className="font-bold text-slate-700 mb-1">Value Proposition</div>
               <div className="text-slate-600">10x faster project research using multi-agent AI workflow.</div>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
               <div className="font-bold text-slate-700 mb-1">Customer Segments</div>
               <div className="text-slate-600">Developers, Researchers, Startup Founders.</div>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
               <div className="font-bold text-slate-700 mb-1">Revenue Streams</div>
               <div className="text-slate-600">Subscription model (Pro tier), Enterprise API access.</div>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
               <div className="font-bold text-slate-700 mb-1">Cost Structure</div>
               <div className="text-slate-600">LLM Inference, Cloud Hosting, Marketing & Sales.</div>
            </div>
         </div>
      </div>
    </div>
  );
}

function TabArchitecture() {
   const techStack = [
      { layer: "Frontend", tech: "React + Tailwind CSS", reason: "Rapid UI development with premium aesthetics." },
      { layer: "Backend", tech: "Node.js (Express) / Python (FastAPI)", reason: "Efficient asynchronous processing and AI model integration." },
      { layer: "Database", tech: "PostgreSQL + Pinecone", reason: "Relational data and Vector embeddings storage." },
      { layer: "Infrastructure", tech: "AWS / Vercel", reason: "Scalable serverless and containerized deployment." },
   ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-800">Recommended Tech Stack</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Layer</th>
                <th className="px-4 py-3">Technology</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {techStack.map((t, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{t.layer}</td>
                  <td className="px-4 py-3 text-indigo-600 font-semibold">{t.tech}</td>
                  <td className="px-4 py-3">{t.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800"><Server className="h-5 w-5 text-indigo-500" /> System Architecture Diagram</h3>
            <div className="aspect-[4/3] rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-4">
               <pre className="text-xs text-slate-500 text-left overflow-auto w-full h-full p-4 bg-white rounded border border-slate-200">
{`graph TD;
    Client-->|HTTPS| API_Gateway;
    API_Gateway-->Auth_Service;
    API_Gateway-->Agent_Orchestrator;
    Agent_Orchestrator-->Research_Agent;
    Agent_Orchestrator-->Innovation_Agent;
    Agent_Orchestrator-->Architecture_Agent;
    Agent_Orchestrator-->Docs_Agent;
    Research_Agent-->Vector_DB;
    Architecture_Agent-->SQL_DB;`}
               </pre>
            </div>
         </div>
         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800"><Database className="h-5 w-5 text-emerald-500" /> Database Schema (ER)</h3>
            <div className="aspect-[4/3] rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-4">
               <pre className="text-xs text-slate-500 text-left overflow-auto w-full h-full p-4 bg-white rounded border border-slate-200">
{`erDiagram
    USER ||--o{ PROJECT : creates
    PROJECT ||--o{ AGENT_RUN : contains
    AGENT_RUN ||--|| RESEARCH_DATA : generates
    AGENT_RUN ||--|| INNOVATION_DATA : generates
    AGENT_RUN ||--|| ARCHITECTURE_DATA : generates
    AGENT_RUN ||--|| DOCS_DATA : generates`}
               </pre>
            </div>
         </div>
      </div>
    </div>
  );
}

function TabDocumentation() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-800">Generated Documents</h3>
        <p className="text-sm text-slate-600 mb-6">
          The Documentation & Presentation Agent has compiled the research, innovation strategy, and architecture into the following final deliverables ready for use:
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           <DocCard title="README.md" desc="Standard project intro, setup instructions, and features." icon={FileText} color="text-slate-700" />
           <DocCard title="Software Requirement Spec" desc="Detailed IEEE-format requirements document." icon={File} color="text-indigo-600" />
           <DocCard title="Pitch Deck" desc="12-slide investor presentation with market analysis." icon={Presentation} color="text-emerald-600" />
           <DocCard title="Demo Script" desc="Step-by-step script for hackathon presentations." icon={Code} color="text-fuchsia-600" />
           <DocCard title="API Documentation" desc="OpenAPI specification for all REST endpoints." icon={Globe} color="text-blue-600" />
           <DocCard title="Judge Q&A Prep" desc="Anticipated questions and strategic answers." icon={Lightbulb} color="text-amber-600" />
        </div>
      </div>
    </div>
  );
}

function DocCard({ title, desc, icon: Icon, color }: { title: string, desc: string, icon: any, color: string }) {
   return (
      <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer bg-white">
         <div className={`h-10 w-10 mb-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
         </div>
         <h4 className="font-bold text-slate-800 text-sm mb-1.5">{title}</h4>
         <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
   )
}


function TabDownloads() {
  const files = [
    { name: "Executive Summary.pdf", size: "1.2 MB", type: "PDF" },
    { name: "Research Report.pdf", size: "3.4 MB", type: "PDF" },
    { name: "Innovation Analysis.pdf", size: "2.1 MB", type: "PDF" },
    { name: "Architecture Design.pdf", size: "4.5 MB", type: "PDF" },
    { name: "Database Schema.pdf", size: "1.1 MB", type: "PDF" },
    { name: "Pitch Deck.pptx", size: "8.2 MB", type: "PPTX" },
    { name: "README.md", size: "12 KB", type: "Markdown" },
    { name: "API_Documentation.json", size: "45 KB", type: "JSON" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
           <div>
              <h3 className="text-lg font-bold text-slate-800">Download Center</h3>
              <p className="text-sm text-slate-500 mt-1">Get all generated reports and diagrams</p>
           </div>
           <button className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors">
              <Download className="h-4 w-4" /> Download Complete ZIP
           </button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {files.map(f => (
            <div key={f.name} className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm cursor-pointer transition-all">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                 {f.type === "PDF" ? <FileText className="h-6 w-6" /> : f.type === "PPTX" ? <Presentation className="h-6 w-6" /> : f.type === "Markdown" ? <File className="h-6 w-6" /> : <Code className="h-6 w-6" />}
              </div>
              <h4 className="mb-1.5 text-sm font-semibold text-slate-800 break-all">{f.name}</h4>
              <p className="text-xs text-slate-500">{f.type} • {f.size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
