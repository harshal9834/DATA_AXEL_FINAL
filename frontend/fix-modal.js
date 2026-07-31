const fs = require('fs');

let content = fs.readFileSync('frontend/src/routes/app.agents.tsx', 'utf8');

const modalCode = `function WorkflowModal({ onClose }: { onClose: () => void }) {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast.error("Please enter a project idea.");
      return;
    }
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("http://localhost:3001/api/workflows", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${token}\`
        },
        body: JSON.stringify({ idea })
      });
      const data = await res.json();
      if (res.ok && data.workflowId) {
        toast.success("Workflow started!");
        onClose();
        navigate({ to: "/app/workflow/" + data.workflowId });
      } else {
        toast.error("Failed to start workflow.");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ type: "spring", damping: 26, stiffness: 300 }} className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(600px,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-glow backdrop-blur-2xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <div className="bg-gradient-brand p-6 text-white">
            <h3 className="text-xl font-bold">Initialize AI Workflow</h3>
            <p className="text-xs opacity-80">Define your project idea and let the agents build it.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 grid gap-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
            <div>
              <label className="text-sm font-bold text-foreground">Project Idea *</label>
              <p className="mb-3 text-xs text-muted-foreground">What do you want to build? Be as brief or as detailed as you like.</p>
              <textarea required rows={6} placeholder="Build an AI-powered research assistant..." value={idea} onChange={e => setIdea(e.target.value)} className="mt-1 w-full rounded-xl border border-border/60 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-soft" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border/60 bg-white/60 px-6 py-4 backdrop-blur-md">
            <button type="button" onClick={onClose} className="rounded-xl border border-border/70 bg-white px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Start AI Workflow
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}`;

content = content.replace(/function WorkflowModal.*$/s, modalCode);
fs.writeFileSync('frontend/src/routes/app.agents.tsx', content);
