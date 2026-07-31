// ─── GitHub Tab ───────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { Github, Bookmark, ExternalLink, Star, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceEmpty } from '../components/WorkspaceStates';
import { useBookmarkWorkspaceItem } from '../hooks/useWorkspace';
import type { ResearchWorkspace, WorkspaceItem } from '../types/workspace.types';

interface GitHubTabProps {
  workspace: ResearchWorkspace;
}

function RepoCard({ repo, index }: { repo: WorkspaceItem; index: number }) {
  const bookmarkMutation = useBookmarkWorkspaceItem();

  const handleBookmark = () => {
    bookmarkMutation.mutate(repo.id, {
      onSuccess: () => toast.success('Saved to bookmarks'),
      onError: () => toast.error('Failed to bookmark'),
    });
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
            <Github className="h-4 w-4 text-foreground" />
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 font-medium">
              {repo.language ?? 'Repository'}
            </span>
          </div>
          <h4 className="font-bold text-sm mb-1">{repo.repoName ?? repo.title}</h4>
          {repo.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{repo.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {repo.stars != null && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {repo.stars.toLocaleString()}
              </span>
            )}
            {repo.owner && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {repo.owner}
              </span>
            )}
            {repo.updatedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(repo.updatedDate).toLocaleDateString()}
              </span>
            )}
          </div>
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
          {repo.url && (
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors"
              title="Open on GitHub"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function GitHubTab({ workspace }: GitHubTabProps) {
  const repos = workspace.items.filter((item) => item.type === 'GITHUB');

  if (repos.length === 0) {
    return (
      <WorkspaceEmpty
        Icon={Github}
        title="No repositories found yet"
        description="Relevant GitHub repositories will appear here once the AI pipeline discovers them."
      />
    );
  }

  return (
    <div className="space-y-3">
      {repos.map((repo, i) => (
        <RepoCard key={repo.id} repo={repo} index={i} />
      ))}
    </div>
  );
}
