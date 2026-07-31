import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify Email — AI Research & Innovation Copilot" },
    ],
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const [isSending, setIsSending] = useState(false);
  const { user, resendVerification, logout } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    setIsSending(true);
    try {
      await resendVerification();
      toast.success("Verification email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend email");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-2xl text-center"
        >
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 mb-6">
            <Mail className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a verification link to <span className="font-semibold text-foreground">{user?.email}</span>. 
            Please verify your email address to access the dashboard.
          </p>

          <button 
            disabled={isSending}
            onClick={handleResend}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50"
          >
            {isSending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isSending ? "Sending..." : "Resend Verification Email"}
          </button>

          <button 
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-white py-2.5 text-sm font-medium transition hover:bg-accent"
          >
            Sign in with a different account
          </button>
        </motion.div>
      </div>
    </div>
  );
}
