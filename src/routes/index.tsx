import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Search, Network, Boxes, LayoutDashboard, BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — AI Research & Innovation Copilot" },
      { name: "description", content: "Sign in to your Research Copilot. Search less, solve more." },
      { property: "og:title", content: "Sign in — AI Research Copilot" },
      { property: "og:description", content: "Search less. Solve more." },
    ],
  }),
  component: Login,
});

const features = [
  { icon: Search, label: "DeepSearch" },
  { icon: LayoutDashboard, label: "Project HUB" },
  { icon: Sparkles, label: "AI Agents" },
  { icon: Network, label: "Knowledge Clustering" },
  { icon: Boxes, label: "Research Workspace" },
  { icon: BookOpen, label: "Personalized Dashboard" },
];

function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Welcome back!");
    setTimeout(() => navigate({ to: "/app" }), 300);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-2 lg:gap-16 lg:px-10">
        {/* Left */}
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold">Copilot</div>
              <div className="text-[11px] text-muted-foreground">Research & Innovation</div>
            </div>
          </div>

          <div className="my-10 max-w-lg">
            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl"
            >
              Search Less. <br />
              <span className="text-gradient-brand">Solve More.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground"
            >
              Transform ideas into implementation-ready projects using AI-powered research, deep search, and auto-generated architectures.
            </motion.p>

            {/* Illustration card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-6 shadow-soft backdrop-blur-xl"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live research pipeline</span>
                <span>4 agents active</span>
              </div>
              <div className="mt-4 grid grid-cols-4 items-center gap-2">
                {["Idea", "Research", "Cluster", "Ship"].map((s, i) => (
                  <div key={s} className="text-center">
                    <div className={`mx-auto grid h-10 w-10 place-items-center rounded-xl text-xs font-bold text-white ${
                      i === 0 ? "bg-primary" : i === 1 ? "bg-fuchsia-500" : i === 2 ? "bg-cyan-500" : "bg-emerald-500"
                    }`}>{i + 1}</div>
                    <div className="mt-1.5 text-[11px] font-medium">{s}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {[
                  { t: "Scanning 12,438 papers…", p: 100 },
                  { t: "Clustering 42 knowledge nodes…", p: 82 },
                  { t: "Drafting architecture v2…", p: 46 },
                ].map((r) => (
                  <div key={r.t}>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{r.t}</span><span>{r.p}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${r.p}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-2 rounded-xl border border-border/60 bg-white/70 px-3 py-2.5 text-xs font-medium backdrop-blur">
                <f.icon className="h-3.5 w-3.5 text-primary" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login card */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-2xl"
          >
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your research.</p>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-white py-2.5 text-sm font-medium transition hover:bg-accent"
              onClick={() => { toast.success("Signed in with Google"); setTimeout(() => navigate({ to: "/app" }), 300); }}>
              <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.5-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35 26.8 36 24 36c-5.3 0-9.7-3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.2C41.2 35.1 45 30 45 24c0-1.3-.1-2.5-.4-3.5z"/></svg>
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium">Email</span>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input required type="email" defaultValue="team@indiapreneur.com" className="w-full rounded-xl border border-border/70 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-medium">Password</span>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input required type={showPw ? "text" : "password"} defaultValue="research123" className="w-full rounded-xl border border-border/70 bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent">
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </label>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2"><input type="checkbox" className="h-3.5 w-3.5 rounded border-border accent-[--brand]" defaultChecked /> Remember me</label>
                <a className="font-medium text-primary hover:underline" href="#">Forgot password?</a>
              </div>
              <button type="submit" className="w-full rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95">
                Sign in
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              New here? <Link to="/app" className="font-semibold text-primary hover:underline">Create an account</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
