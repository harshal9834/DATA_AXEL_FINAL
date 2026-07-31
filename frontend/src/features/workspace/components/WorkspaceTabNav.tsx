// ─── Workspace Tab Navigator ───────────────────────────────────────────────────

import { BookOpen, Github, Database, Network, GitBranch, Workflow, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { WORKSPACE_TABS } from '../constants/workspace.constants';
import type { WorkspaceTabId } from '../types/workspace.types';

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Github,
  Database,
  Network,
  GitBranch,
  Workflow,
  FileText,
};

interface WorkspaceTabNavProps {
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
}

export function WorkspaceTabNav({ activeTab, onTabChange }: WorkspaceTabNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/50">
      {WORKSPACE_TABS.map((tab) => {
        const Icon = ICON_MAP[tab.icon] ?? FileText;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
