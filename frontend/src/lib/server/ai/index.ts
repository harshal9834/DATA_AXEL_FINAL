import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAgentConfig } from "./router";
import { buildPrompt } from "./prompt";
import { callGroqApi } from "./service";
import { getProjectMemory, saveAgentOutput, saveHistory } from "./memory";

export const executeAgent = createServerFn({ method: "POST" })
  .validator(z.object({
    projectId: z.string().default("default-project"),
    agent: z.string().default("copilot"),
    prompt: z.string(),
    messages: z.array(z.object({
      role: z.enum(["user", "ai"]),
      text: z.string()
    })).optional()
  }))
  .handler(async ({ data }) => {
    // 1. Hydrate memory if provided (fallback for seamless UI transition)
    const memory = getProjectMemory(data.projectId);
    if (memory.history.length === 0 && data.messages) {
      data.messages
        .filter(m => m.text !== data.prompt)
        .forEach(m => saveHistory(data.projectId, {
          role: m.role === "ai" ? "assistant" : m.role,
          content: m.text
        }));
    }

    // 2. Get Agent Config
    const config = getAgentConfig(data.agent);

    // 3. Build Final Prompt Payload
    const messagesPayload = buildPrompt(config, data.projectId, data.prompt, memory.history);

    // 4. Save User Prompt to History
    saveHistory(data.projectId, { role: "user", content: data.prompt });

    // 5. Call Centralized AI Service
    const aiResponseText = await callGroqApi(messagesPayload);

    // 6. Save AI Response to History and Specific Agent Bucket
    saveHistory(data.projectId, { role: "assistant", content: aiResponseText });
    saveAgentOutput(data.projectId, config.category, aiResponseText);

    return aiResponseText;
  });
