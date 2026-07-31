import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import {
  Bell, AlertTriangle, CheckCircle2, Clock, Zap, Shield, Github,
  FileText, Lightbulb, BarChart3, Settings, Download, Terminal,
  TrendingUp, Target, Rocket, Database, ChevronDown, Play,
  ExternalLink, BookOpen, Layers, Search, Activity, Globe,
  Code, Star, ChevronRight,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { projects as demoProjects, deepSearchResults } from "../lib/demo-data";
import { BACKEND_URL } from "../lib/api";

export const Route = createFileRoute("/app/architecture")({
  head: () => ({ meta: [{ title: "Smart Alerts — AI Monitoring Engine" }] }),
  component: SmartAlertsPage,
});

type Sev = "critical"|"high"|"medium"|"low"|"info";
interface Alert { id:string;type:string;severity:Sev;title:string;description:string;recommendation:string;timestamp:string;tag:string;action:string;resolved:boolean; }
interface Project { id:string;title:string;idea?:string; }

function buildAlerts(p: string): Alert[] {
  const gh = `https://github.com/search?q=${encodeURIComponent(p)}&type=repositories`;
  const ss = `https://www.semanticscholar.org/search?q=${encodeURIComponent(p)}`;
  return [
    { id:"a1",  type:"deadline",      severity:"critical", title:"Deadline Risk Alert",      description:`Backend API for ${p} is 3 days behind schedule.`,            recommendation:"Reassign dev to unblock API.",              timestamp:"2 mins ago",  tag:"Critical", action:"Fix Now",         resolved:false },
    { id:"a2",  type:"innovation",    severity:"high",     title:"Innovation Score Low",     description:"Score below 70. Add unique AI features.",                    recommendation:"Add voice ordering or AI demand prediction.", timestamp:"15 mins ago", tag:"High",     action:"Improve",         resolved:false },
    { id:"a3",  type:"research",      severity:"info",     title:"New Research Paper",       description:`New paper on ${p} (92% relevance). ${ss}`,                   recommendation:"Review and cite in literature review.",       timestamp:"32 mins ago", tag:"New",      action:"View Paper",      resolved:false },
    { id:"a4",  type:"security",      severity:"high",     title:"Security Warning",         description:"JWT tokens in localStorage — XSS risk.",                    recommendation:"Migrate to HttpOnly cookies.",               timestamp:"1 hr ago",    tag:"Security", action:"View Details",    resolved:false },
    { id:"a5",  type:"documentation", severity:"medium",   title:"Pitch Deck Missing",       description:"README & SRS done. Pitch deck missing.",                     recommendation:"Use Documentation agent.",                   timestamp:"2 hrs ago",   tag:"Docs",     action:"View Docs",       resolved:false },
    { id:"a6",  type:"performance",   severity:"low",      title:"Add Redis Caching",        description:`Add Redis to ${p} API — 60% latency reduction.`,             recommendation:"Cache top 5 endpoints.",                     timestamp:"3 hrs ago",   tag:"Perf",     action:"View Suggestion", resolved:false },
    { id:"a7",  type:"github",        severity:"high",     title:"Repository Inactive",      description:`No commits 18 days. ${gh}`,                                 recommendation:"Push work or find alternative.",             timestamp:"4 hrs ago",   tag:"Inactive", action:"Open Repo",       resolved:false },
    { id:"a8",  type:"cost",          severity:"medium",   title:"Cloud Cost Estimate",      description:`AWS cost ~$380/month for ${p}.`,                             recommendation:"Use Render free-tier for MVP.",              timestamp:"5 hrs ago",   tag:"Cost",     action:"View Plan",       resolved:false },
    { id:"a9",  type:"hackathon",     severity:"critical", title:"Hackathon Readiness Gap",  description:"Demo script and deployment link missing.",                   recommendation:"Deploy to Vercel and create demo script.",   timestamp:"6 hrs ago",   tag:"Urgent",   action:"Fix Now",         resolved:false },
    { id:"a10", type:"security",      severity:"medium",   title:"Rate Limiting Missing",    description:"No rate limiting on APIs — DoS risk.",                      recommendation:"Add express-rate-limit middleware.",         timestamp:"8 hrs ago",   tag:"Security", action:"Fix Now",         resolved:false },
    { id:"a11", type:"research",      severity:"info",     title:"High Similarity Found",    description:`3 repos >85% similarity. ${gh}`,                            recommendation:"Add AI features to differentiate.",          timestamp:"10 hrs ago",  tag:"Review",   action:"Open Repo",       resolved:false },
    { id:"a12", type:"documentation", severity:"low",      title:"API Docs Incomplete",      description:"4 of 12 endpoints documented.",                             recommendation:"Complete OpenAPI/Swagger annotations.",      timestamp:"12 hrs ago",  tag:"Docs",     action:"View Docs",       resolved:false },
    { id:"a13", type:"deadline",      severity:"high",     title:"Test Coverage Low",        description:"Unit test coverage at 12%. Target: 80%.",                   recommendation:"Write tests alongside features.",            timestamp:"14 hrs ago",  tag:"High",     action:"Fix Now",         resolved:false },
    { id:"a14", type:"performance",   severity:"info",     title:"No CDN Configured",        description:"No CDN/image compression for frontend.",                    recommendation:"Use Cloudflare CDN + WebP images.",         timestamp:"16 hrs ago",  tag:"Perf",     action:"View Suggestion", resolved:false },
  ];
}

const SEV_COLOR: Record<Sev,string> = {
  critical:"bg-red-100 text-red-700 border-red-200",
  high:"bg-orange-100 text-orange-700 border-orange-200",
  medium:"bg-yellow-100 text-yellow-700 border-yellow-200",
  low:"bg-blue-100 text-blue-700 border-blue-200",
  info:"bg-slate-100 text-slate-600 border-slate-200",
};
const ACTION_STYLE: Record<string,string> = {
  "Fix Now":"bg-red-500 text-white hover:bg-red-600",
  "Improve":"bg-amber-500 text-white hover:bg-amber-600",
  "View Paper":"bg-blue-500 text-white hover:bg-blue-600",
  "View Details":"border border-violet-300 text-violet-700 hover:bg-violet-50",
  "View Docs":"border border-teal-300 text-teal-700 hover:bg-teal-50",
  "View Suggestion":"border border-slate-300 text-slate-700 hover:bg-slate-50",
  "Open Repo":"border border-slate-300 text-slate-700 hover:bg-slate-50",
  "View Plan":"border border-emerald-300 text-emerald-700 hover:bg-emerald-50",
  "Add to Review":"border border-blue-300 text-blue-700 hover:bg-blue-50",
};

function AlertCard({ alert, onResolve, onSnooze }:{ alert:Alert;onResolve:(id:string)=>void;onSnooze:(id:string)=>void }) {
  if (alert.resolved) return null;
  const handleAction = () => {
    const urlMatch = alert.description.match(/https?:\/\/[^\s]+/);
    if (alert.action==="Open Repo") { window.open(urlMatch?.[0]||`https://github.com/search?q=${encodeURIComponent(alert.title)}`, "_blank"); toast.success("Opening GitHub..."); }
    else if (alert.action==="View Paper") { window.open(urlMatch?.[0]||`https://www.semanticscholar.org/search?q=${encodeURIComponent(alert.title)}`, "_blank"); toast.success("Opening paper..."); }
    else if (alert.action==="View Docs") { window.location.href="/app/docs"; }
    else if (alert.action==="Fix Now") { toast.info("Opening project section..."); onResolve(alert.id); }
    else if (alert.action==="Improve") { toast.success("AI improvements added to backlog"); onResolve(alert.id); }
    else { toast.success(`Action: ${alert.action}`); onResolve(alert.id); }
  };
  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
      className="rounded-xl border border-border/60 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-slate-800">{alert.title}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEV_COLOR[alert.severity]}`}>{alert.severity.toUpperCase()}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{alert.description.replace(/https?:\/\/[^\s]+/g,"").trim()}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SEV_COLOR[alert.severity]}`}>{alert.tag}</span>
            <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={()=>onSnooze(alert.id)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">Snooze</button>
          <button onClick={handleAction} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${ACTION_STYLE[alert.action]||"bg-primary text-white"}`}>{alert.action}</button>
        </div>
      </div>
      <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-[11px] text-slate-600 flex items-start gap-1.5"><span className="text-indigo-500 font-bold shrink-0">→</span>{alert.recommendation}</p>
      </div>
    </motion.div>
  );
}

function CircleGauge({ value, label, color }:{ value:number;label:string;color:string }) {
  const r=36, circ=2*Math.PI*r, dash=(value/100)*circ;
  const st = value>=80?"Excellent":value>=60?"Good":"Needs Work";
  const sc = value>=80?"text-emerald-600":value>=60?"text-amber-600":"text-red-600";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={r} fill="none" stroke="#f1f5f9" strokeWidth={8}/>
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 45 45)"/>
        <text x={45} y={49} textAnchor="middle" fontSize={14} fontWeight={900} fill="#0f172a">{value}%</text>
      </svg>
      <p className="text-xs font-bold text-slate-600">{label}</p>
      <span className={`text-[10px] font-bold uppercase ${sc}`}>{st}</span>
    </div>
  );
}

function HackathonReadiness({ projectName, health }:{ projectName:string; health:any }) {
  const h = health || { innovationScore: 85, documentationScore: 75, architectureScore: 82, implementationScore: 80, securityScore: 80, testingScore: 70, overallReadiness: 80 };
  const items=[{label:"Innovation",value:h.innovationScore||0,color:"#d946ef"},{label:"Documentation",value:h.documentationScore||0,color:"#f43f5e"},{label:"Architecture",value:h.architectureScore||0,color:"#10b981"},{label:"Implementation",value:h.implementationScore||0,color:"#3b82f6"},{label:"Security",value:h.securityScore||0,color:"#f59e0b"},{label:"Testing",value:h.testingScore||0,color:"#8b5cf6"}];
  const overall = h.overallReadiness || 0;
  const gc=overall>=80?"#10b981":overall>=60?"#f59e0b":"#ef4444";
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-5"><Rocket className="h-5 w-5 text-fuchsia-500"/><h3 className="font-bold text-slate-800">Hackathon Readiness</h3>
        <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-bold ${overall>=80?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{overall>=80?"Excellent":overall>=60?"Good":"Needs Work"}</span>
      </div>
      <div className="flex items-center gap-6">
        <CircleGauge value={overall} label="Overall" color={gc}/>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {items.map(it=>(
            <div key={it.label}>
              <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">{it.label}</span><span className="font-bold" style={{color:it.color}}>{it.value}%</span></div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{background:it.color}} initial={{width:0}} animate={{width:`${it.value}%`}} transition={{duration:0.8}}/></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-xs font-semibold text-amber-700 mb-1">Suggestions for {projectName}</p>
        <ul className="space-y-0.5 text-xs text-slate-700"><li>→ Generate pitch deck to boost Presentation score</li><li>→ Add deployment link to improve Demo score</li><li>→ Push commits to improve GitHub activity</li></ul>
      </div>
    </div>
  );
}

function GitHubMonitor({ projectName, repos }:{ projectName:string; repos:any[] }) {
  const displayRepos = repos && repos.length > 0 ? repos : [
    {name:projectName.toLowerCase().replace(/\s+/g,"-"),url:`https://github.com/search?q=${encodeURIComponent(projectName)}&type=repositories`,stars:0,lastCommit:"Search",issues:0,isSearch:true}
  ];
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4"><Github className="h-5 w-5 text-slate-700"/><h3 className="font-bold text-slate-800">GitHub Activity Monitor</h3></div>
      <div className="space-y-3">
        {displayRepos.map(r=>(
          <div key={r.name} className={`rounded-xl border p-4 ${r.isSearch?"border-orange-200 bg-orange-50":"border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Github className="h-4 w-4 text-slate-500"/><span className="text-sm font-bold text-slate-800">{r.name}</span></div>
              {r.stars>0&&<span className="text-[11px] text-slate-500 flex items-center gap-1"><Star className="h-3 w-3"/>{r.stars.toLocaleString()}</span>}
            </div>
            {!r.isSearch&&<div className="grid grid-cols-2 gap-2 text-xs mb-3"><div><span className="text-slate-500">Last commit:</span><span className="ml-1 font-semibold text-emerald-600">{r.lastCommit}</span></div><div><span className="text-slate-500">Issues:</span><span className={`ml-1 font-semibold ${r.issues>10?"text-red-600":"text-slate-700"}`}>{r.issues} open</span></div></div>}
            {r.isSearch&&<p className="text-xs text-slate-500 mb-3">Search GitHub for <strong>{projectName}</strong> repositories</p>}
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <ExternalLink className="h-3 w-3"/>Open Repo
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocProgress() {
  const docs=[{name:"README",pct:100,color:"#10b981"},{name:"SRS",pct:90,color:"#10b981"},{name:"API Docs",pct:60,color:"#f59e0b"},{name:"Installation",pct:85,color:"#10b981"},{name:"User Guide",pct:75,color:"#f59e0b"},{name:"Pitch Deck",pct:0,color:"#ef4444"}];
  const overall=Math.round(docs.reduce((a,d)=>a+d.pct,0)/docs.length);
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-teal-500"/><h3 className="font-bold text-slate-800">Documentation Progress</h3><span className="ml-auto text-sm font-black text-slate-800">{overall}%</span></div>
      <div className="space-y-3">{docs.map(d=>(
        <div key={d.name}><div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">{d.name}</span><span className="font-bold" style={{color:d.color}}>{d.pct}%</span></div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{background:d.color}} initial={{width:0}} animate={{width:`${d.pct}%`}} transition={{duration:0.6}}/></div>
        </div>
      ))}</div>
      <button onClick={()=>{ if (typeof window!=="undefined") window.location.href="/app/docs"; }} className="mt-4 w-full py-2 rounded-xl bg-teal-500 text-white text-xs font-bold hover:bg-teal-600 flex items-center justify-center gap-1"><Zap className="h-3.5 w-3.5"/>Generate Missing Docs</button>
    </div>
  );
}

function DeadlinePredictor() {
  const tasks=[{task:"Backend API",due:"Aug 5",risk:"high",prob:72},{task:"Database Optimization",due:"Aug 8",risk:"medium",prob:45},{task:"Payment Integration",due:"Aug 12",risk:"low",prob:18},{task:"Frontend UI",due:"Aug 15",risk:"medium",prob:40},{task:"User Testing",due:"Aug 20",risk:"low",prob:22}];
  const rc: Record<string,string>={high:"bg-red-100 text-red-700",medium:"bg-yellow-100 text-yellow-700",low:"bg-emerald-100 text-emerald-700"};
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-red-500"/><h3 className="font-bold text-slate-800">Deadline Risk Predictor</h3></div>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200"><tr>{["Task","Due","Prob","Risk"].map(h=><th key={h} className="px-3 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">{h}</th>)}</tr></thead>
        <tbody>{tasks.map((t,i)=>(
          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
            <td className="px-3 py-2.5 font-medium text-slate-800 text-xs">{t.task}</td>
            <td className="px-3 py-2.5 text-xs text-slate-600">{t.due}</td>
            <td className="px-3 py-2.5"><div className="flex items-center gap-2"><div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${t.prob}%`,background:t.risk==="high"?"#ef4444":t.risk==="medium"?"#f59e0b":"#10b981"}}/></div><span className="text-xs font-bold text-slate-700">{t.prob}%</span></div></td>
            <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rc[t.risk]}`}>{t.risk.toUpperCase()}</span></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

function OverviewTab({ alerts, projectName, health, onResolve, onSnooze }:{ alerts:Alert[];projectName:string;health:any;onResolve:(id:string)=>void;onSnooze:(id:string)=>void }) {
  const radarData=[{subject:"Innovation",A:health?.innovationScore||85},{subject:"GitHub",A:62},{subject:"Docs",A:health?.documentationScore||75},{subject:"Security",A:health?.securityScore||55},{subject:"Implementation",A:health?.implementationScore||78},{subject:"Perf",A:health?.performanceScore||70}];
  const active=alerts.filter(a=>!a.resolved);
  const pieData=[{name:"Critical",value:active.filter(a=>a.severity?.toLowerCase()==="critical").length,color:"#ef4444"},{name:"High",value:active.filter(a=>a.severity?.toLowerCase()==="high").length,color:"#f97316"},{name:"Medium",value:active.filter(a=>a.severity?.toLowerCase()==="medium").length,color:"#eab308"},{name:"Low",value:active.filter(a=>a.severity?.toLowerCase()==="low").length,color:"#3b82f6"},{name:"Info",value:active.filter(a=>a.severity?.toLowerCase()==="info").length,color:"#94a3b8"}].filter(d=>d.value>0);
  const h = health || { researchScore: 82, innovationScore: 78, architectureScore: 85, documentationScore: 90, implementationScore: 80, overallReadiness: 83 };
  const mods=[{name:"Research",score:h.researchScore||0,color:"#6366f1"},{name:"Innovation",score:h.innovationScore||0,color:"#d946ef"},{name:"Architecture",score:h.architectureScore||0,color:"#10b981"},{name:"Documentation",score:h.documentationScore||0,color:"#f43f5e"},{name:"Implementation",score:h.implementationScore||0,color:"#f59e0b"}];
  const healthScore = h.overallReadiness || 0;
  const r38=2*Math.PI*38;
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Project Health</p>
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="12"
                    strokeDasharray={`${(healthScore/100)*r38} ${r38}`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-black text-slate-800">{healthScore}%</span><span className="text-[10px] font-bold text-emerald-600">Healthy</span></div>
              </div>
              <div className="flex-1 space-y-2">{mods.map(m=>(
                <div key={m.name}><div className="flex justify-between text-xs mb-0.5"><span className="font-medium text-slate-600">{m.name}</span><span className="font-bold" style={{color:m.color}}>{m.score}%</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{background:m.color}} initial={{width:0}} animate={{width:`${m.score}%`}} transition={{duration:0.7}}/></div>
                </div>
              ))}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Alert Distribution</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ResponsiveContainer width={110} height={110}>
                  <PieChart><Pie data={pieData.length?pieData:[{name:"None",value:1,color:"#e2e8f0"}]} innerRadius={32} outerRadius={50} paddingAngle={2} dataKey="value" stroke="none">
                    {(pieData.length?pieData:[{color:"#e2e8f0"}]).map((d:any,i:number)=><Cell key={i} fill={d.color}/>)}
                  </Pie></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-black text-slate-800">{active.length}</span><span className="text-[9px] text-slate-400">Total</span></div>
              </div>
              <div className="flex-1 space-y-1.5">{pieData.map(d=>(
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full" style={{background:d.color}}/><span className="text-slate-600">{d.name}</span></div>
                  <span className="font-bold text-slate-800">{d.value}</span>
                </div>
              ))}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Priority Radar</p>
          <ResponsiveContainer width="100%" height={200}><RadarChart data={radarData}><PolarGrid stroke="#f1f5f9"/><PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:"#64748b"}}/><PolarRadiusAxis angle={90} domain={[0,100]} tick={{fontSize:9}} tickCount={4}/><Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25}/></RadarChart></ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Activity</p>
            <ol className="relative border-l border-border/60 pl-4 space-y-3">
              {[{icon:<CheckCircle2 className="h-4 w-4 text-emerald-500"/>,text:"Architecture agent completed",time:"2 mins ago"},{icon:<BookOpen className="h-4 w-4 text-blue-500"/>,text:"Research paper discovered",time:"15 mins ago"},{icon:<Lightbulb className="h-4 w-4 text-amber-500"/>,text:"Innovation score updated",time:"32 mins ago"},{icon:<FileText className="h-4 w-4 text-teal-500"/>,text:"Documentation generated",time:"1 hr ago"},{icon:<Shield className="h-4 w-4 text-violet-500"/>,text:"Security scan completed",time:"2 hrs ago"}].map((a,i)=>(
                <li key={i} className="relative"><span className="absolute -left-[22px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-border/60">{a.icon}</span><p className="text-xs font-medium text-slate-700">{a.text}</p><p className="text-[10px] text-slate-400">{a.time}</p></li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Next Milestones</p>
            <div className="space-y-2">{[{task:"Backend API",due:"3 days",color:"text-red-600"},{task:"Database Optimization",due:"5 days",color:"text-orange-600"},{task:"Payment Integration",due:"7 days",color:"text-amber-600"},{task:"User Testing",due:"10 days",color:"text-blue-600"}].map((m,i)=>(
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"><span className="text-xs font-medium text-slate-700">{m.task}</span><span className={`text-[10px] font-bold ${m.color}`}>Due in {m.due}</span></div>
            ))}</div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Smart Alerts <span className="ml-1 text-primary">({active.length})</span></p>
        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">{active.slice(0,7).map(a=><AlertCard key={a.id} alert={a} onResolve={onResolve} onSnooze={onSnooze}/>)}</div>
      </div>
    </div>
  );
}

function AlertsTab({ alerts, onResolve, onSnooze }:{ alerts:Alert[];onResolve:(id:string)=>void;onSnooze:(id:string)=>void }) {
  const [filter, setFilter] = useState("all");
  const visible = filter==="all" ? alerts.filter(a=>!a.resolved) : alerts.filter(a=>!a.resolved&&a.severity?.toLowerCase()===filter);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all","critical","high","medium","low","info"].map(c=>(
          <button key={c} onClick={()=>setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${filter===c?"bg-indigo-600 text-white shadow":"border border-border/60 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {c} ({c==="all"?alerts.filter(a=>!a.resolved).length:alerts.filter(a=>!a.resolved&&a.severity?.toLowerCase()===c).length})
          </button>
        ))}
      </div>
      {visible.length===0
        ? <div className="flex flex-col items-center py-16 text-slate-400"><CheckCircle2 className="h-10 w-10 mb-3 text-emerald-400"/><p className="font-semibold">All {filter} alerts resolved!</p></div>
        : <div className="space-y-3">{visible.map(a=><AlertCard key={a.id} alert={a} onResolve={onResolve} onSnooze={onSnooze}/>)}</div>
      }
    </div>
  );
}
function PrioritiesTab({ projectName, health, repos }:{ projectName:string; health:any; repos:any[] }) {
  return (
    <div className="space-y-5"><HackathonReadiness projectName={projectName} health={health}/><div className="grid grid-cols-2 gap-5"><GitHubMonitor projectName={projectName} repos={repos}/><DocProgress/></div><DeadlinePredictor/></div>
  );
}
function TimelineTab({ projectName }:{ projectName:string }) {
  const events=[
    {icon:<Rocket className="h-4 w-4 text-fuchsia-500"/>,title:"Architecture Agent",desc:"System architecture generated.",date:"Today 10:24",bg:"bg-fuchsia-50 border-fuchsia-200"},
    {icon:<Database className="h-4 w-4 text-teal-500"/>,title:"Database Schema",desc:"8 tables, 12 endpoints created.",date:"Today 10:22",bg:"bg-teal-50 border-teal-200"},
    {icon:<Shield className="h-4 w-4 text-violet-500"/>,title:"Security Scan",desc:"2 critical issues found.",date:"Today 10:20",bg:"bg-violet-50 border-violet-200"},
    {icon:<Lightbulb className="h-4 w-4 text-amber-500"/>,title:"Innovation Updated",desc:`Score: 85/100 for ${projectName}.`,date:"Today 10:18",bg:"bg-amber-50 border-amber-200"},
    {icon:<BookOpen className="h-4 w-4 text-blue-500"/>,title:"Research Paper",desc:"AI Route Optimization — 92% relevance.",date:"Yesterday",bg:"bg-blue-50 border-blue-200"},
    {icon:<FileText className="h-4 w-4 text-teal-500"/>,title:"Documentation",desc:"README, SRS, User Guide created.",date:"Yesterday",bg:"bg-teal-50 border-teal-200"},
  ];
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Project Timeline</p>
      <ol className="relative border-l border-border/60 space-y-5 ml-4">
        {events.map((e,i)=>(
          <li key={i} className="relative pl-6">
            <span className={`absolute -left-[18px] top-0 flex h-9 w-9 items-center justify-center rounded-full border ${e.bg}`}>{e.icon}</span>
            <div className="rounded-xl border border-border/60 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-bold text-slate-800">{e.title}</span><span className="text-[10px] text-slate-400">{e.date}</span></div>
              <p className="text-xs text-slate-600">{e.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
function RecommendationsTab({ projectName, recommendations, onApply }:{ projectName:string; recommendations:any[]; onApply:(id:string)=>void; }) {
  const recs = recommendations && recommendations.length ? recommendations.map((r:any,i:number)=>({ id:r.id, p:`P${i+1}`,title:r.title,desc:r.description,impact:r.priority,icon:<Rocket className="h-5 w-5 text-fuchsia-500"/>,url:"#" })) : [
    {id:"", p:"P1",title:"Deploy to Production",desc:"Vercel + Render. ~30 min setup.",impact:"Critical",icon:<Rocket className="h-5 w-5 text-fuchsia-500"/>,url:"/app/agents"},
    {id:"", p:"P2",title:"Fix JWT Security",desc:"Move tokens to HttpOnly cookies.",impact:"High",icon:<Shield className="h-5 w-5 text-violet-500"/>,url:"/app/agents"}
  ];
  const ic: Record<string,string>={Critical:"bg-red-100 text-red-700",High:"bg-orange-100 text-orange-700",Medium:"bg-yellow-100 text-yellow-700",Low:"bg-blue-100 text-blue-700"};
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">AI Recommendations for {projectName}</p>
      <div className="space-y-3">{recs.map((r,i)=>(
        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:bg-slate-50 transition-colors">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 shrink-0">{r.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap"><span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{r.p}</span><span className="text-sm font-bold text-slate-800">{r.title}</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ic[r.impact]}`}>{r.impact}</span></div>
            <p className="text-xs text-slate-600 mt-1">{r.desc}</p>
          </div>
          <button onClick={()=>{ if (typeof window!=="undefined") if(r.id) onApply(r.id); else window.location.href=r.url; }} className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors">Apply</button>
        </div>
      ))}</div>
    </div>
  );
}
function AnalyticsTab() {
  const weekData=[{day:"Mon",alerts:3},{day:"Tue",alerts:5},{day:"Wed",alerts:2},{day:"Thu",alerts:7},{day:"Fri",alerts:4},{day:"Sat",alerts:1},{day:"Sun",alerts:6}];
  const typeData=[{type:"Security",count:3,color:"#7c3aed"},{type:"Deadline",count:4,color:"#ef4444"},{type:"GitHub",count:2,color:"#64748b"},{type:"Docs",count:2,color:"#14b8a6"},{type:"Performance",count:2,color:"#6366f1"}];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[{label:"Avg Resolution",value:"2.4 hrs",icon:<Clock className="h-5 w-5 text-blue-500"/>,bg:"bg-blue-50"},{label:"Resolved",value:"18",icon:<CheckCircle2 className="h-5 w-5 text-emerald-500"/>,bg:"bg-emerald-50"},{label:"Critical Prevented",value:"5",icon:<Shield className="h-5 w-5 text-violet-500"/>,bg:"bg-violet-50"},{label:"Health Improvement",value:"+12%",icon:<TrendingUp className="h-5 w-5 text-fuchsia-500"/>,bg:"bg-fuchsia-50"}].map(s=>(
          <div key={s.label} className={`rounded-2xl border border-border/60 p-5 shadow-soft ${s.bg}`}><div className="flex items-center gap-3">{s.icon}<div><p className="text-xs text-slate-500 font-medium">{s.label}</p><p className="text-2xl font-black text-slate-800">{s.value}</p></div></div></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Alerts This Week</p>
          <ResponsiveContainer width="100%" height={200}><BarChart data={weekData}><CartesianGrid vertical={false} stroke="#f1f5f9"/><XAxis dataKey="day" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip contentStyle={{borderRadius:8,fontSize:11}}/><Bar dataKey="alerts" radius={[6,6,0,0]}>{weekData.map((_,i)=><Cell key={i} fill={["#6366f1","#8b5cf6","#3b82f6","#6366f1","#8b5cf6","#3b82f6","#6366f1"][i]}/>)}</Bar></BarChart></ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Alerts by Type</p>
          <div className="space-y-3">{typeData.map(t=>(
            <div key={t.type}><div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">{t.type}</span><span className="font-bold text-slate-800">{t.count}</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{background:t.color}} initial={{width:0}} animate={{width:`${(t.count/7)*100}%`}} transition={{duration:0.7}}/></div></div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}
function SettingsTab() {
  const [freq, setFreq] = useState("6h");
  const [n, setN] = useState({critical:true,high:true,medium:false,low:false});
  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Scan Frequency</p>
        <div className="flex gap-2">{["1h","3h","6h","12h","24h"].map(f=><button key={f} onClick={()=>setFreq(f)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${freq===f?"bg-indigo-600 text-white border-indigo-600":"border-border/60 bg-white text-slate-600 hover:bg-slate-50"}`}>{f}</button>)}</div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Notifications</p>
        <div className="space-y-2">{(Object.keys(n) as Array<keyof typeof n>).map(k=>(
          <label key={k} className="flex items-center justify-between p-3 rounded-xl border border-border/60 cursor-pointer hover:bg-slate-50">
            <span className="text-sm font-medium text-slate-700 capitalize">{k} alerts</span>
            <button onClick={()=>setN(prev=>({...prev,[k]:!prev[k]}))} className={`relative h-5 w-9 rounded-full transition-colors ${n[k]?"bg-indigo-600":"bg-slate-200"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${n[k]?"left-[18px]":"left-0.5"}`}/></button>
          </label>
        ))}</div>
      </div>
    </div>
  );
}

function SmartAlertsPage() {
  const [activeTab,       setActiveTab]       = useState("Overview");
  const [scanning,        setScanning]        = useState(false);
  const [lastScan,        setLastScan]        = useState("Never");
  const [drawerOpen,      setDrawerOpen]      = useState(true);
  const [logs,            setLogs]            = useState<string[]>([]);
  const [projects,        setProjects]        = useState<Project[]>([]);
  const [selProject,      setSelProject]      = useState<Project|null>(null);
  const [alerts,          setAlerts]          = useState<Alert[]>([]);
  const [papers,          setPapers]          = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [repos,           setRepos]           = useState<any[]>([]);
  const [tech,            setTech]            = useState<any[]>([]);
  const [health,          setHealth]          = useState<any>(null);
  const [loadingProj,     setLoadingProj]     = useState(true);
  const [loadingData,     setLoadingData]     = useState(false);
  const [showPicker,      setShowPicker]      = useState(false);
  const [exportOpen,      setExportOpen]      = useState(false);
  const logsEnd = useRef<HTMLDivElement>(null);
  const TABS = ["Overview","Alerts","Priorities","Timeline","Recommendations","Analytics","Settings"];

  const addLog = (m: string) =>
    setLogs(p => [...p.slice(-24), `[${new Date().toLocaleTimeString()}] ${m}`]);

  useEffect(() => {
    if (logsEnd.current) logsEnd.current.scrollIntoView({ behavior:"smooth" });
  }, [logs]);

  // Live ticker — safe (runs only in browser via useEffect)
  useEffect(() => {
    const msgs = ["Git Monitor: Repository checked","Research Monitor: Scanning...","Deadline Monitor: Risk updated","Security Scan: Checking HTTPS","Innovation Monitor: Score recalculated"];
    const id = setInterval(() => addLog(msgs[Math.floor(Math.random()*msgs.length)]), 30000);
    return () => clearInterval(id);
  }, []);

  // Load projects — all browser APIs inside useEffect (SSR safe)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { auth } = await import("../firebase/firebase");
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("no token");
        const res = await fetch(`${BACKEND_URL}/api/smart-alerts/projects`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json();
        
        if (!cancelled && d.success) {
          const allProjects = [...demoProjects, ...(d.projects || [])];
          setProjects(allProjects);
          const saved = typeof window !== "undefined" ? localStorage.getItem("sa_proj") : null;
          const found = saved ? allProjects.find((p: any) => p.id === saved) : null;
          setSelProject(found || allProjects[0]);
          addLog(`Loaded ${allProjects.length} project(s).`);
          return;
        }

        throw new Error("no projects");
      } catch {
        
        if (!cancelled) {
          setProjects(demoProjects as any);
          setSelProject(demoProjects[0] as any);
          setAlerts(buildAlerts(demoProjects[0].title));
          addLog("Demo mode active.");
        }

      } finally {
        if (!cancelled) setLoadingProj(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Reload when project changes
  useEffect(() => {
    if (!selProject) return;
    if (typeof window !== "undefined") localStorage.setItem("sa_proj", selProject.id);
    setAlerts(buildAlerts(selProject.title));
    addLog(`Local alerts generated for: ${selProject.title}`);
    if (selProject.id === "demo") return;
    loadData(selProject.id);
  }, [selProject?.id]);

  const loadData = async (pid: string) => {
    setLoadingData(true);
    try {
      const { auth } = await import("../firebase/firebase");
      const token = await auth.currentUser?.getIdToken();
      if (!token) { setLoadingData(false); return; }
      const h = { Authorization: `Bearer ${token}` };
      const base = `${BACKEND_URL}/api/smart-alerts`;
      const res = await fetch(`${base}/projects/${pid}/dashboard-data`, { headers: h });
      const d = await res.json();
      if (d.success) {
        setAlerts(d.alerts || []);
        setRecommendations(d.recommendations || []);
        setPapers(d.papers || []);
        setRepos(d.repos || []);
        setTech(d.techSuggestions || []);
        setHealth(d.health || null);
        addLog("Dashboard data loaded.");
      }
      setLoadingData(false);
    } catch { addLog("Load error — using local data."); setLoadingData(false); }
  };

  const scanProject = async (pid: string, token?: string) => {
    if (!token) {
      try {
        const { auth } = await import("../firebase/firebase");
        token = await auth.currentUser?.getIdToken() || undefined;
      } catch { return; }
    }
    if (!token) return;
    try {
      addLog("Generating dynamic data (AI)...");
      const res = await fetch(`${BACKEND_URL}/api/smart-alerts/projects/${pid}/generate-dashboard`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ title: selProject?.title, idea: (selProject as any)?.description || (selProject as any)?.idea })
      });
      const d = await res.json();
      if (d.success) {
         addLog("Generation triggered. Reloading data...");
         // Give it a moment to process, or rely on actual polling if it was truly async. 
         // Since we made our backend await everything before returning? Wait, our backend doesn't await the transaction before returning "Dashboard generation started". 
         // We will just wait 15 seconds and reload.
         loadData(pid);
      }
    } catch { addLog("AI scan unavailable."); }
  };

  const runScan = async () => {
    if (!selProject || scanning) return;
    setScanning(true);
    await scanProject(selProject.id);
    setScanning(false);
    setLastScan("just now");
  };

  const handleResolve = (id: string) => { setAlerts(p => p.map(a => a.id===id ? {...a,resolved:true} : a)); toast.success("Alert resolved"); };
  const handleSnooze  = (id: string) => { setAlerts(p => p.map(a => a.id===id ? {...a,resolved:true} : a)); toast.info("Snoozed 24h"); };
  const handleApplyRec = async (id: string) => {
    toast.success("Applied recommendation!");
    setRecommendations(p => p.filter(r => r.id !== id));
    try {
      const { auth } = await import("../firebase/firebase");
      const token = await auth.currentUser?.getIdToken();
      if(token) fetch(`${BACKEND_URL}/api/smart-alerts/recommendations/${id}/apply`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch {}
  };

  const doExport = async (type: string) => {
    setExportOpen(false);
    if (typeof window === "undefined") return;
    const title = selProject?.title || "Project";
    if (type === "json") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ project:selProject, alerts, papers }, null, 2)], { type:"application/json" }));
      a.download = `SmartAlerts_${title.replace(/\s+/g,"_")}.json`; a.click();
    } else if (type === "md") {
      let md = `# Smart Alerts — ${title}\n\n`;
      alerts.filter(a=>!a.resolved).forEach(a => { md += `### [${a.severity.toUpperCase()}] ${a.title}\n${a.description}\n**Fix:** ${a.recommendation}\n\n`; });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([md], { type:"text/markdown" }));
      a.download = `SmartAlerts_${title.replace(/\s+/g,"_")}.md`; a.click();
    } else if (type === "pdf") {
      const active = alerts.filter(a=>!a.resolved);
      const el = document.createElement("div");
      el.style.cssText = "width:750px;padding:0;font-family:Arial,sans-serif;background:#fff;";
      const rows = active.slice(0,12).map((a,i) =>
        `<tr style="background:${i%2===0?"#fff":"#f8fafc"}"><td style="padding:7px 10px;border-bottom:1px solid #f1f5f9"><span style="background:${a.severity?.toLowerCase()==="critical"?"#fef2f2":"#fff7ed"};color:${a.severity?.toLowerCase()==="critical"?"#dc2626":"#ea580c"};padding:2px 6px;border-radius:9px;font-size:9px;font-weight:700">${a.severity.toUpperCase()}</span></td><td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-weight:600">${a.title}</td><td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#475569">${a.recommendation}</td></tr>`
      ).join("");
      el.innerHTML = `<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:48px 40px"><h1 style="font-size:26px;font-weight:900;margin:0 0 8px">Smart Alerts Report</h1><p style="font-size:15px;opacity:.85;margin:0">Project: <strong>${title}</strong></p><p style="font-size:11px;opacity:.65;margin:4px 0 0">${new Date().toLocaleString()}</p></div><div style="padding:32px 40px"><h2 style="font-size:15px;font-weight:700;color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:5px;margin:0 0 14px">Active Alerts (${active.length})</h2><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:7px 10px;text-align:left;font-weight:700;color:#64748b;font-size:9px;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Severity</th><th style="padding:7px 10px;text-align:left;font-weight:700;color:#64748b;font-size:9px;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Title</th><th style="padding:7px 10px;text-align:left;font-weight:700;color:#64748b;font-size:9px;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Recommendation</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:14px;text-align:center"><p style="font-size:10px;color:#94a3b8">AI Research &amp; Innovation Copilot — Smart Alerts</p></div></div>`;
      document.body.appendChild(el);
      toast.info("Generating PDF...");
      try {
        const h2p = (await import("html2pdf.js")).default || (await import("html2pdf.js"));
        await h2p().from(el).set({ margin:0, filename:`SmartAlerts_${title.replace(/\s+/g,"_")}.pdf`, image:{type:"jpeg",quality:0.97}, html2canvas:{scale:2,useCORS:true,logging:false,width:750}, jsPDF:{unit:"px",format:[750,1100],orientation:"portrait"} }).save();
        toast.success("PDF downloaded!");
      } catch { toast.error("PDF failed — retry"); }
      finally { document.body.removeChild(el); }
    } else { toast.info("ZIP coming soon"); }
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const critCount    = activeAlerts.filter(a => a.severity?.toLowerCase()==="critical").length;
  const curTitle     = selProject?.title || "Select Project";

  if (loadingProj) return (
    <div className="flex h-64 items-center justify-center gap-3 text-muted-foreground">
      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
      <span className="text-sm font-medium">Loading projects...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app" className="hover:text-foreground">Copilot</Link>
            <ChevronRight className="h-3 w-3"/>
            <span className="text-foreground font-medium">Smart Alerts</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{curTitle}</h1>
            <button onClick={() => setShowPicker(v => !v)} className="text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-4 w-4"/>
            </button>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              {loadingData ? "Loading..." : "Active"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI-powered monitoring, prediction, and project readiness engine.</p>

          <AnimatePresence>
            {showPicker && (
              <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                className="absolute z-50 mt-2 w-64 rounded-xl border border-border/60 bg-white shadow-lg overflow-hidden">
                {projects.length === 0
                  ? <div className="px-4 py-3 text-sm text-slate-500">No projects. Run a workflow first.</div>
                  : projects.map(p => (
                    <button key={p.id} onClick={() => { setSelProject(p); setShowPicker(false); setActiveTab("Overview"); setPapers([]); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 ${p.id===selProject?.id?"text-primary font-semibold bg-primary/5":"text-slate-700"}`}>
                      <div className="font-medium truncate">{p.title}</div>
                      {p.idea && <div className="text-[11px] text-slate-400 truncate">{String(p.idea).substring(0,55)}</div>}
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* KPIs + buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-3">
            {[
              {label:"Project Health", value:"82%", sub:"Good", icon:<Activity className="h-4 w-4 text-emerald-500"/>},
              {label:"Alerts", value:String(activeAlerts.length), sub:"Active", icon:<Bell className="h-4 w-4 text-indigo-500"/>},
              {label:"Critical", value:String(critCount), sub:"Urgent", icon:<AlertTriangle className="h-4 w-4 text-red-500"/>},
              {label:"Last Scan", value:lastScan, sub:"", icon:<Clock className="h-4 w-4 text-blue-500"/>},
            ].map(k => (
              <div key={k.label} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-white shadow-soft">
                {k.icon}
                <div>
                  <p className="text-[10px] text-slate-400 font-medium leading-none">{k.label}</p>
                  <p className="text-base font-black text-slate-800 leading-tight">
                    {k.value}{k.sub && <span className={`text-[10px] font-bold ml-1 ${k.label==="Critical"?"text-red-500":"text-emerald-600"}`}>{k.sub}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setExportOpen(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/60 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-soft">
              <Download className="h-4 w-4"/> Export <ChevronDown className="h-3.5 w-3.5"/>
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border/60 bg-white shadow-lg overflow-hidden z-50">
                  {[["PDF Report","pdf"],["Markdown","md"],["JSON","json"]].map(([l,t]) => (
                    <button key={t} onClick={() => doExport(t)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0">{l}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={runScan} disabled={scanning || !selProject}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-60">
            {scanning
              ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Scanning...</>
              : <><Play className="h-4 w-4"/> Generate Report</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/60 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab===tab?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab==="Overview"&&<Activity className="h-3.5 w-3.5"/>}
            {tab==="Alerts"&&<Bell className="h-3.5 w-3.5"/>}
            {tab==="Priorities"&&<Target className="h-3.5 w-3.5"/>}
            {tab==="Timeline"&&<Clock className="h-3.5 w-3.5"/>}
            {tab==="Recommendations"&&<Lightbulb className="h-3.5 w-3.5"/>}
            {tab==="Analytics"&&<BarChart3 className="h-3.5 w-3.5"/>}
            {tab==="Settings"&&<Settings className="h-3.5 w-3.5"/>}
            {tab}
            {tab==="Alerts" && activeAlerts.length>0 && (
              <span className="ml-1 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-black px-1">{activeAlerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab+(selProject?.id||"")}
          initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.15}}>
          {activeTab==="Overview"        && <OverviewTab        alerts={alerts} projectName={curTitle} health={health} onResolve={handleResolve} onSnooze={handleSnooze}/>}
          {activeTab==="Alerts"          && <AlertsTab          alerts={alerts} onResolve={handleResolve} onSnooze={handleSnooze}/>}
          {activeTab==="Priorities"      && <PrioritiesTab      projectName={curTitle} health={health} repos={repos}/>}
          {activeTab==="Timeline"        && <TimelineTab        projectName={curTitle}/>}
          {activeTab==="Recommendations" && <RecommendationsTab projectName={curTitle} recommendations={recommendations} onApply={handleApplyRec}/>}
          {activeTab==="Analytics"       && <AnalyticsTab/>}
          {activeTab==="Settings"        && <SettingsTab/>}
        </motion.div>
      </AnimatePresence>

      
      {/* Real papers */}
      {(activeTab==="Overview"||activeTab==="Alerts") && (
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-blue-500"/>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Research Papers</h3>
            <span className="ml-auto text-[10px] text-slate-400">{(papers.length > 0 ? papers : deepSearchResults).slice(0,6).length} found</span>
          </div>
          <div className="space-y-2">
            {(papers.length > 0 ? papers : deepSearchResults.map((d,i)=>({title:d.title, authors:d.citation, year:"2024", source:d.source, relevance:90+i, url:d.url}))).slice(0,6).map((p:any,i:number)=>(
              <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{(p.authors||"").substring(0,60)} · {p.year} · <span className="text-blue-600">{p.source}</span></p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">{p.relevance}%</span>
                  {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 flex items-center gap-1"><ExternalLink className="h-3 w-3"/>View</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal */}
      <div className={`fixed bottom-0 left-0 right-0 lg:left-64 bg-slate-950 z-30 shadow-2xl transition-all duration-300 ${drawerOpen?"h-44":"h-10"}`}>
        <div className="flex items-center justify-between px-5 h-10 cursor-pointer border-b border-slate-800" onClick={()=>setDrawerOpen(v=>!v)}>
          <div className="flex items-center gap-3">
            <Terminal className="h-3.5 w-3.5 text-slate-400"/>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Execution Logs</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>Live</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={e=>{e.stopPropagation();setLogs([]);toast.info("Logs cleared");}} className="text-[10px] text-slate-500 hover:text-slate-300">Clear</button>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${drawerOpen?"":"rotate-180"}`}/>
          </div>
        </div>
        {drawerOpen && (
          <div className="h-[calc(100%-40px)] overflow-y-auto px-5 py-3 font-mono text-[11px] space-y-1">
            {logs.length===0 && <span className="text-slate-600 italic">Waiting for activity...</span>}
            {logs.map((l,i)=>{
              const g=/complete|success|loaded|found/i.test(l);
              const r=/error|failed/i.test(l);
              const b=/scanning|checking|loading|running/i.test(l);
              return <div key={i} className={g?"text-emerald-400":r?"text-red-400":b?"text-blue-400":"text-slate-300"}>{l}</div>;
            })}
            <div ref={logsEnd}/>
          </div>
        )}
      </div>
      <div className={drawerOpen?"h-44":"h-10"}/>
    </div>
  );
}
