export declare class ConversationManager {
    private conversationHistories;
    private workflowState;
    private memoryAgent;
    constructor();
    private getSystemPrompt;
    handleMessage(socketId: string, text: string): Promise<{
        reply: string;
        confirmResearch: boolean;
        workflowId?: string;
    }>;
    private triggerWorkflowSilently;
    clearSession(socketId: string): void;
}
export declare const conversationManager: ConversationManager;
//# sourceMappingURL=conversationManager.d.ts.map