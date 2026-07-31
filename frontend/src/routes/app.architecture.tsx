import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { AgentWorkspace } from "../components/AgentWorkspace";

export const Route = createFileRoute("/app/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture & Development Agent — DATA_AXEL" },
      { name: "description", content: "AI Architecture Workspace" }
    ]
  }),
  component: () => (
    <AgentWorkspace
      agentId="architect"
      title="Architecture & Development Agent"
      subtitle="Generates system, folder, database, and API architectures instantly."
      placeholder="Press Run to generate a production-ready architecture from memory."
      loadingText="The Architecture Agent is designing systems..."
      Icon={Boxes}
    />
  ),
});
