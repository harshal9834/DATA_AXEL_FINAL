import { Router } from 'express';
import { streamDeepSearchCategory } from '../services/deepSearchService';

const router = Router();

router.post('/stream-category', async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Flush headers so client gets the connection immediately
  res.flushHeaders();

  const { topic, category } = req.body;

  if (!topic || !category) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Topic and category are required' })}\n\n`);
    res.end();
    return;
  }

  // Handle client disconnect
  req.on('close', () => {
    res.end();
  });

  await streamDeepSearchCategory(res, { topic, category });
});

export default router;
