"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const workflowEngine_1 = require("../services/workflowEngine");
const verifyFirebaseToken_1 = require("../middleware/verifyFirebaseToken");
const router = (0, express_1.Router)();
// Apply middleware to all routes
router.use(verifyFirebaseToken_1.verifyFirebaseToken);
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user.id;
        console.log(`[Controller] POST /api/workflows - User: ${userId}`);
        const workflow = await server_1.prisma.workflow.create({
            data: {
                title: "Generating Title...", // Will be updated by Research Agent
                idea: data.idea,
                status: 'CREATED',
                userId: userId
            }
        });
        const agents = [
            'Research & Discovery',
            'Innovation & Strategy',
            'Architecture & Development',
            'Backend Generation',
            'Frontend Generation',
            'Documentation & Presentation',
            'Testing & Validation',
            'Project Export'
        ];
        for (const name of agents) {
            await server_1.prisma.workflowAgent.create({
                data: {
                    workflowId: workflow.id,
                    name: name,
                    status: 'WAITING'
                }
            });
        }
        console.log("Workflow Created");
        // Start engine in background
        (0, workflowEngine_1.startWorkflow)(workflow.id);
        console.log("Return Response");
        res.status(201).json({ success: true, workflowId: workflow.id });
    }
    catch (err) {
        console.error("Error in POST /api/workflows:", err);
        return res.status(500).json({
            success: false,
            message: err.message,
            stack: err.stack
        });
    }
});
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch running/waiting tasks for this user's workflows
        const activeAgents = await server_1.prisma.workflowAgent.findMany({
            where: {
                status: { in: ['WAITING', 'RUNNING'] },
                workflow: { userId: userId }
            },
            include: { workflow: true }
        });
        // Map to frontend task format
        const activeTasks = activeAgents.map(a => ({
            id: a.id,
            agent: a.name,
            title: a.workflow.title + ' - ' + a.name,
            progress: a.status === 'RUNNING' ? 50 : 0,
            eta: a.status === 'RUNNING' ? '~10s' : 'queued',
            status: a.status,
            color: a.name.includes('Research') ? 'from-blue-500 to-indigo-500' : 'from-slate-500 to-slate-700'
        }));
        const logs = await server_1.prisma.workflowLog.findMany({
            where: { workflow: { userId: userId } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        const analytics = await server_1.prisma.analytics.findMany({
            where: { userId: userId }
        });
        res.json({
            activeTasks,
            liveActivity: logs,
            analytics
        });
    }
    catch (err) {
        console.error("Error in GET /api/workflows/dashboard:", err);
        return res.status(500).json({
            success: false,
            message: err.message,
            stack: err.stack
        });
    }
});
router.post('/:id/retry', async (req, res) => {
    try {
        const { id } = req.params;
        const { agentName } = req.body;
        const workflow = await server_1.prisma.workflow.findUnique({ where: { id: String(id) } });
        if (!workflow || workflow.userId !== req.user.id) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        const workflowId = String(id);
        (0, workflowEngine_1.retryWorkflowAgent)(workflowId, agentName);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/:id/download/:type', async (req, res) => {
    // Mock endpoint that would normally build a zip and stream it
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.type}.zip"`);
    res.send('mock-zip-content');
});
router.get('/:id/blueprint', async (req, res) => {
    try {
        const { id } = req.params;
        const blueprint = await server_1.prisma.projectBlueprint.findUnique({
            where: { workflowId: String(id) }
        });
        if (!blueprint) {
            return res.status(404).json({ error: 'Blueprint not found' });
        }
        res.json(blueprint);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/:id/approve-blueprint', async (req, res) => {
    try {
        const { id } = req.params;
        const workflow = await server_1.prisma.workflow.findUnique({ where: { id: String(id) } });
        if (!workflow || workflow.userId !== req.user.id) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        await server_1.prisma.projectBlueprint.update({
            where: { workflowId: String(id) },
            data: {
                approvedAt: new Date(),
                approvedBy: req.user.id
            }
        });
        await server_1.prisma.workflow.update({
            where: { id: String(id) },
            data: { status: 'COMPLETED' }
        });
        // Do NOT generate code yet. That belongs to the next phase.
        // import('../services/workflowEngine').then(m => m.startWorkflow(id, 'Backend Generation'));
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/:id/modify-blueprint', async (req, res) => {
    try {
        const { id } = req.params;
        const { instructions } = req.body;
        const workflow = await server_1.prisma.workflow.findUnique({ where: { id: String(id) } });
        if (!workflow || workflow.userId !== req.user.id) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        // Reset Architecture Agent to WAITING so it can run again
        await server_1.prisma.workflowAgent.updateMany({
            where: { workflowId: String(id), name: 'Architecture & Development' },
            data: { status: 'WAITING', progress: 0 }
        });
        await server_1.prisma.workflow.update({
            where: { id: String(id) },
            data: { status: 'RUNNING', idea: workflow.idea + `\n\nArchitecture Modifications requested: ${instructions}` }
        });
        // Run only the Architecture Agent
        (0, workflowEngine_1.startWorkflow)(String(id), 'Architecture & Development');
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=workflowRoutes.js.map