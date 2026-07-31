import { createFileRoute } from "@tanstack/react-router";
import { Presentation } from "lucide-react";
import { AgentWorkspace } from "../components/AgentWorkspace";

export const Route = createFileRoute("/app/docs")({
  head: () => ({
    meta: [
      { title: "Documentation & Presentation Agent — DATA_AXEL" },
      { name: "description", content: "AI Documentation Workspace" }
    ]
  }),
  component: () => (
    <AgentWorkspace
      agentId="documenter"
      title="Documentation & Presentation Agent"
      subtitle="Writes README, SRS, pitch decks and demo scripts."
      placeholder="Press Run to generate documentation from the project context."
      loadingText="The Documentation Agent is synthesizing the pitch..."
      Icon={Presentation}
    />
  ),
});
