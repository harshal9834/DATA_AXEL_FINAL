import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Seed Trending Technologies ───────────────────────────────────────────
  const technologies = [
    'Small Language Models',
    'Retrieval-Augmented Agents',
    'Edge AI on RISC-V',
    'Diffusion Policies',
    'Federated Learning',
    'Transformer-based Forecasting',
    'Multi-modal LLMs',
    'Graph Neural Networks',
    'Causal ML',
    'Time-series Foundation Models'
  ];

  for (const tech of technologies) {
    await prisma.trendingTechnology.upsert({
      where: { name: tech },
      update: { mention: { increment: 1 } },
      create: {
        name: tech,
        category: 'AI/ML',
        mention: Math.floor(Math.random() * 50) + 10
      }
    });
  }
  console.log('✅ Seeded trending technologies');

  // ─── Seed Hackathons ──────────────────────────────────────────────────────
  const hackathons = [
    {
      title: 'Global AI Summit Hack',
      prize: '$50,000',
      eventDate: new Date('2024-12-05')
    },
    {
      title: 'ClimateOS Sprint',
      prize: '$30,000',
      eventDate: new Date('2025-01-12')
    },
    {
      title: 'HealthTech Build',
      prize: '$40,000',
      eventDate: new Date('2025-02-02')
    },
    {
      title: 'Web3 Innovation Challenge',
      prize: '$25,000',
      eventDate: new Date('2025-02-15')
    }
  ];

  for (const h of hackathons) {
    const existing = await prisma.hackathon.findFirst({
      where: { title: h.title }
    });
    if (!existing) {
      await prisma.hackathon.create({
        data: {
          title: h.title,
          prize: h.prize,
          eventDate: h.eventDate,
          status: h.eventDate > new Date() ? 'UPCOMING' : 'COMPLETED'
        }
      });
    }
  }
  console.log('✅ Seeded hackathons');

  // ─── Seed Sample Research Papers ──────────────────────────────────────────
  const papers = [
    {
      title: 'Predicting Restaurant Food Waste with Transformer-based Demand Models',
      authors: 'Chen et al.',
      source: 'KDD 2024'
    },
    {
      title: 'Large Language Models as Zero-shot Forecasters',
      authors: 'Zhang et al.',
      source: 'NeurIPS 2023'
    },
    {
      title: 'Multimodal Medical Reasoning Benchmarks',
      authors: 'Patel et al.',
      source: 'ICML 2024'
    },
    {
      title: 'Efficient Fine-tuning of Small Language Models',
      authors: 'Kumar et al.',
      source: 'ACL 2024'
    },
    {
      title: 'Causal Discovery in Complex Systems',
      authors: 'Liu et al.',
      source: 'arXiv 2024'
    }
  ];

  // Note: These are sample papers. In production, you'd link to a real user.
  // For now, we'll skip user assignment since we don't have test users
  console.log('✅ Prepared research papers for import');

  // ─── Create default dashboard metrics ──────────────────────────────────────
  const metrics = [
    { metric: 'total_projects', value: 24 },
    { metric: 'research_reports', value: 187 },
    { metric: 'resources_saved', value: 1243 },
    { metric: 'ai_sessions', value: 512 },
    { metric: 'documentation_count', value: 96 },
    { metric: 'innovation_score', value: 91 }
  ];
  console.log('✅ Prepared dashboard metrics');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📝 Notes:');
  console.log('- Trending technologies: initialized');
  console.log('- Hackathons: initialized');
  console.log('- Research papers: ready for import');
  console.log('- Dashboard metrics: ready for per-user initialization');
  console.log('\n💡 When users create workflows, these base entities will be linked to their projects.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
