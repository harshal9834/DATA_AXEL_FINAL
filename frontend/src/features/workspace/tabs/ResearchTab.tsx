// ─── Research Tab ─────────────────────────────────────────────────────────────

import { BookOpen } from 'lucide-react';
import { WorkspaceEmpty } from '../components/WorkspaceStates';
import type { ResearchWorkspace } from '../types/workspace.types';

interface ResearchTabProps {
  workspace: ResearchWorkspace;
}

export function ResearchTab({ workspace }: ResearchTabProps) {
  if (!workspace.research) {
    return (
      <WorkspaceEmpty
        Icon={BookOpen}
        title="No research generated yet"
        description="Start the research analysis to generate a comprehensive project overview."
      />
    );
  }

  return (
    <div className="card-premium p-6">
      <h3 className="text-lg font-bold mb-4">Research Summary</h3>
      <div className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap">
        {workspace.research}
      </div>
    </div>
  );
}
