// ─── API & Database Design Tab ───────────────────────────────────────────────

import { FileText } from 'lucide-react';
import { WorkspaceEmpty } from '../components/WorkspaceStates';
import type { ResearchWorkspace } from '../types/workspace.types';

// ─── API & Database Design Card ────────────────────────────────────────────────

interface DesignCardProps {
  content: string;
  title: string;
}

function DesignCard({ content, title }: DesignCardProps) {
  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
        {content}
      </div>
    </div>
  );
}

// ─── API & Database Design Tab ────────────────────────────────────────────────

export function APIDesignTab({ workspace }: { workspace: ResearchWorkspace }) {
  if (!workspace.apiDatabaseDesign) {
    return (
      <WorkspaceEmpty
        Icon={FileText}
        title="API & Database Design not generated yet"
        description="The API endpoints and database schema design will appear here once the AI pipeline completes."
      />
    );
  }

  return (
    <DesignCard
      content={workspace.apiDatabaseDesign}
      title="API & Database Design"
    />
  );
}
