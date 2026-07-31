"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.prisma = void 0;
console.log('[DEBUG] Server Started');
// ─── CRITICAL: Load .env FIRST — before ANY other import ──────────────────────
// This must be the very first executable statement so all modules that read
// process.env at import time (lazy singletons, etc.) see the correct values.
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
// Force-load .env relative to this file, overriding any stale process.env values
const envResult = dotenv_1.default.config({
    path: (0, path_1.resolve)(__dirname, '../.env'),
    override: true,
});
if (envResult.error) {
    console.error('[FATAL] Failed to load .env file:', envResult.error.message);
}
else {
    const loaded = Object.keys(envResult.parsed || {});
    console.log(`[ENV] Loaded ${loaded.length} variables from .env:`, loaded.join(', '));
}
// Verify critical keys immediately
const REQUIRED_ENV = ['OPENROUTER_API_KEY', 'FIREBASE_PROJECT_ID'];
for (const key of REQUIRED_ENV) {
    if (process.env[key]) {
        console.log(`[ENV] ✅ ${key} = ${process.env[key].slice(0, 12)}...`);
    }
    else {
        console.error(`[ENV] ❌ MISSING: ${key}`);
    }
}
// ─── Now import everything else ────────────────────────────────────────────────
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const languageMiddleware_1 = require("./middleware/languageMiddleware");
const errorTranslator_1 = require("./utils/errorTranslator");
process.on('uncaughtException', (err) => {
    console.error('\n[FATAL] uncaughtException:', err.stack || err);
});
process.on('unhandledRejection', (reason) => {
    console.error('\n[FATAL] unhandledRejection:', reason);
});
const _originalExit = process.exit;
process.exit = function (code) {
    console.error('\n[FATAL] process.exit() called with code:', code);
    return _originalExit(code);
};
console.log('[DEBUG] Firebase Ready');
exports.prisma = new client_1.PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
    ],
});
exports.prisma.$on('query', (e) => {
    console.log(`[Prisma Query] ${e.query}`);
});
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
console.log('[DEBUG] Socket Ready');
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(languageMiddleware_1.languageMiddleware);
// Detailed Request Logging Middleware
app.use((req, res, next) => {
    console.log(`\n[Incoming Request] ${req.method} ${req.url}`);
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (res.statusCode >= 400) {
            console.log(`[Failure] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        }
        else {
            console.log(`[Success] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});
exports.io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const voiceSocket_1 = require("./services/voice/voiceSocket");
console.log('[DEBUG] OpenRouter Ready');
console.log('[DEBUG] MCP Ready');
(0, voiceSocket_1.registerVoiceSocket)(exports.io);
console.log('[DEBUG] Voice Ready');
const workflowRoutes_1 = __importDefault(require("./routes/workflowRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Backend is running!',
        env: {
            openrouter: process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
            firebase: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
        }
    });
});
app.use('/api/workflows', workflowRoutes_1.default);
app.use('/api/workspace', workspaceRoutes_1.default);
// Global Error Handler
app.use(async (err, req, res, next) => {
    console.error('\n[Exception] Unhandled error caught in global handler:');
    console.error(err.stack || err);
    const rawMessage = err.message || 'Internal Server Error';
    const locale = req.locale || 'en';
    // Do not block the event loop for translation if possible, or await it
    const translatedMessage = await (0, errorTranslator_1.translateError)(rawMessage, locale);
    res.status(500).json({
        success: false,
        message: translatedMessage,
        originalMessage: rawMessage, // always good to have for dev debugging
        stack: err.stack
    });
});
httpServer.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map