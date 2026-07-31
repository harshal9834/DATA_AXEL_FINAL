import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, Search, Network, Boxes, Library,
  FileText, Sparkles, Settings, Bell, Sun, Command, LogOut, ChevronRight, Bot,
} from "lucide-react";
import { useState } from "react";
import AIAssistantFab from "./ai-assistant-fab";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/agents", label: "AI Agents", icon: Bot },
  { to: "/app/deepsearch", label: "DeepSearch", icon: Search },
  { to: "/app/knowledge", label: "Knowledge Clustering", icon: Network },
  { to: "/app/architecture", label: "Architecture", icon: Boxes },
  { to: "/app/resources", label: "Resources", icon: Library },
  { to: "/app/docs", label: "Documentation", icon: FileText },
  { to: "/app/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");

  return (
    <div className="min-h-screen bg-background bg-glow">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl lg:flex">
        <Link to="/app" className="flex items-center gap-2.5 px-6 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight">Copilot</div>
            <div className="text-[11px] text-muted-foreground leading-tight">Research & Innovation</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative h-4.5 w-4.5 shrink-0" />
                <span className="relative truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-fuchsia-500/5 to-cyan-500/5 p-4">
          <div className="text-xs font-semibold">Pro Plan</div>
          <p className="mt-1 text-[11px] text-muted-foreground">Unlimited deep searches & agents</p>
          <button className="mt-3 w-full rounded-lg bg-gradient-brand py-1.5 text-xs font-semibold text-white shadow-glow">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <Link to="/app" className="flex items-center gap-2 lg:hidden">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">Copilot</span>
            </Link>
            <div className="relative ml-auto w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects, research, resources..."
                className="w-full rounded-xl border border-border/70 bg-white/80 py-2 pl-9 pr-16 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              />
              <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] text-muted-foreground">
                <kbd className="rounded border bg-muted px-1.5 py-0.5"><Command className="inline h-2.5 w-2.5" /> K</kbd>
              </div>
            </div>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              <Sun className="h-4 w-4" />
            </button>
            <button className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gradient-brand" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-white/80 py-1 pl-1 pr-3">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-brand text-xs font-bold text-white">HM</div>
              <div className="hidden text-xs md:block">
                <div className="font-semibold leading-tight">Harshal M.</div>
                <div className="text-muted-foreground leading-tight">Lead</div>
              </div>
            </div>
            <Link to="/" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2 lg:hidden">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                  {n.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      <AIAssistantFab />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/app" className="hover:text-foreground">Copilot</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{title}</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
