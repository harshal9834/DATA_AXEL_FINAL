import React, { useState } from "react";
import { Search, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar({ onSearch, loading }: { onSearch: (q: string) => Promise<string>, loading: boolean }) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    
    setIsSearching(true);
    try {
      const result = await onSearch(query);
      setAnswer(result);
    } catch (e) {
      setAnswer("Sorry, I couldn't process that query.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto mb-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl transition-all group-hover:opacity-100 opacity-50" />
        <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl p-1 shadow-2xl">
          <div className="pl-4 pr-2 text-muted-foreground">
            {isSearching ? <Sparkles className="h-5 w-5 animate-pulse text-blue-500" /> : <Search className="h-5 w-5" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about the project (e.g. 'Why use LangGraph?')"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 text-foreground placeholder:text-muted-foreground/70"
          />
          <button 
            type="submit" 
            disabled={!query.trim() || isSearching}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {answer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 card-premium backdrop-blur-xl z-20 text-sm leading-relaxed"
          >
            <button onClick={() => setAnswer("")} className="absolute top-2 right-2 text-muted-foreground hover:text-white">
              <span className="sr-only">Close</span>
              &times;
            </button>
            <div className="flex gap-2">
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-foreground/90 whitespace-pre-wrap">{answer}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
