import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

// Ensure we have default user logic handled if Prisma complains
import { startWorkflow } from './src/services/workflowEngine';
import { prisma } from './src/server';

async function testWorkflow() {
  await prisma.user.upsert({
    where: { id: 'default_user' },
    update: {},
    create: {
      id: 'default_user',
      email: 'default@example.com',
      name: 'Default User',
      firebase_uid: 'default_user'
    }
  });

  const workflow = await prisma.workflow.create({
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
  await startWorkflow(workflow.id);
  console.log('Workflow execution completed.');
  process.exit(0);
}

testWorkflow().catch(console.error);
