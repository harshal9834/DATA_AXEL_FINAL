import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X, Lightbulb, Boxes, Calendar, Code, FileText, BookOpen } from "lucide-react";
import { useState } from "react";
import { executeAgent } from "../lib/server/ai";

const prompts = [
  { icon: Lightbulb, label: "Improve my idea", agent: "researcher" },
  { icon: Boxes, label: "Generate Architecture", agent: "architect" },
  { icon: Calendar, label: "Generate Timeline", agent: "copilot" },
  { icon: Code, label: "Generate APIs", agent: "developer" },
  { icon: FileText, label: "Generate Documentation", agent: "documenter" },
  { icon: BookOpen, label: "Explain Research", agent: "researcher" },
];

type Msg = { role: "user" | "ai"; text: string };

export default function AIAssistantFab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hey! I'm your Research Copilot. Ask me anything about your project — I can research, architect, and write docs for you." },
  ]);
  const [streaming, setStreaming] = useState(false);

  const send = async (text: string, agent: string = "copilot") => {
    if (!text.trim()) return;
    
    // 1. Add user message
    const updatedMsgs = [...msgs, { role: "user" as const, text }];
    setMsgs(updatedMsgs);
    setInput("");
    setStreaming(true);

    try {
      // 2. Call server function
      const reply = await executeAgent({ 
        data: { 
          prompt: text,
          agent: agent,
          projectId: "default-project",
          messages: msgs 
        } 
      });
      setMsgs([...updatedMsgs, { role: "ai", text: reply }]);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "Unknown error occurred";
      setMsgs([
        ...updatedMsgs,
        { role: "ai", text: `Oops, I encountered an error: ${errMsg}` }
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white shadow-glow transition-transform hover:scale-105"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-50 flex h-[min(640px,85vh)] w-[min(420px,95vw)] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-glow backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">AI Assistant</div>
                    <div className="text-[11px] text-muted-foreground">Research • Architect • Document</div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-brand text-white"
                        : "border border-border/60 bg-white text-foreground"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {streaming && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-500 [animation-delay:.15s]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500 [animation-delay:.3s]" />
                    Thinking...
                  </div>
                )}
              </div>

              <div className="border-t border-border/50 px-4 pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {prompts.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.label, p.agent)}
                      className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                    >
                      <p.icon className="h-3 w-3" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-border/50 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 rounded-xl border border-border/60 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
                <button type="submit" className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
