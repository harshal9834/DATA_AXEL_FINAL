import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import {
  Mic, MicOff, Send, Loader2, CheckCircle2, Circle, XCircle,
  Activity, Download, Copy, Code, Database, Globe,
  Layers, FileText, TestTube, Rocket, BookOpen, LayoutTemplate,
  Server, GitBranch, Zap, Network, Shield, BarChart3, Sparkles,
  ClipboardList, Users, Map, Target, ArrowLeft, Bot, Cpu,
  RefreshCw,
} from "lucide-react";
import { BACKEND_URL, API_BASE } from "../lib/api";
import { auth } from "../firebase/firebase";

export const Route = createFileRoute("/app/workspace/$workflowId")({
  head: () => ({ meta: [{ title: "AI Workspace | Engineering Platform" }] }),
  component: WorkspacePage,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface Msg { id: string; role: "user" | "assistant"; text: string; }
interface AgentStatus { name: string; status: string; progress: number; }

// ─── Mermaid Diagram ──────────────────────────────────────────────────────────
function MermaidDiagram({ code, id }: { code: string; id: string }) {
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!code) return;
    const clean = code.replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
    import("mermaid").then(m => {
      m.default.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
      m.default.render(`md-${id}-${Date.now()}`, clean)
        .then(({ svg: s }) => { setSvg(s); setErr(""); })
        .catch(() => setErr(clean));
    });
  }, [code, id]);

  const copy = () => { navigator.clipboard.writeText(code.replace(/\\n/g, "\n")); toast.success("Copied!"); };

  if (err) return (
    <div className="rounded-xl bg-slate-900 p-4 relative">
      <button onClick={copy} className="absolute top-3 right-3 text-slate-400 hover:text-white"><Copy className="h-4 w-4" /></button>
      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-auto max-h-72">{err}</pre>
    </div>
  );
  if (!svg) return <div className="h-20 flex items-center justify-center text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Rendering…</div>;

  const download = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${id}.svg`; a.click();
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={copy} className="bg-white border rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1 shadow-sm"><Copy className="h-3 w-3" />Code</button>
        <button onClick={download} className="bg-white border rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-1 shadow-sm"><Download className="h-3 w-3" />SVG</button>
      </div>
      <div className="overflow-auto rounded-xl border border-border/60 bg-white p-4" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <span className="text-xs font-mono text-slate-300">{title}</span>
          <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <Copy className="h-3 w-3" />{copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre className="bg-slate-900 p-4 overflow-auto text-xs text-green-300 font-mono whitespace-pre-wrap max-h-80">{code}</pre>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h3 className="font-bold text-sm mb-4 flex items-center gap-2">{icon}{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-56 text-muted-foreground text-center">
      <Loader2 className="h-8 w-8 animate-spin mb-3 opacity-30" />
      <p className="text-sm font-medium">{label} is being generated…</p>
      <p className="text-xs mt-1 opacity-60">Background agents are working. It will appear momentarily.</p>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",      emoji: "📊", label: "Overview" },
  { id: "requirements", emoji: "📋", label: "Requirements" },
  { id: "brd",          emoji: "📑", label: "BRD" },
  { id: "prd",          emoji: "📄", label: "PRD" },
  { id: "srs",          emoji: "📘", label: "SRS" },
  { id: "userstories",  emoji: "👤", label: "User Stories" },
  { id: "architecture", emoji: "🏗",  label: "Architecture" },
  { id: "diagrams",     emoji: "🗺",  label: "Diagrams" },
  { id: "database",     emoji: "🗄",  label: "Database" },
  { id: "api",          emoji: "🔌", label: "APIs" },
  { id: "backend",      emoji: "🖥",  label: "Backend" },
  { id: "frontend",     emoji: "⚛",  label: "Frontend" },
  { id: "testing",      emoji: "🧪", label: "Testing" },
  { id: "devops",       emoji: "🚀", label: "Deployment" },
  { id: "documentation",emoji: "📚", label: "Docs" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
function WorkspacePage() {
  const { workflowId } = Route.useParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mentorStatus, setMentorStatus] = useState<"idle"|"thinking"|"speaking"|"listening">("idle");
  const [activeTab, setActiveTab] = useState("overview");
  const [ws, setWs] = useState<Record<string, any>>({});
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Initializing…");
  const [isLoading, setIsLoading] = useState(true);

  const voiceSocket = useRef<Socket | null>(null);
  const mainSocket = useRef<Socket | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isSpeakingRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addMsg = (role: "user"|"assistant", text: string) =>
    setMessages(p => [...p, { id: Date.now().toString(), role, text }]);

  const loadWorkspace = useCallback(async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const r = await fetch(`${API_BASE}/workspace/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.success) {
        setWs(d.workspace);
        setAgents(d.workspace.agents || []);
        setProgress(d.workspace.overallProgress || 0);
        if (d.workspace.status === "COMPLETED") setPhase("All done! ✅");
      }
    } catch { /* workspace may not exist yet */ }
    finally { setIsLoading(false); }
  }, [workflowId]);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Main socket — workflow events
  useEffect(() => {
    const s = io(BACKEND_URL, { transports: ["websocket", "polling"], withCredentials: true });
    mainSocket.current = s;
    s.on("workspace_document_ready", ({ workflowId: wId, tabName, content }: any) => {
      if (wId !== workflowId) return;
      setWs(p => ({ ...p, [tabName]: content }));
      toast.success(`✅ ${tabName} ready`, { duration: 2000 });
    });
    s.on("workspace_progress", ({ workflowId: wId, percent, currentPhase: cp }: any) => {
      if (wId !== workflowId) return;
      setProgress(percent); setPhase(cp);
    });
    s.on("agent_progress", ({ workflowId: wId, name, status }: any) => {
      if (wId && wId !== workflowId) return;
      setAgents(p => {
        const e = p.find(a => a.name === name);
        if (e) return p.map(a => a.name === name ? { ...a, status } : a);
        return [...p, { name, status, progress: 0 }];
      });
    });
    s.on("workflow_completed", ({ id }: any) => {
      if (id !== workflowId) return;
      setProgress(100); setPhase("All done! ✅");
      loadWorkspace();
      toast.success("🎉 All agents completed! Workspace is ready.", { duration: 5000 });
    });
    return () => { s.disconnect(); };
  }, [workflowId, loadWorkspace]);

  // Voice socket — mentor chat
  useEffect(() => {
    const vs = io(`${BACKEND_URL}/voice-assistant`, { transports: ["websocket", "polling"], withCredentials: true });
    voiceSocket.current = vs;
    vs.on("ai_status", ({ status }: any) => {
      setMentorStatus(status === "Thinking..." ? "thinking" : "idle");
    });
    vs.on("voice_reply", ({ reply }: any) => {
      addMsg("assistant", reply);
      setMentorStatus("speaking");
      speak(reply);
      setIsSending(false);
    });

    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onresult = (e: any) => {
        const t = e.results[0][0].transcript;
        setIsListening(false);
        setMentorStatus("thinking");
        sendMentor(t);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
    return () => { vs.disconnect(); synthRef.current?.cancel(); };
  }, []);

  const sendMentor = (text: string) => {
    if (!text.trim()) return;
    addMsg("user", text);
    setIsSending(true);
    setMentorStatus("thinking");
    voiceSocket.current?.emit("voice_message", { text });
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    isSpeakingRef.current = true;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const v = voices.find(v => v.name.includes("Google") || v.name.includes("Natural")) || voices[0];
    if (v) u.voice = v;
    u.onend = () => { isSpeakingRef.current = false; setMentorStatus("idle"); };
    synthRef.current.speak(u);
  };

  const toggleVoice = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { synthRef.current?.cancel(); recognitionRef.current?.start(); setIsListening(true); setMentorStatus("listening"); }
  };

  // ─── Render tab content ─────────────────────────────────────────────────────
  const d = ws;

  const tabContent: Record<string, React.ReactNode> = {
    overview: (
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Progress", val: `${progress}%`, color: "from-blue-500 to-indigo-500", Icon: BarChart3 },
            { label: "Running", val: agents.filter(a => a.status === "RUNNING").length, color: "from-amber-500 to-orange-400", Icon: Cpu },
            { label: "Completed", val: agents.filter(a => a.status === "COMPLETED").length, color: "from-green-500 to-emerald-400", Icon: CheckCircle2 },
          ].map(c => (
            <div key={c.label} className={`rounded-2xl bg-gradient-to-br ${c.color} p-4 text-white`}>
              <c.Icon className="h-5 w-5 mb-2 opacity-80" />
              <div className="text-3xl font-bold">{c.val}</div>
              <div className="text-xs opacity-80 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Agent Pipeline</h3>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>{phase}</span><span>{progress}%</span></div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {agents.map(a => (
              <div key={a.name} className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-xs font-medium ${{COMPLETED:"text-green-600 bg-green-50 border-green-200",RUNNING:"text-amber-600 bg-amber-50 border-amber-200",FAILED:"text-red-600 bg-red-50 border-red-200"}[a.status] || "text-slate-400 bg-slate-50 border-slate-200"}`}>
                {a.status === "COMPLETED" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : a.status === "RUNNING" ? <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" /> : a.status === "FAILED" ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <Circle className="h-3.5 w-3.5 text-slate-300" />}
                <span className="truncate">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
        {d.research?.executiveSummary && (
          <Section title="Executive Summary" icon={<Sparkles className="h-4 w-4 text-primary" />}>
            <p className="text-sm text-muted-foreground leading-relaxed">{d.research.executiveSummary}</p>
          </Section>
        )}
        {d.research?.recommendedTechStack && (
          <Section title="Recommended Tech Stack" icon={<Layers className="h-4 w-4 text-blue-500" />}>
            <p className="text-sm text-muted-foreground">{d.research.recommendedTechStack}</p>
          </Section>
        )}
      </div>
    ),

    requirements: !d.planning ? <EmptyState label="Requirements" /> : (
      <div className="space-y-5">
        <Section title="Functional Requirements" icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}>
          <ul className="space-y-1.5">{d.planning.functionalRequirements?.map((r: string, i: number) => <li key={i} className="flex gap-2 text-sm"><span className="text-primary shrink-0">•</span>{r}</li>)}</ul>
        </Section>
        <Section title="Non-Functional Requirements" icon={<Shield className="h-4 w-4 text-blue-500" />}>
          <ul className="space-y-1.5">{d.planning.nonFunctionalRequirements?.map((r: string, i: number) => <li key={i} className="flex gap-2 text-sm"><span className="text-blue-500 shrink-0">•</span>{r}</li>)}</ul>
        </Section>
        <Section title="Constraints & Assumptions" icon={<Zap className="h-4 w-4 text-amber-500" />}>
          <div className="grid grid-cols-2 gap-4">
            <div><h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Constraints</h4><ul className="space-y-1">{d.planning.constraints?.map((c: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span>–</span>{c}</li>)}</ul></div>
            <div><h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Assumptions</h4><ul className="space-y-1">{d.planning.assumptions?.map((a: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span>–</span>{a}</li>)}</ul></div>
          </div>
        </Section>
        <Section title="Risk Analysis" icon={<Activity className="h-4 w-4 text-red-500" />}>
          <div className="space-y-2">{d.planning.riskAnalysis?.map((r: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/60 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${{High:"bg-red-100 text-red-700",Medium:"bg-amber-100 text-amber-700",Low:"bg-green-100 text-green-700"}[r.severity as string] || "bg-slate-100 text-slate-700"}`}>{r.severity}</span>
                <span className="font-semibold text-sm">{r.risk}</span>
              </div>
              <p className="text-xs text-muted-foreground">{r.mitigation}</p>
            </div>
          ))}</div>
        </Section>
      </div>
    ),

    brd: !d.planning?.brd ? <EmptyState label="BRD" /> : (
      <div className="space-y-5">
        <Section title="Business Overview" icon={<FileText className="h-4 w-4 text-primary" />}><p className="text-sm text-muted-foreground leading-relaxed">{d.planning.brd.overview}</p></Section>
        <Section title="Objectives" icon={<Target className="h-4 w-4 text-green-500" />}>
          <ul className="space-y-1.5">{d.planning.brd.objectives?.map((o: string, i: number) => <li key={i} className="flex gap-2 text-sm"><span className="font-bold text-primary">{i+1}.</span>{o}</li>)}</ul>
        </Section>
        <Section title="Scope" icon={<Map className="h-4 w-4 text-blue-500" />}>
          <p className="text-sm text-muted-foreground mb-2">{d.planning.brd.scope}</p>
          <p className="text-sm"><span className="text-red-500 font-semibold">Out of Scope: </span><span className="text-muted-foreground">{d.planning.brd.outOfScope}</span></p>
        </Section>
        <Section title="Business Rules" icon={<Shield className="h-4 w-4 text-amber-500" />}>
          <ul className="space-y-1.5">{d.planning.brd.businessRules?.map((r: string, i: number) => <li key={i} className="flex gap-2 text-sm"><span className="text-amber-500">•</span>{r}</li>)}</ul>
        </Section>
      </div>
    ),

    prd: !d.planning?.prd ? <EmptyState label="PRD" /> : (
      <div className="space-y-5">
        <Section title="Product Overview" icon={<Sparkles className="h-4 w-4 text-primary" />}><p className="text-sm text-muted-foreground leading-relaxed">{d.planning.prd.productOverview}</p></Section>
        <Section title="User Personas" icon={<Users className="h-4 w-4 text-blue-500" />}>
          <div className="grid gap-3">{d.planning.prd.userPersonas?.map((p: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/60 p-4">
              <div className="font-semibold text-sm mb-1">{p.name}</div>
              <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
              <div className="flex flex-wrap gap-1">{p.goals?.map((g: string, j: number) => <span key={j} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{g}</span>)}</div>
            </div>
          ))}</div>
        </Section>
        <Section title="Core Features" icon={<Zap className="h-4 w-4 text-amber-500" />}>
          <div className="space-y-2">{d.planning.prd.coreFeatures?.map((f: any, i: number) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${"Must Have"===f.priority?"bg-red-100 text-red-700":"Should Have"===f.priority?"bg-amber-100 text-amber-700":"bg-blue-100 text-blue-700"}`}>{f.priority}</span>
              <div><div className="font-semibold text-sm">{f.feature}</div><p className="text-xs text-muted-foreground">{f.description}</p></div>
            </div>
          ))}</div>
        </Section>
      </div>
    ),

    srs: !d.planning?.srs ? <EmptyState label="SRS" /> : (
      <div className="space-y-5">
        {(["introduction","systemOverview","functionalSpec","nonFunctionalSpec","interfaces"] as const).map(key => (
          d.planning.srs[key] ? <Section key={key} title={key.replace(/([A-Z])/g," $1").replace(/^./, s=>s.toUpperCase())} icon={<FileText className="h-4 w-4 text-primary" />}>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{d.planning.srs[key]}</p>
          </Section> : null
        ))}
      </div>
    ),

    userstories: !d.planning?.userStories && !d.planning?.useCases ? <EmptyState label="User Stories" /> : (
      <div className="space-y-5">
        {d.planning?.userStories && <Section title="User Stories" icon={<Users className="h-4 w-4 text-primary" />}>
          <div className="space-y-3">{d.planning.userStories.map((s: any) => (
            <div key={s.id} className="rounded-xl border border-border/60 p-4">
              <span className="text-xs font-mono font-bold text-primary">{s.id}</span>
              <p className="text-sm font-medium mt-1">As a <strong>{s.role}</strong>, I want to <strong>{s.goal}</strong> so that <strong>{s.benefit}</strong></p>
              <ul className="mt-2 space-y-0.5">{s.acceptanceCriteria?.map((c: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-green-500 shrink-0">✓</span>{c}</li>)}</ul>
            </div>
          ))}</div>
        </Section>}
        {d.planning?.featureList && <Section title="Feature Priority Matrix" icon={<Target className="h-4 w-4 text-blue-500" />}>
          <div className="space-y-2">{d.planning.featureList.map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${"Must Have"===f.priority?"bg-red-100 text-red-700":"Should Have"===f.priority?"bg-amber-100 text-amber-700":"Could Have"===f.priority?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-500"}`}>{f.priority}</span>
              <span className="text-sm flex-1">{f.feature}</span>
              <span className="text-xs text-muted-foreground">{f.complexity}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">S{f.sprint}</span>
            </div>
          ))}</div>
        </Section>}
        {d.planning?.sprintPlan && <Section title="Sprint Plan" icon={<Map className="h-4 w-4 text-purple-500" />}>
          <div className="space-y-3">{d.planning.sprintPlan.map((s: any) => (
            <div key={s.sprint} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Sprint {s.sprint}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s.points} pts</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{s.goal}</p>
              <div className="flex flex-wrap gap-1">{s.stories?.map((st: string, i: number) => <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{st}</span>)}</div>
            </div>
          ))}</div>
        </Section>}
      </div>
    ),

    architecture: !d.architecture ? <EmptyState label="Architecture" /> : (
      <div className="space-y-5">
        {d.architecture.executiveArchitectureSummary && <Section title="Architecture Summary" icon={<Network className="h-4 w-4 text-primary" />}><p className="text-sm text-muted-foreground leading-relaxed">{d.architecture.executiveArchitectureSummary}</p></Section>}
        {d.architecture.backendArchitecture && <Section title="Backend Architecture" icon={<Server className="h-4 w-4 text-blue-500" />}><p className="text-sm text-muted-foreground">{d.architecture.backendArchitecture}</p></Section>}
        {d.architecture.frontendArchitecture && <Section title="Frontend Architecture" icon={<LayoutTemplate className="h-4 w-4 text-purple-500" />}><p className="text-sm text-muted-foreground">{d.architecture.frontendArchitecture}</p></Section>}
        {d.architecture.techStack && <Section title="Tech Stack" icon={<Layers className="h-4 w-4 text-green-500" />}>
          <div className="flex flex-wrap gap-2">{(Array.isArray(d.architecture.techStack)?d.architecture.techStack:[d.architecture.techStack]).map((t: string, i: number) => <span key={i} className="text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full font-medium">{t}</span>)}</div>
        </Section>}
        {d.diagrams?.highLevelArchitecture && <Section title="Architecture Diagram" icon={<GitBranch className="h-4 w-4 text-indigo-500" />}><MermaidDiagram code={d.diagrams.highLevelArchitecture} id="arch-hla" /></Section>}
      </div>
    ),

    diagrams: !d.diagrams ? <EmptyState label="Diagrams" /> : (
      <div className="space-y-6">
        {([
          ["highLevelArchitecture","High-Level Architecture"],["componentDiagram","Component Diagram"],
          ["sequenceDiagram","Sequence Diagram"],["deploymentDiagram","Deployment Diagram"],
          ["flowDiagram","Flow Diagram"],["classDiagram","Class Diagram"],
          ["activityDiagram","Activity Diagram"],["stateDiagram","State Diagram"],
          ["authFlowDiagram","Authentication Flow"],
        ] as [string,string][]).map(([key, label]) => d.diagrams[key] ? (
          <Section key={key} title={label} icon={<GitBranch className="h-4 w-4 text-primary" />}>
            <MermaidDiagram code={d.diagrams[key]} id={key} />
          </Section>
        ) : null)}
      </div>
    ),

    database: !d.database ? <EmptyState label="Database" /> : (
      <div className="space-y-5">
        {d.database.erdMermaid && <Section title="Entity Relationship Diagram" icon={<Database className="h-4 w-4 text-primary" />}><MermaidDiagram code={d.database.erdMermaid} id="erd" /></Section>}
        {d.database.entities && <Section title="Entities" icon={<Layers className="h-4 w-4 text-blue-500" />}>
          <div className="space-y-3">{d.database.entities.map((e: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/60 p-4">
              <div className="font-bold text-sm mb-2 text-primary">{e.name}</div>
              <p className="text-xs text-muted-foreground mb-2">{e.description}</p>
              <div className="overflow-auto">
                <table className="w-full text-xs"><thead><tr className="border-b border-border/60"><th className="text-left py-1 font-semibold text-slate-600">Column</th><th className="text-left py-1 font-semibold text-slate-600">Type</th><th className="text-left py-1 font-semibold text-slate-600">Constraints</th></tr></thead>
                <tbody>{e.attributes?.map((a: any, j: number) => <tr key={j} className="border-b border-border/40 last:border-0"><td className="py-1.5 font-mono text-slate-700">{a.name}</td><td className="py-1.5 text-blue-600">{a.type}</td><td className="py-1.5 text-muted-foreground">{a.constraints}</td></tr>)}</tbody></table>
              </div>
            </div>
          ))}</div>
        </Section>}
        {d.database.sqlSchema && <Section title="SQL Schema" icon={<Code className="h-4 w-4 text-green-500" />}><CodeBlock code={d.database.sqlSchema} title="schema.sql" /></Section>}
        {d.database.prismaSchema && <Section title="Prisma Schema" icon={<Code className="h-4 w-4 text-purple-500" />}><CodeBlock code={d.database.prismaSchema} title="schema.prisma" /></Section>}
      </div>
    ),

    api: !d.apidesign ? <EmptyState label="API Design" /> : (() => {
      const mColor = (m: string) => ({GET:"bg-green-100 text-green-700",POST:"bg-blue-100 text-blue-700",PUT:"bg-amber-100 text-amber-700",PATCH:"bg-amber-100 text-amber-700",DELETE:"bg-red-100 text-red-700"}[m]||"bg-slate-100 text-slate-700");
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 text-white">
            <Globe className="h-5 w-5 text-green-400" />
            <div><div className="text-xs text-slate-400">Base URL</div><div className="font-mono font-bold">{d.apidesign.baseUrl}</div></div>
            <div className="ml-auto"><span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full">{d.apidesign.authStrategy}</span></div>
          </div>
          <Section title={`Endpoints (${d.apidesign.endpoints?.length || 0})`} icon={<Globe className="h-4 w-4 text-primary" />}>
            <div className="space-y-2">{d.apidesign.endpoints?.map((ep: any, i: number) => (
              <div key={i} className="rounded-xl border border-border/60 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${mColor(ep.method)}`}>{ep.method}</span>
                  <span className="font-mono text-sm">{ep.path}</span>
                  {ep.auth && <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full ml-auto">🔒 Auth</span>}
                </div>
                <p className="text-xs text-muted-foreground">{ep.description}</p>
              </div>
            ))}</div>
          </Section>
          {d.apidesign.openApiYaml && <Section title="OpenAPI YAML" icon={<Code className="h-4 w-4 text-blue-500" />}><CodeBlock code={d.apidesign.openApiYaml} title="openapi.yaml" /></Section>}
        </div>
      );
    })(),

    backend: !d.backend ? <EmptyState label="Backend" /> : (
      <div className="space-y-5">
        {d.backend.techStack && <Section title="Technology Stack" icon={<Server className="h-4 w-4 text-primary" />}>
          <div className="flex flex-wrap gap-2">{(Array.isArray(d.backend.techStack)?d.backend.techStack:[d.backend.techStack]).map((t: string, i: number) => <span key={i} className="text-xs bg-slate-900 text-green-400 px-3 py-1 rounded-full font-mono">{t}</span>)}</div>
        </Section>}
        {d.backend.folderStructure && <Section title="Folder Structure" icon={<GitBranch className="h-4 w-4 text-blue-500" />}><CodeBlock code={typeof d.backend.folderStructure==="string"?d.backend.folderStructure:JSON.stringify(d.backend.folderStructure,null,2)} title="project/" /></Section>}
        {d.backend.controllers && <Section title="Controllers" icon={<Code className="h-4 w-4 text-purple-500" />}>
          <div className="grid gap-2">{(Array.isArray(d.backend.controllers)?d.backend.controllers:[d.backend.controllers]).map((c: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/60 p-3">
              <div className="font-semibold text-sm">{typeof c==="string"?c:c.name}</div>
              {c.endpoints && <div className="flex flex-wrap gap-1 mt-1">{c.endpoints.map((e: string, j: number) => <span key={j} className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-600">{e}</span>)}</div>}
            </div>
          ))}</div>
        </Section>}
      </div>
    ),

    frontend: !d.frontend ? <EmptyState label="Frontend" /> : (
      <div className="space-y-5">
        {d.frontend.techStack && <Section title="Technology Stack" icon={<LayoutTemplate className="h-4 w-4 text-primary" />}>
          <div className="flex flex-wrap gap-2">{(Array.isArray(d.frontend.techStack)?d.frontend.techStack:[d.frontend.techStack]).map((t: string, i: number) => <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">{t}</span>)}</div>
        </Section>}
        {d.frontend.pages && <Section title="Pages" icon={<FileText className="h-4 w-4 text-blue-500" />}>
          <div className="grid gap-2">{(Array.isArray(d.frontend.pages)?d.frontend.pages:[d.frontend.pages]).map((p: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/60 px-3 py-2 flex items-center justify-between">
              <span className="font-semibold text-sm">{typeof p==="string"?p:p.name||p.page}</span>
              {p.route && <span className="text-xs font-mono text-muted-foreground">{p.route}</span>}
            </div>
          ))}</div>
        </Section>}
        {d.frontend.components && <Section title="Components" icon={<Layers className="h-4 w-4 text-purple-500" />}>
          <div className="flex flex-wrap gap-2">{(Array.isArray(d.frontend.components)?d.frontend.components:[d.frontend.components]).map((c: any, i: number) => <span key={i} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full">{typeof c==="string"?c:c.name}</span>)}</div>
        </Section>}
      </div>
    ),

    testing: !d.testing ? <EmptyState label="Testing" /> : (
      <div className="space-y-5">
        {d.testing.testStrategy && <Section title="Test Strategy" icon={<TestTube className="h-4 w-4 text-primary" />}><p className="text-sm text-muted-foreground leading-relaxed">{d.testing.testStrategy}</p></Section>}
        {d.testing.coverageTargets && <div className="grid grid-cols-3 gap-3">
          {Object.entries(d.testing.coverageTargets).map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border/60 p-4 text-center bg-card">
              <div className="text-3xl font-bold text-primary">{v as string}</div>
              <div className="text-xs text-muted-foreground capitalize mt-1">{k} Coverage</div>
            </div>
          ))}
        </div>}
        {d.testing.testingTools && <Section title="Testing Tools" icon={<Zap className="h-4 w-4 text-amber-500" />}>
          <div className="flex flex-wrap gap-2">{d.testing.testingTools.map((t: string, i: number) => <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-medium">{t}</span>)}</div>
        </Section>}
        {d.testing.unitTests?.length > 0 && <Section title="Sample Unit Tests" icon={<Code className="h-4 w-4 text-green-500" />}>
          <div className="space-y-3">{d.testing.unitTests.slice(0,2).map((t: any, i: number) => (
            <div key={i} className="space-y-2">
              <div className="font-semibold text-sm">{t.component} — {t.testCase}</div>
              <CodeBlock code={t.code} title={`${t.component}.test.ts`} />
            </div>
          ))}</div>
        </Section>}
      </div>
    ),

    devops: !d.devops ? <EmptyState label="DevOps" /> : (
      <div className="space-y-5">
        {d.devops.infraDiagramMermaid && <Section title="Infrastructure Diagram" icon={<Network className="h-4 w-4 text-primary" />}><MermaidDiagram code={d.devops.infraDiagramMermaid} id="infra" /></Section>}
        {d.devops.dockerfile && <Section title="Dockerfile" icon={<Code className="h-4 w-4 text-blue-500" />}><CodeBlock code={d.devops.dockerfile} title="Dockerfile" /></Section>}
        {d.devops.dockerCompose && <Section title="Docker Compose" icon={<Layers className="h-4 w-4 text-cyan-500" />}><CodeBlock code={d.devops.dockerCompose} title="docker-compose.yml" /></Section>}
        {d.devops.githubActionsCI && <Section title="GitHub Actions CI" icon={<GitBranch className="h-4 w-4 text-slate-700" />}><CodeBlock code={d.devops.githubActionsCI} title=".github/workflows/ci.yml" /></Section>}
        {d.devops.envTemplate && <Section title="Environment Template" icon={<Shield className="h-4 w-4 text-green-500" />}><CodeBlock code={d.devops.envTemplate} title=".env.example" /></Section>}
        {d.devops.deploymentGuide && <Section title="Deployment Guide" icon={<Rocket className="h-4 w-4 text-amber-500" />}><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{d.devops.deploymentGuide}</p></Section>}
      </div>
    ),

    documentation: !d.documentation ? <EmptyState label="Documentation" /> : (
      <div className="space-y-5">
        {d.documentation.readme && <Section title="README" icon={<BookOpen className="h-4 w-4 text-primary" />}><CodeBlock code={typeof d.documentation.readme==="string"?d.documentation.readme:JSON.stringify(d.documentation.readme,null,2)} title="README.md" /></Section>}
        {d.documentation.architectureGuide && <Section title="Architecture Guide" icon={<Network className="h-4 w-4 text-blue-500" />}><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{typeof d.documentation.architectureGuide==="string"?d.documentation.architectureGuide:JSON.stringify(d.documentation.architectureGuide)}</p></Section>}
        {d.documentation.developerGuide && <Section title="Developer Guide" icon={<Code className="h-4 w-4 text-green-500" />}><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{typeof d.documentation.developerGuide==="string"?d.documentation.developerGuide:JSON.stringify(d.documentation.developerGuide)}</p></Section>}
      </div>
    ),
  };

  const statusDot = { idle:"bg-slate-400", thinking:"bg-amber-400 animate-pulse", speaking:"bg-green-400 animate-pulse", listening:"bg-blue-400 animate-pulse" }[mentorStatus];
  const statusLabel = { idle:"AI Mentor", thinking:"Thinking…", speaking:"Speaking…", listening:"Listening…" }[mentorStatus];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">

      {/* ── Left: Mentor Panel ── */}
      <div className="w-[360px] shrink-0 flex flex-col border-r border-border/60 bg-card">
        <div className="h-14 flex items-center gap-3 px-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-blue-500/5 shrink-0">
          <Link to="/app/voice" className="text-muted-foreground hover:text-primary transition"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold flex items-center gap-1.5">{statusLabel}<div className={`h-2 w-2 rounded-full ${statusDot}`} /></div>
            <div className="text-[11px] text-muted-foreground truncate">{ws.title || "AI Software Engineering Platform"}</div>
          </div>
          <button onClick={loadWorkspace} className="text-muted-foreground hover:text-primary transition p-1 rounded-lg hover:bg-primary/5"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-3">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm font-medium">Your AI Mentor is ready.</p>
              <p className="text-xs mt-1 max-w-[200px] opacity-70">Ask anything about the architecture, next steps, or get recommendations.</p>
            </div>
          )}
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role==="user"?"justify-end":"justify-start"}`}>
              {msg.role === "assistant" && <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center mr-1.5 shrink-0 mt-0.5"><Bot className="h-3 w-3 text-white" /></div>}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${msg.role==="user"?"bg-primary text-white rounded-br-sm":"bg-white border border-border/60 text-foreground rounded-bl-sm shadow-sm"}`}>{msg.text}</div>
            </motion.div>
          ))}
          {mentorStatus === "thinking" && (
            <div className="flex">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center mr-1.5 shrink-0"><Bot className="h-3 w-3 text-white" /></div>
              <div className="bg-white border border-border/60 rounded-2xl rounded-bl-sm px-3 py-2.5"><div className="flex gap-1">{[0,1,2].map(i=><motion.div key={i} className="h-1.5 w-1.5 bg-slate-400 rounded-full" animate={{y:[0,-4,0]}} transition={{repeat:Infinity,duration:0.6,delay:i*0.15}} />)}</div></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-border/60 shrink-0">
          <div className="flex gap-2 items-end">
            <div className="flex-1 flex items-center rounded-xl border border-border/60 bg-background px-3 py-2 focus-within:border-primary transition-colors">
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(input.trim()){sendMentor(input.trim());setInput("");}}}}
                placeholder="Ask the mentor…" rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground max-h-20" />
            </div>
            <button onClick={toggleVoice} className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${isListening?"bg-blue-500 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {isListening?<Mic className="h-4 w-4 animate-pulse" />:<MicOff className="h-4 w-4" />}
            </button>
            <button onClick={()=>{if(input.trim()&&!isSending){sendMentor(input.trim());setInput("");}}} disabled={!input.trim()||isSending}
              className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-40 shrink-0">
              {isSending?<Loader2 className="h-4 w-4 animate-spin" />:<Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Workspace ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 flex items-center gap-0.5 px-2 border-b border-border/60 bg-slate-50/80 overflow-x-auto shrink-0 scrollbar-none">
          {TABS.map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab===tab.id?"bg-white shadow-sm text-primary border border-border/60":"text-muted-foreground hover:text-foreground hover:bg-white/60"}`}>
              <span>{tab.emoji}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.15}}>
              {isLoading ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary mr-3" /><span className="text-muted-foreground">Loading workspace…</span></div>
              ) : (tabContent[activeTab] || <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Select a tab.</div>)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
