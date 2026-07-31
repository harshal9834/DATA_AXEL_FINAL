import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AgentWorkspace } from "../components/AgentWorkspace";

export const Route = createFileRoute("/app/research")({
  head: () => ({
    meta: [
      { title: "Research & Discovery Agent — DATA_AXEL" },
      { name: "description", content: "AI Research Scientist Workspace" }
    ]
  }),
  component: () => (
    <AgentWorkspace
      agentId="researcher"
      title="Research & Discovery Agent"
      subtitle="Transform an idea into a comprehensive research document."
      placeholder="Enter a project idea or research topic (e.g. 'AI-driven energy management for data centers')"
      loadingText="The Research & Discovery Agent is gathering intel..."
      Icon={Search}
    />
  ),
});
