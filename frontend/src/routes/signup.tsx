import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — AI Research & Innovation Copilot" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, googleLogin } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! Please check your email to verify.");
      navigate({ to: "/app" });
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await googleLogin();
      toast.success("Signed in with Google");
      navigate({ to: "/app" });
    } catch (error: any) {
      toast.error(error.message || "Failed to log in with Google");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold">Copilot</div>
              <div className="text-[11px] text-muted-foreground">Research & Innovation</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold">Create an account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Join the AI Research platform.</p>

          <button 
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-white py-2.5 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
            onClick={handleGoogleLogin}
          >
            <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.5-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35 26.8 36 24 36c-5.3 0-9.7-3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.2C41.2 35.1 45 30 45 24c0-1.3-.1-2.5-.4-3.5z"/></svg>
            Sign up with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium">Full Name</span>
              <div className="relative mt-1.5">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="w-full rounded-xl border border-border/70 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium">Email</span>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-border/70 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium">Password</span>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-border/70 bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent">
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium">Confirm Password</span>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input required type={showPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full rounded-xl border border-border/70 bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
              </div>
            </label>
            
            <button disabled={isSubmitting} type="submit" className="flex w-full mt-2 items-center justify-center rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50">
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
