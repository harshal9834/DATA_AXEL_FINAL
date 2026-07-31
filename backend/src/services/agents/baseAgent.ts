export interface AgentState {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  progress: number;
  message: string;
}

export abstract class BaseAgent {
  protected state: AgentState = { status: 'idle', progress: 0, message: 'Initialized' };
  protected resultData: any = null;

  abstract execute(input: any): Promise<any>;
  abstract validate(input: any): boolean;

  public status(): string {
    return this.state.status;
  }

  public progress(): AgentState {
    return this.state;
  }

  public result(): any {
    return this.resultData;
  }

  protected updateState(status: AgentState['status'], progress: number, message: string) {
    this.state = { status, progress, message };
  }
}
