import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — AI Research & Innovation Copilot" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      toast.success("Password reset link sent to your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
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

          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a link to reset your password.</p>

          {!isSent ? (
            <form onSubmit={submit} className="space-y-4 mt-6">
              <label className="block">
                <span className="text-xs font-medium">Email</span>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-border/70 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
                </div>
              </label>
              
              <button disabled={isSubmitting} type="submit" className="flex w-full mt-4 items-center justify-center rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50">
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
              Check your email for the reset link! You can close this window now.
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Remember your password? <Link to="/" className="font-semibold text-primary hover:underline">Back to sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
