"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    state = { status: 'idle', progress: 0, message: 'Initialized' };
    resultData = null;
    status() {
        return this.state.status;
    }
    progress() {
        return this.state;
    }
    result() {
        return this.resultData;
    }
    updateState(status, progress, message) {
        this.state = { status, progress, message };
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=baseAgent.js.map