export type AgentCategory = "research_discovery" | "innovation_strategy" | "architecture_development" | "documentation_presentation" | "copilot";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ProjectMemory = {
  projectId: string;
  history: Message[];
  agentOutputs: Record<AgentCategory, string[]>;
};

const store = new Map<string, ProjectMemory>();

export const getProjectMemory = (projectId: string): ProjectMemory => {
  if (!store.has(projectId)) {
    store.set(projectId, {
      projectId,
      history: [],
      agentOutputs: {
        research_discovery: [],
        innovation_strategy: [],
        architecture_development: [],
        documentation_presentation: [],
        copilot: []
      }
    });
  }
  return store.get(projectId)!;
};

export const saveAgentOutput = (projectId: string, category: AgentCategory, output: string) => {
  const mem = getProjectMemory(projectId);
  if (mem.agentOutputs[category]) {
    mem.agentOutputs[category].push(output);
  } else {
    mem.agentOutputs[category] = [output];
  }
};

export const saveHistory = (projectId: string, message: Message) => {
  const mem = getProjectMemory(projectId);
  mem.history.push(message);
};
