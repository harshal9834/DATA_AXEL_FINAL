export interface MemoryAgentInput {
    workflowId: string;
    role: 'user' | 'ai';
    content: string;
}
export interface SearchMemoryInput {
    workflowId: string;
    query: string;
}
export declare class MemoryAgent {
    constructor();
    /**
     * Save a conversational interaction to long-term memory.
     * This also updates the ProjectMemoryState and adds nodes to the Knowledge Graph asynchronously.
     */
    saveInteraction(input: MemoryAgentInput): Promise<void>;
    /**
     * Retrieve context for a given query to inject into the Gemini prompt.
     */
    retrieveContext(input: SearchMemoryInput): Promise<string>;
    /**
     * Uses Groq to extract entities and state updates from conversation text,
     * then updates the Knowledge Graph and ProjectMemoryState.
     */
    private extractEntities;
}
//# sourceMappingURL=memoryAgent.d.ts.map