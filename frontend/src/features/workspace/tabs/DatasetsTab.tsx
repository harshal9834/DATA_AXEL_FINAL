// ─── Datasets Tab ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { Database, Bookmark, Download, Rows3, Columns3, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceEmpty } from '../components/WorkspaceStates';
import { useBookmarkWorkspaceItem } from '../hooks/useWorkspace';
import type { ResearchWorkspace, WorkspaceItem } from '../types/workspace.types';

interface DatasetsTabProps {
  workspace: ResearchWorkspace;
}

function DatasetCard({ dataset, index }: { dataset: WorkspaceItem; index: number }) {
  const bookmarkMutation = useBookmarkWorkspaceItem();

  const handleBookmark = () => {
    bookmarkMutation.mutate(dataset.id, {
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
            <Database className="h-4 w-4 text-foreground" />
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
              {dataset.datasource ?? 'Dataset'}
            </span>
          </div>
          <h4 className="font-bold text-sm mb-1">{dataset.title}</h4>
          {dataset.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{dataset.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {dataset.rows != null && (
              <span className="flex items-center gap-1">
                <Rows3 className="h-3 w-3" />
                {dataset.rows.toLocaleString()} rows
              </span>
            )}
            {dataset.columns != null && (
              <span className="flex items-center gap-1">
                <Columns3 className="h-3 w-3" />
                {dataset.columns} columns
              </span>
            )}
            {dataset.license && (
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                {dataset.license}
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
          {dataset.url && (
            <a
              href={dataset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border/70 hover:bg-accent transition-colors"
              title="Download / View Dataset"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function DatasetsTab({ workspace }: DatasetsTabProps) {
  const datasets = workspace.items.filter((item) => item.type === 'DATASET');

  if (datasets.length === 0) {
    return (
      <WorkspaceEmpty
        Icon={Database}
        title="No datasets found yet"
        description="Relevant datasets from Kaggle, UCI, and HuggingFace will appear here once generated."
      />
    );
  }

  return (
    <div className="space-y-3">
      {datasets.map((dataset, i) => (
        <DatasetCard key={dataset.id} dataset={dataset} index={i} />
      ))}
    </div>
  );
}
