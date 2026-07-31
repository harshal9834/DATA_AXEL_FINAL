import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

import { conversationManager } from './src/services/voice/conversationManager';
import { prisma } from './src/server';
import { startWorkflow } from './src/services/workflowEngine';

async function test() {
  const socketId = 'test_socket_123';
  
  console.log('--- TEST 1: Simple Greeting ---');
  let res = await conversationManager.handleMessage(socketId, "Hi there!");
  console.log('Reply:', res.reply);
  console.log('ConfirmResearch:', res.confirmResearch);
  
  console.log('\n--- TEST 2: Complex Project Idea (Should trigger agents) ---');
  res = await conversationManager.handleMessage(socketId, "I want to build a real-time collaborative code editor with video chat. It needs authentication and scalable backend architecture.");
  console.log('Reply:', res.reply);
  console.log('ConfirmResearch:', res.confirmResearch);
  
  // Wait a bit to let the background workflow start
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('\n--- TEST 3: Memory check ---');
  res = await conversationManager.handleMessage(socketId, "What was the project I just told you about?");
  console.log('Reply:', res.reply);
  
  console.log('\n--- TEST 4: Recommendations check ---');
  res = await conversationManager.handleMessage(socketId, "Do you have any suggestions for the tech stack based on our architecture?");
  console.log('Reply:', res.reply);
  
  process.exit(0);
}

test().catch(console.error);
