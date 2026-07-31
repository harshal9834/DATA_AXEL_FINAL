"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env'), override: true });
// Ensure we have default user logic handled if Prisma complains
const workflowEngine_1 = require("./src/services/workflowEngine");
const server_1 = require("./src/server");
async function testWorkflow() {
    await server_1.prisma.user.upsert({
        where: { id: 'default_user' },
        update: {},
        create: {
            id: 'default_user',
            email: 'default@example.com',
            name: 'Default User',
            firebase_uid: 'default_user'
        }
    });
    const workflow = await server_1.prisma.workflow.create({
        data: {
            id: `wf_test_${Date.now()}`,
            userId: 'default_user',
            title: 'Test Workflow',
            idea: 'A test project for workflow verification',
            status: 'DRAFT',
            agents: {
                create: [
                    { name: 'Research & Discovery', status: 'PENDING' },
                    { name: 'Innovation & Strategy', status: 'PENDING' },
                    { name: 'Architecture & Development', status: 'PENDING' },
                    { name: 'Backend Generation', status: 'PENDING' },
                    { name: 'Frontend Generation', status: 'PENDING' },
                    { name: 'Documentation & Presentation', status: 'PENDING' },
                    { name: 'Project Analysis', status: 'PENDING' },
                ],
            },
        },
        include: { agents: true },
    });
    console.log('Starting workflow ID:', workflow.id);
    await (0, workflowEngine_1.startWorkflow)(workflow.id);
    console.log('Workflow execution completed.');
    process.exit(0);
}
testWorkflow().catch(console.error);
//# sourceMappingURL=testWorkflow.js.map