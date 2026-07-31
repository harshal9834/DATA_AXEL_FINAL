"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVoiceSocket = registerVoiceSocket;
const logger_1 = require("../../utils/logger");
const conversationManager_1 = require("./conversationManager");
function registerVoiceSocket(io) {
    const voiceNamespace = io.of('/voice-assistant');
    voiceNamespace.on('connection', (socket) => {
        logger_1.mcpLogger.info('VoiceSocket', `Client connected: ${socket.id}`);
        socket.on('voice_message', async (data) => {
            if (!data || !data.text || data.text.trim().length === 0)
                return;
            logger_1.mcpLogger.info('VoiceSocket', `Received message: ${data.text}`);
            try {
                socket.emit('ai_status', { status: 'Thinking...' });
                const response = await conversationManager_1.conversationManager.handleMessage(socket.id, data.text);
                socket.emit('voice_reply', response);
                socket.emit('ai_status', { status: 'Listening...' });
            }
            catch (err) {
                logger_1.mcpLogger.error('VoiceSocket', 'ConversationManager Error:\n' + (err.stack || err));
                socket.emit('voice_reply', {
                    reply: "I'm having a little trouble connecting to my brain right now, but I'm still listening.",
                    confirmResearch: false
                });
                socket.emit('ai_status', { status: 'Listening...' });
            }
        });
        socket.on('voice_interrupt', () => {
            logger_1.mcpLogger.info('VoiceSocket', `Client interrupted AI: ${socket.id}`);
            // In a real streaming architecture, we would abort the LLM stream here.
            // For now, we acknowledge the interrupt.
        });
        socket.on('disconnect', () => {
            logger_1.mcpLogger.info('VoiceSocket', `Client disconnected: ${socket.id}`);
            conversationManager_1.conversationManager.clearSession(socket.id);
        });
    });
}
//# sourceMappingURL=voiceSocket.js.map