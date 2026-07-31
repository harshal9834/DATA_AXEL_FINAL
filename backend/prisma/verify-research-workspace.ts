/**
 * CRUD Verification Script for ResearchWorkspace
 * Run: npx ts-node --esm prisma/verify-research-workspace.ts
 * (or: node -e "require('./prisma/verify-research-workspace.cjs')")
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== ResearchWorkspace CRUD Verification ===\n');

  // ── Need a valid userId — fetch first user ──────────────────────────────────
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No User records found. Cannot run verification without a userId FK.');
    process.exit(1);
  }
  console.log(`✅ Found test user: ${user.id}`);

  // ── CREATE ──────────────────────────────────────────────────────────────────
  const workspace = await prisma.researchWorkspace.create({
    data: {
      userId: user.id,
      projectName: '__CRUD_TEST__',
      problemStatement: 'CRUD verification test — safe to delete',
      status: 'CREATED',
      progress: 0,
      totalStages: 12,
    },
  });
  console.log(`✅ CREATE: workspace.id = ${workspace.id}`);

  // ── READ ────────────────────────────────────────────────────────────────────
  const found = await prisma.researchWorkspace.findUnique({ where: { id: workspace.id } });
  if (!found) throw new Error('READ failed — record not found after create');
  console.log(`✅ READ:   projectName = ${found.projectName}`);

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  const updated = await prisma.researchWorkspace.update({
    where: { id: workspace.id },
    data: { progress: 50, status: 'RESEARCHING', currentStage: 'Verification Stage' },
  });
  if (updated.progress !== 50) throw new Error('UPDATE failed — progress not updated');
  console.log(`✅ UPDATE: progress = ${updated.progress}, status = ${updated.status}`);

  // ── DELETE ──────────────────────────────────────────────────────────────────
  await prisma.researchWorkspace.delete({ where: { id: workspace.id } });
  const gone = await prisma.researchWorkspace.findUnique({ where: { id: workspace.id } });
  if (gone) throw new Error('DELETE failed — record still exists');
  console.log(`✅ DELETE: record removed successfully`);

  console.log('\n🎉 All CRUD operations verified. ResearchWorkspace table is fully operational.\n');
}

main()
  .catch((e) => {
    console.error('\n❌ CRUD verification FAILED:\n', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
