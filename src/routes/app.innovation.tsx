import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { AgentWorkspace } from "../components/AgentWorkspace";

export const Route = createFileRoute("/app/innovation")({
  head: () => ({
    meta: [
      { title: "Innovation & Strategy Agent — DATA_AXEL" },
      { name: "description", content: "AI Innovation Strategist Workspace" }
    ]
  }),
  component: () => (
    <AgentWorkspace
      agentId="innovator"
      title="Innovation & Strategy Agent"
      subtitle="Find gaps, evaluate uniqueness, and score your impact based on research."
      placeholder="Press Run to let the Innovation Agent evaluate the project memory."
      loadingText="The Innovation & Strategy Agent is analyzing the market..."
      Icon={Lightbulb}
    />
  ),
});
