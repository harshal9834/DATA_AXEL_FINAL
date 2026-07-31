import { createFileRoute, Link, Outlet, useMatches, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, FolderOpen, Trash2, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/app-shell";
import { useState, useEffect } from "react";
import { useProjects, useDeleteProject } from "../hooks/useProjects";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "../firebase/firebase";
import io, { Socket } from "socket.io-client";
import { BACKEND_URL } from "../lib/api";

export const Route = createFileRoute("/app/projects")({
  head: () => ({
    meta: [
      { title: "Projects — AI Research Copilot" },
      { name: "description", content: "Manage your AI research projects." },
    ],
  }),
  component: ProjectsLayout,
});

// Debounce hook for search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function ProjectsLayout() {
  const matches = useMatches();
  const navigate = useNavigate();
  const isDetail = matches.some((m) => m.routeId === "/app/projects/$projectId");
  
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [status, setStatus] = useState("All");

  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Real-time invalidation
  useEffect(() => {
    const fetchToken = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const s = io(BACKEND_URL, { auth: { token } });
      s.on('dashboard_update', () => queryClient.invalidateQueries({ queryKey: ['projects'] }));
      s.on('agent_activity', () => queryClient.invalidateQueries({ queryKey: ['projects'] }));
      setSocket(s);
    };
    fetchToken();
    return () => { socket?.disconnect(); };
  }, [queryClient]);

  const { data: projects = [], isLoading } = useProjects({ search: debouncedSearch, status });
  const deleteProject = useDeleteProject();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate(id);
    }
  };

  if (isDetail) return <Outlet />;

  return (
    <div className="font-sans text-slate-800 bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Projects"
        subtitle="All your research projects in one place — pinned, filtered and searchable."
      />
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your projects..." 
            className="w-full rounded-xl border border-slate-200/80 bg-white py-3 pl-10 pr-4 text-[15px] font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all" 
          />
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200/80 shadow-sm">
          {["All", "In Progress", "Research", "Architecture", "Completed"].map((f) => (
            <button 
              key={f} 
              onClick={() => setStatus(f)}
              className={`rounded-lg px-4 py-2.5 text-[13px] font-bold transition-all ${
                f === status 
                  ? "bg-slate-100 text-indigo-700" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-3xl border border-slate-100 shadow-sm" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="h-24 w-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <FolderKanban className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">No Projects Yet</h3>
          <p className="text-[15px] text-slate-500 font-medium mb-8 max-w-sm">
            {search || status !== 'All' 
              ? "We couldn't find any projects matching your current filters." 
              : "Create your first project using AI Mentor or Generate App."}
          </p>
          {!(search || status !== 'All') && (
            <button 
              onClick={() => navigate({ to: '/app/voice' })}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-[14px] font-bold text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
            >
              Go to AI Mentor
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to="/app/workflow/$workflowId" params={{ workflowId: p.id }} className="block bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                   <button onClick={(e) => handleDelete(e, p.id)} className="p-2 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-black text-xl flex items-center justify-center border border-indigo-200/50 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {p.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">{p.domain}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${p.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>{p.status}</span>
                    </div>
                    <h3 className="text-[17px] font-black text-slate-800 leading-tight truncate group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                  </div>
                </div>
                
                <p className="line-clamp-2 text-[13px] font-medium text-slate-500 mb-6 h-10">{p.description}</p>
                
                <div className="grid grid-cols-3 gap-3 text-center mb-6">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 py-2.5">
                    <div className="font-black text-slate-800 text-[14px]">{p.research}%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Research</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 py-2.5">
                    <div className="font-black text-slate-800 text-[14px]">{p.innovation}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Score</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 py-2.5">
                    <div className="font-black text-slate-800 text-[14px] truncate px-1">{p.difficulty}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Level</div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-2 flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Progress</span>
                    <span className="text-indigo-600">{p.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000 ease-out" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between pt-5 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5"><FolderOpen className="h-3.5 w-3.5" /> {p.currentStage}</span>
                  <span className="text-[11px] font-bold text-slate-400">Updated {new Date(p.lastUpdated).toLocaleDateString()}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
