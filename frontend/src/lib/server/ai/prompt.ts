import { getProjectMemory } from "./memory";
import { AgentConfig } from "./router";

export const buildPrompt = (config: AgentConfig, projectId: string, userPrompt: string, history: any[] = []) => {
  const memory = getProjectMemory(projectId);
  
  // Format previous agent outputs context
  let contextStr = "--- PREVIOUS PROJECT KNOWLEDGE ---\n";
  let hasContext = false;
  
  for (const [category, outputs] of Object.entries(memory.agentOutputs)) {
    if (outputs.length > 0) {
      hasContext = true;
      contextStr += `\n[${category.toUpperCase()} OUPUTS]\n`;
      outputs.forEach((out: string, i: number) => {
        contextStr += `Output ${i + 1}:\n${out}\n`;
      });
    }
  }
  
  if (!hasContext) {
    contextStr += "No previous context yet.\n";
  }
  contextStr += "----------------------------------\n";

  const fullSystemPrompt = `${config.systemPrompt}\n\nProject Context:\nYou are working within the DATA_AXEL platform. Please consider the following previous knowledge when answering the user:\n\n${contextStr}`;

  const messages = [
    { role: "system", content: fullSystemPrompt },
    ...history,
    { role: "user", content: userPrompt }
  ];

  return messages;
};
