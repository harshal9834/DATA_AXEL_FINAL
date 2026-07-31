import { Server, Socket } from 'socket.io';
import { mcpLogger } from '../../utils/logger';
import { conversationManager } from './conversationManager';

export function registerVoiceSocket(io: Server) {
  const voiceNamespace = io.of('/voice-assistant');

  voiceNamespace.on('connection', (socket: Socket) => {
    mcpLogger.info('VoiceSocket', `Client connected: ${socket.id}`);

    socket.on('voice_message', async (data: { text: string }) => {
      if (!data || !data.text || data.text.trim().length === 0) return;

      mcpLogger.info('VoiceSocket', `Received message: ${data.text}`);
      
      try {
        socket.emit('ai_status', { status: 'Thinking...' });
        
        const response = await conversationManager.handleMessage(socket.id, data.text);
        
        socket.emit('voice_reply', response);
        socket.emit('ai_status', { status: 'Listening...' });
        
      } catch (err: any) {
        mcpLogger.error('VoiceSocket', 'ConversationManager Error:\n' + (err.stack || err));
        socket.emit('voice_reply', { 
          reply: "I'm having a little trouble connecting to my brain right now, but I'm still listening.", 
          confirmResearch: false 
        });
        socket.emit('ai_status', { status: 'Listening...' });
      }
    });

    socket.on('voice_interrupt', () => {
      mcpLogger.info('VoiceSocket', `Client interrupted AI: ${socket.id}`);
      // In a real streaming architecture, we would abort the LLM stream here.
      // For now, we acknowledge the interrupt.
    });

    socket.on('disconnect', () => {
      mcpLogger.info('VoiceSocket', `Client disconnected: ${socket.id}`);
      conversationManager.clearSession(socket.id);
    });
  });
}
