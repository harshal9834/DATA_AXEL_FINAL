export interface AgentState {
    status: 'idle' | 'running' | 'completed' | 'failed' | 'waiting_approval';
    progress: number;
    message: string;
}
export declare abstract class BaseAgent {
    protected state: AgentState;
    protected resultData: any;
    abstract execute(input: any): Promise<any>;
    abstract validate(input: any): boolean;
    status(): string;
    progress(): AgentState;
    result(): any;
    protected updateState(status: AgentState['status'], progress: number, message: string): void;
}
//# sourceMappingURL=baseAgent.d.ts.map