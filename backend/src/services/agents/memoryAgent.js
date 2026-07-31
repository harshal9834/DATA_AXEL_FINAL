"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryAgent = void 0;
const AIProvider_1 = require("../../config/AIProvider");
const logger_1 = require("../../utils/logger");
const server_1 = require("../../server"); // Using the global prisma client
class MemoryAgent {
    constructor() {
    }
    /**
     * Save a conversational interaction to long-term memory.
     * This also updates the ProjectMemoryState and adds nodes to the Knowledge Graph asynchronously.
     */
    async saveInteraction(input) {
        try {
            // 1. Save chronological memory
            await server_1.prisma.conversationMemory.create({
                data: {
                    workflowId: input.workflowId,
                    role: input.role,
                    content: input.content,
                }
            });
            // 2. We could fire-and-forget the semantic extraction here to prevent blocking voice speed
            this.extractEntities(input.workflowId, input.content).catch(e => logger_1.mcpLogger.error('MemoryAgent', 'Failed to extract entities', e));
        }
        catch (error) {
            logger_1.mcpLogger.error('MemoryAgent', 'Failed to save interaction', error);
        }
    }
    /**
     * Retrieve context for a given query to inject into the Gemini prompt.
     */
    async retrieveContext(input) {
        try {
            // 1. Get recent chronological conversation (last 5 turns)
            const recentChats = await server_1.prisma.conversationMemory.findMany({
                where: { workflowId: input.workflowId },
                orderBy: { createdAt: 'desc' },
                take: 5
            });
            recentChats.reverse(); // chronological order
            // 2. Get the global project state summary
            const projectState = await server_1.prisma.projectMemoryState.findUnique({
                where: { workflowId: input.workflowId }
            });
            // 3. Format context string
            let contextStr = '--- RECENT CONVERSATION HISTORY ---\n';
            recentChats.forEach(chat => {
                contextStr += `${chat.role.toUpperCase()}: ${chat.content}\n`;
            });
            if (projectState) {
                contextStr += '\n--- PROJECT KNOWLEDGE BASE ---\n';
                if (projectState.projectName)
                    contextStr += `Project Name: ${projectState.projectName}\n`;
                if (projectState.goals)
                    contextStr += `Goals: ${projectState.goals}\n`;
                if (projectState.completedPhases)
                    contextStr += `Completed Phases: ${projectState.completedPhases}\n`;
                if (projectState.pendingPhases)
                    contextStr += `Pending Phases: ${projectState.pendingPhases}\n`;
                if (projectState.generatedAPIs)
                    contextStr += `Generated APIs: ${projectState.generatedAPIs}\n`;
            }
            return contextStr;
        }
        catch (error) {
            logger_1.mcpLogger.error('MemoryAgent', 'Failed to retrieve context', error);
            return '';
        }
    }
    /**
     * Uses Groq to extract entities and state updates from conversation text,
     * then updates the Knowledge Graph and ProjectMemoryState.
     */
    async extractEntities(workflowId, text) {
        // Only extract if the text is substantial enough to matter
        if (text.length < 50)
            return;
        const systemPrompt = `You are the AI Memory Manager.
Extract knowledge graph nodes (entities like technologies, features, APIs) and project state updates from the text.
Output MUST strictly match this JSON schema. Do NOT write markdown outside JSON.

{
  "nodes": [{ "entityName": "string", "entityType": "string", "attributes": "string" }],
  "stateUpdates": {
    "projectName": "string or null",
    "goals": "string or null",
    "completedPhases": ["string"],
    "pendingPhases": ["string"],
    "generatedAPIs": ["string"]
  }
}
`;
        const userPrompt = `Extract knowledge from:\n\n${text}`;
        try {
            const response = await (0, AIProvider_1.generateResponse)([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ], { temperature: 0.1, jsonMode: true });
            const content = response.text || '{}';
            const data = JSON.parse(content);
            // Save extracted nodes
            if (data.nodes && data.nodes.length > 0) {
                for (const node of data.nodes) {
                    // Simplistic upsert based on entityName
                    await server_1.prisma.memoryNode.create({
                        data: {
                            workflowId,
                            entityName: node.entityName,
                            entityType: node.entityType,
                            attributes: node.attributes
                        }
                    });
                }
            }
            // Upsert global state
            if (data.stateUpdates) {
                const existingState = await server_1.prisma.projectMemoryState.findUnique({ where: { workflowId } });
                const updates = {};
                if (data.stateUpdates.projectName)
                    updates.projectName = data.stateUpdates.projectName;
                if (data.stateUpdates.goals)
                    updates.goals = data.stateUpdates.goals;
                if (data.stateUpdates.completedPhases && data.stateUpdates.completedPhases.length > 0) {
                    updates.completedPhases = JSON.stringify(data.stateUpdates.completedPhases);
                }
                if (existingState) {
                    await server_1.prisma.projectMemoryState.update({
                        where: { workflowId },
                        data: updates
                    });
                }
                else {
                    await server_1.prisma.projectMemoryState.create({
                        data: {
                            workflowId,
                            ...updates
                        }
                    });
                }
            }
        }
        catch (error) {
            logger_1.mcpLogger.error('MemoryAgent', 'Failed JSON extraction', error);
        }
    }
}
exports.MemoryAgent = MemoryAgent;
//# sourceMappingURL=memoryAgent.js.map