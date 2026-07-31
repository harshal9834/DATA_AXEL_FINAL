import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Layers, Sparkles, Activity, Target, ShieldAlert,
  Clock, Plus, CheckCircle2, Play,
  Trophy, TrendingUp, Zap, FileText, Bot, Paperclip, Mic, ArrowRight
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { BACKEND_URL } from "../lib/api";
import io, { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMinimalSummary,
  useMinimalIntelligence,
  useMinimalAnalytics,
  useMinimalProjects,
  useMinimalActivity
} from "../hooks/useMinimalDashboard";
import { AIHeroInput } from "../components/AIHeroInput";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Premium AI Copilot" },
      { name: "description", content: "Next-gen AI Operating System." },
    ],
  }),
  component: VibrantDashboard,
});

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

function VibrantDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Queries
  const { data: summary, isLoading: summaryLoading } = useMinimalSummary();
  const { data: intelligence, isLoading: intelligenceLoading } = useMinimalIntelligence();
  const { data: analytics, isLoading: analyticsLoading } = useMinimalAnalytics();
  const { data: projects, isLoading: projectsLoading } = useMinimalProjects();
  const { data: activity, isLoading: activityLoading } = useMinimalActivity();

  // Socket IO Setup
  useEffect(() => {
    const fetchToken = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const s = io(BACKEND_URL, { auth: { token } });
      s.on('connect', () => console.log('Socket Connected'));
      s.on('dashboard_update', () => queryClient.invalidateQueries({ queryKey: ['minimal'] }));
      s.on('agent_activity', () => queryClient.invalidateQueries({ queryKey: ['minimal', 'activity'] }));
      setSocket(s);
    };
    fetchToken();
    return () => { socket?.disconnect(); };
  }, [queryClient]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-24 pt-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800 bg-slate-50/50 min-h-screen relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* SECTION 1: WELCOME HERO */}
      <section className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
        <WelcomeHero lastProject={projects?.[0]} loading={projectsLoading} navigate={navigate} />
      </section>

      {/* SECTION 2: EXECUTIVE SUMMARY */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard 
          title="Projects" count={summary?.totalProjects} loading={summaryLoading} 
          icon={<Layers className="h-6 w-6" />} color="text-blue-600" bg="bg-blue-100" trend="+12%" 
        />
        <KPICard 
          title="Active" count={summary?.activeProjects} loading={summaryLoading} 
          icon={<Activity className="h-6 w-6" />} color="text-indigo-600" bg="bg-indigo-100" trend="On track" 
        />
        <KPICard 
          title="Completed" count={summary?.completedProjects} loading={summaryLoading} 
          icon={<CheckCircle2 className="h-6 w-6" />} color="text-emerald-500" bg="bg-emerald-100" trend="+4%" 
        />
        <KPICard 
          title="AI Sessions" count={summary?.aiSessionsCount} loading={summaryLoading} 
          icon={<Bot className="h-6 w-6" />} color="text-pink-500" bg="bg-pink-100" trend="High" 
        />
        <KPICard 
          title="Drafts" count={summary?.draftProjects} loading={summaryLoading} 
          icon={<FileText className="h-6 w-6" />} color="text-orange-500" bg="bg-orange-100" trend="Review" 
        />
      </section>

      {/* SECTION 3: PROJECT INTELLIGENCE CENTER */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" /> Project Intelligence
        </h2>
        
        {intelligenceLoading ? (
          <div className="h-28 bg-slate-100 animate-pulse rounded-2xl" />
        ) : (
          <div className="grid gap-10 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            <div className="md:col-span-1 flex flex-col justify-center group cursor-default">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform"><Trophy className="h-3.5 w-3.5" /></div> Best Project
              </span>
              <span className="text-xl font-bold text-slate-800 truncate leading-snug">{intelligence?.bestProject?.title || 'None'}</span>
              <span className="text-sm font-semibold text-emerald-500 mt-1">{intelligence?.bestProject?.progress || 0}% Completed</span>
            </div>

            <div className="md:col-span-1 flex flex-col justify-center md:pl-10 pt-6 md:pt-0 group cursor-default">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-500 group-hover:scale-110 transition-transform"><ShieldAlert className="h-3.5 w-3.5" /></div> Needs Attention
              </span>
              <span className="text-xl font-bold text-slate-800 truncate leading-snug">{intelligence?.needsAttention?.title || 'None'}</span>
              <span className="text-sm font-semibold text-rose-500 mt-1">{intelligence?.needsAttention?.issue || 'All Good'}</span>
            </div>

            <div className="md:col-span-1 flex flex-col justify-center md:pl-10 pt-6 md:pt-0 group cursor-default">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform"><Target className="h-3.5 w-3.5" /></div> Next Action
              </span>
              <span className="text-[15px] font-bold text-slate-800 leading-snug">{intelligence?.suggestedAction}</span>
            </div>

            <div className="md:col-span-1 flex flex-col justify-center md:pl-10 pt-6 md:pt-0 group cursor-default">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform"><Activity className="h-3.5 w-3.5" /></div> Global Progress
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight leading-none mt-1">{intelligence?.overallCompletion || 0}</span>
                <span className="text-xl font-bold text-indigo-400">%</span>
              </div>
            </div>

          </div>
        )}
      </section>

      {/* SECTION 4: ANALYTICS */}
      <section className="grid gap-6 md:grid-cols-2">
        
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-blue-500"></div> Projects Created Over Time
           </h3>
           {analyticsLoading ? <div className="h-56 bg-slate-100 animate-pulse rounded-2xl" /> : (
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={analytics?.projectsGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} dx={-10} />
                   <Tooltip 
                     cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }} 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 600 }} 
                   />
                   <Area type="monotone" dataKey="projects" stroke="#3B82F6" strokeWidth={3} fill="url(#colorGrowth)" activeDot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500">
           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-purple-500"></div> Project Status Distribution
           </h3>
           {analyticsLoading ? <div className="h-56 bg-slate-100 animate-pulse rounded-2xl" /> : (
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={analytics?.statusDistribution} cx="50%" cy="50%" innerRadius={75} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={10}>
                     {analytics?.statusDistribution?.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                   </Pie>
                   <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }} />
                   <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748B', paddingTop: '10px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           )}
        </div>

      </section>

      {/* SECTIONS 5, 6 & 7 */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Section 5: Recent Projects */}
        <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-500/5 transition-all duration-500">
          <div className="p-7 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-400" /> Recent Projects
            </h2>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {projectsLoading ? (
              <div className="p-7 space-y-5">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}
              </div>
            ) : projects?.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-sm font-semibold">No projects yet.</div>
            ) : projects?.map((p: any) => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 transition-all duration-300 group gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-700 font-bold text-lg border border-indigo-200/50 group-hover:scale-110 transition-transform">
                    {p.title.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-bold text-slate-800 truncate">{p.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[12px] text-slate-500 font-semibold">
                      <span>{p.domain}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className={`px-2 py-0.5 rounded-md ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-72">
                  <div className="w-24 flex-shrink-0">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span className="text-slate-600">{p.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full group-hover:shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all" style={{width: `${p.progress}%`}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                     <button onClick={() => navigate({ to: '/app/workflow/' + p.id })} className="px-4 py-2 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg">Continue</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6 flex flex-col">
          {/* Section 6: Quick Actions */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-slate-400" /> Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <QuickActionButton 
                icon={<Plus className="h-4 w-4" />} 
                title="New Project" 
                color="from-blue-500 to-indigo-500"
                onClick={() => navigate({ to: '/app/projects' })} 
              />
              <QuickActionButton 
                icon={<Mic className="h-4 w-4" />} 
                title="Voice Copilot" 
                color="from-purple-500 to-pink-500"
                onClick={() => navigate({ to: '/app/voice' })} 
              />
              <QuickActionButton 
                icon={<Activity className="h-4 w-4" />} 
                title="Deep Research" 
                color="from-emerald-500 to-teal-500"
                onClick={() => navigate({ to: '/app/projects' })} 
              />
              {projects?.[0] && (
                <button onClick={() => navigate({ to: '/app/workflow/' + projects[0].id })} className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-300 text-[14px] font-bold group mt-2 border border-slate-700/50">
                  <span className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform"><Play className="h-4 w-4" /></div> 
                    Continue Last Project
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              )}
            </div>
          </section>

          {/* Section 7: Recent Activity */}
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex-1 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-500">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" /> Recent Activity
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-slate-100">
              {activityLoading ? (
                <div className="pl-9 space-y-6">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-50 animate-pulse rounded-xl" />)}
                </div>
              ) : activity?.length === 0 ? (
                <div className="pl-9 text-[14px] text-slate-500 font-semibold">No recent activity.</div>
              ) : activity?.map((log: any, index: number) => (
                <div key={log.id} className="relative pl-9 group">
                  <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-2 border-white bg-slate-100 group-hover:bg-indigo-500 group-hover:scale-125 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white hidden group-hover:block" />
                  </div>
                  <div className="text-[14px] font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{log.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500 font-semibold">
                    <span className="truncate max-w-[180px] bg-slate-100 px-2 py-0.5 rounded-md">{log.project}</span>
                    <span>•</span>
                    <span className="text-slate-400">{new Date(log.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}

function QuickActionButton({ icon, title, color, onClick }: { icon: React.ReactNode, title: string, color: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-[14px] font-bold text-slate-700 group bg-white relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      <span className="flex items-center gap-3 relative z-10">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          {icon}
        </div> 
        {title}
      </span>
      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-800 group-hover:translate-x-1 transition-all relative z-10" />
    </button>
  );
}

function KPICard({ title, count, loading, icon, color, bg, trend }: { title: string, count: number | undefined, loading: boolean, icon: React.ReactNode, color: string, bg: string, trend: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-default group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-${color.split('-')[1]}-500 opacity-0 group-hover:opacity-5 rounded-bl-full transition-opacity duration-500`}></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm`}>{icon}</div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="relative z-10">
        {loading ? (
          <div className="h-10 w-20 bg-slate-100 animate-pulse rounded-xl" />
        ) : (
          <div className="flex items-end justify-between">
            <div className="text-3xl font-black tracking-tight text-slate-800">{count || 0}</div>
            <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{trend}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const MOTIVATIONS = [
  "Ready to build something amazing today?",
  "Let's continue turning your ideas into reality.",
  "Your AI Copilot is ready to help you build faster.",
  "Every great product starts with one idea. Let's continue yours.",
  "Welcome back! Your projects are waiting."
];

function WelcomeHero({ lastProject, loading, navigate }: { lastProject: any, loading: boolean, navigate: any }) {
  const [greeting, setGreeting] = useState("Good Day");
  const [motivation, setMotivation] = useState(MOTIVATIONS[0]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
  }, []);

  const userName = auth.currentUser?.displayName?.split(' ')[0] || "Builder";

  return (
    <div className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl px-10 pt-14 pb-10 shadow-lg shadow-indigo-500/5 relative overflow-hidden flex flex-col justify-center items-center text-center w-full min-h-[420px]">

      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

      <div className="space-y-8 relative z-10 w-full max-w-4xl flex flex-col items-center">

        {/* Greeting */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider w-max shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            AI Copilot Ready
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 mb-3">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{userName}</span>
          </h1>
          <p className="text-[16px] font-semibold text-slate-500 max-w-xl">{motivation}</p>
        </div>

        {/* Universal AI Input */}
        <AIHeroInput />

      </div>
    </div>
  );
}
