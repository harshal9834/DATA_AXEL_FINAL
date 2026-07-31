// ─── Research Papers Tab ──────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { BookOpen, Bookmark, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceEmpty } from '../components/WorkspaceStates';
import { useBookmarkWorkspaceItem } from '../hooks/useWorkspace';
import type { ResearchWorkspace, WorkspaceItem } from '../types/workspace.types';

interface PapersTabProps {
  workspace: ResearchWorkspace;
}

function PaperCard({ paper, index }: { paper: WorkspaceItem; index: number }) {
  const bookmarkMutation = useBookmarkWorkspaceItem();

  const handleBookmark = () => {
    bookmarkMutation.mutate(paper.id, {
      onSuccess: () => toast.success('Saved to bookmarks'),
      onError: () => toast.error('Failed to bookmark'),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paper.url ?? paper.title);
    toast.success('Copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-premium hover-lift p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium">
              Research Paper
            </span>
            {paper.publishedYear && (
              <span className="text-xs text-muted-foreground">{paper.publishedYear}</span>
            )}
          </div>
          <h4 className="font-bold text-sm mb-1">{paper.title}</h4>
          {paper.authors && (
            <p className="text-xs text-muted-foreground mb-2">{paper.authors}</p>
          )}
          {paper.summary && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{paper.summary}</p>
          )}
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Open Paper <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
            className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors disabled:opacity-50"
            title="Save to bookmarks"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors"
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function PapersTab({ workspace }: PapersTabProps) {
  const papers = workspace.items.filter((item) => item.type === 'PAPER');

  if (papers.length === 0) {
    return (
      <WorkspaceEmpty
        Icon={BookOpen}
        title="No research papers found yet"
        description="Research papers will appear here once the AI pipeline generates them."
      />
    );
  }

  return (
    <div className="space-y-3">
      {papers.map((paper, i) => (
        <PaperCard key={paper.id} paper={paper} index={i} />
      ))}
    </div>
  );
}
