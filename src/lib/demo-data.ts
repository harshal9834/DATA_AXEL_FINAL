export type Project = {
  id: string;
  title: string;
  domain: string;
  status: "In Progress" | "Research" | "Architecture" | "Completed";
  progress: number;
  research: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  innovation: number;
  updated: string;
  description: string;
  objectives: string[];
  users: string[];
  outcome: string;
};

export const projects: Project[] = [
  {
    id: "food-waste-ai",
    title: "AI for Food Waste Reduction",
    domain: "Sustainability",
    status: "In Progress",
    progress: 68,
    research: 82,
    difficulty: "Intermediate",
    innovation: 92,
    updated: "2h ago",
    description:
      "A computer-vision + demand-forecasting system that predicts food surplus in restaurants and redistributes it to local shelters through a real-time logistics layer.",
    objectives: [
      "Predict daily food surplus with >90% accuracy",
      "Match surplus to nearby shelters in <5 minutes",
      "Reduce restaurant food waste by 40%",
    ],
    users: ["Restaurants", "NGOs", "Urban shelters", "City sustainability offices"],
    outcome: "Deployable SaaS + mobile PWA with ML pipeline and logistics dashboard.",
  },
  {
    id: "medi-diagnose",
    title: "MediDiagnose — Multi-modal Health Copilot",
    domain: "Healthcare",
    status: "Research",
    progress: 34,
    research: 61,
    difficulty: "Advanced",
    innovation: 88,
    updated: "1d ago",
    description:
      "A multi-modal diagnostic copilot that reasons over symptoms, lab reports, and medical imaging using an ensemble of specialised medical LLMs.",
    objectives: ["HIPAA-compliant ingestion", "Explainable diagnostic reasoning", "Physician-in-the-loop"],
    users: ["General practitioners", "Rural clinics", "Telemedicine platforms"],
    outcome: "FDA-pilot-ready copilot with audit trail and evidence citation.",
  },
  {
    id: "edu-tutor",
    title: "Adaptive Learning Tutor",
    domain: "EdTech",
    status: "Architecture",
    progress: 52,
    research: 74,
    difficulty: "Intermediate",
    innovation: 79,
    updated: "3d ago",
    description: "Personalised curriculum engine that adapts pacing, examples and assessment style to each learner.",
    objectives: ["Bloom-taxonomy tracking", "Multi-language support", "Offline-first mobile"],
    users: ["K-12 students", "Universities", "Corporate L&D"],
    outcome: "White-label tutor SDK with analytics.",
  },
  {
    id: "climate-forecast",
    title: "HyperLocal Climate Forecasting",
    domain: "Climate",
    status: "Completed",
    progress: 100,
    research: 100,
    difficulty: "Advanced",
    innovation: 95,
    updated: "1w ago",
    description: "Neighborhood-level weather + air-quality forecasting using satellite fusion and edge sensors.",
    objectives: ["1km resolution", "6-hour forecast horizon", "Public API"],
    users: ["City governments", "Logistics", "Agriculture"],
    outcome: "Open API + dashboard, deployed pilot in 3 cities.",
  },
  {
    id: "smart-farm",
    title: "SmartFarm Vision",
    domain: "AgriTech",
    status: "In Progress",
    progress: 41,
    research: 58,
    difficulty: "Intermediate",
    innovation: 84,
    updated: "5h ago",
    description: "Drone + IoT platform for crop-health monitoring with pest early-warning.",
    objectives: ["Multi-spectral image analysis", "Farmer-friendly UI", "Regional pest models"],
    users: ["Smallholder farms", "Agri-cooperatives"],
    outcome: "End-to-end platform with mobile companion.",
  },
  {
    id: "civic-lens",
    title: "CivicLens — Urban Infrastructure AI",
    domain: "GovTech",
    status: "Research",
    progress: 22,
    research: 47,
    difficulty: "Advanced",
    innovation: 81,
    updated: "6h ago",
    description: "Detect infrastructure defects from crowd-sourced photos & municipal cameras.",
    objectives: ["Detect 12 defect classes", "Prioritise by risk", "Ticket to city workflow"],
    users: ["Municipalities", "Citizens"],
    outcome: "Integrated with 311 systems.",
  },
];

export const stats = [
  { label: "Projects", value: 24, delta: "+12%", icon: "layers", data: [4, 6, 5, 8, 7, 10, 12] },
  { label: "Research Reports", value: 187, delta: "+24%", icon: "book-open", data: [10, 14, 12, 18, 22, 26, 31] },
  { label: "Resources", value: 1_243, delta: "+8%", icon: "library", data: [60, 62, 70, 78, 85, 92, 100] },
  { label: "AI Sessions", value: 512, delta: "+31%", icon: "sparkles", data: [20, 26, 30, 36, 42, 50, 58] },
  { label: "Documentation", value: 96, delta: "+5%", icon: "file-text", data: [5, 6, 6, 7, 8, 9, 10] },
  { label: "Innovation Score", value: 91, delta: "+3", icon: "trending-up", data: [70, 74, 78, 82, 84, 88, 91] },
];

export const researchStages = [
  { key: "problem", label: "Problem Validation", status: "done" as const },
  { key: "deepsearch", label: "DeepSearch", status: "done" as const },
  { key: "cluster", label: "Knowledge Clustering", status: "done" as const },
  { key: "summary", label: "Research Summary", status: "active" as const },
  { key: "gap", label: "Research Gap", status: "active" as const },
  { key: "arch", label: "Architecture", status: "pending" as const },
  { key: "timeline", label: "Timeline", status: "pending" as const },
  { key: "docs", label: "Documentation", status: "pending" as const },
];

export const suggestions = {
  today: [
    "Prototype a real-time surplus-matching algorithm",
    "Interview 3 restaurant managers this week",
    "Draft the ML feature store spec",
  ],
  trending: ["Small Language Models", "Retrieval-Augmented Agents", "Edge AI on RISC-V", "Diffusion Policies", "Federated Learning"],
  research: [
    "LLM-guided causal discovery (arXiv 2410.xxxx)",
    "Zero-shot forecasting with time-series foundation models",
    "Multimodal medical reasoning benchmarks",
  ],
  hackathons: [
    { name: "Global AI Summit Hack", date: "Dec 5", prize: "$50k" },
    { name: "ClimateOS Sprint", date: "Jan 12", prize: "$30k" },
    { name: "HealthTech Build", date: "Feb 2", prize: "$40k" },
  ],
};

export const deepSearchResults = [
  {
    source: "Research Paper",
    title: "Predicting Restaurant Food Waste with Transformer-based Demand Models",
    summary:
      "Introduces a transformer model that jointly forecasts covers and menu-item demand, reducing waste by 38% in a 6-month pilot across 22 restaurants.",
    citation: "Chen et al., 2024, KDD",
    url: "#",
  },
  {
    source: "GitHub",
    title: "openfoodrescue/route-optimizer",
    summary: "MIT-licensed Rust service for last-mile perishable-food routing. 4.2k stars, active maintainers, benchmarks included.",
    citation: "github.com/openfoodrescue",
    url: "#",
  },
  {
    source: "Dataset",
    title: "FoodWasteBench-2024",
    summary: "18M labeled images of restaurant plate waste + accompanying order metadata. CC-BY.",
    citation: "HuggingFace Datasets",
    url: "#",
  },
  {
    source: "Government",
    title: "USDA Food Loss and Waste Reduction 2030 Goal",
    summary: "Policy framework and grant opportunities for surplus-food redistribution technology.",
    citation: "usda.gov",
    url: "#",
  },
  {
    source: "News",
    title: "European cities pilot AI-driven surplus food networks",
    summary: "Coverage of 4 European pilots showing 30–45% waste reduction.",
    citation: "Reuters",
    url: "#",
  },
  {
    source: "Documentation",
    title: "Google Maps Distance Matrix API",
    summary: "Reference for real-time drive-time matrices needed by the matching engine.",
    citation: "developers.google.com",
    url: "#",
  },
];

export const resources = [
  { cat: "GitHub", title: "awesome-ai-research", tags: ["curated", "papers"], difficulty: "All", color: "from-indigo-500 to-blue-500" },
  { cat: "Research Papers", title: "The Rise of Small Language Models", tags: ["SLM", "efficiency"], difficulty: "Advanced", color: "from-fuchsia-500 to-violet-500" },
  { cat: "Datasets", title: "OpenFoodFacts 2.1M", tags: ["food", "nutrition"], difficulty: "Beginner", color: "from-emerald-500 to-teal-500" },
  { cat: "Courses", title: "Full-Stack Deep Learning 2024", tags: ["MLOps", "course"], difficulty: "Intermediate", color: "from-amber-500 to-orange-500" },
  { cat: "Videos", title: "Building Agentic Workflows", tags: ["agents", "talk"], difficulty: "Intermediate", color: "from-sky-500 to-cyan-500" },
  { cat: "Blogs", title: "Latent Space — Weekly", tags: ["newsletter"], difficulty: "All", color: "from-rose-500 to-pink-500" },
  { cat: "API Libraries", title: "LangGraph + LangChain", tags: ["agents", "sdk"], difficulty: "Intermediate", color: "from-violet-500 to-indigo-500" },
  { cat: "GitHub", title: "llm-course by mlabonne", tags: ["curriculum", "llm"], difficulty: "Advanced", color: "from-blue-500 to-cyan-500" },
  { cat: "Datasets", title: "COCO-Waste 2024", tags: ["vision"], difficulty: "Intermediate", color: "from-teal-500 to-emerald-500" },
  { cat: "Research Papers", title: "Diffusion Policies for Robotics", tags: ["robotics"], difficulty: "Advanced", color: "from-purple-500 to-fuchsia-500" },
  { cat: "Videos", title: "Andrej Karpathy — LLMs 101", tags: ["intro", "llm"], difficulty: "Beginner", color: "from-orange-500 to-red-500" },
  { cat: "Blogs", title: "Simon Willison's Weblog", tags: ["news"], difficulty: "All", color: "from-pink-500 to-rose-500" },
];

export const timeline = [
  { week: "Week 1", title: "Problem framing & user interviews", pct: 100, items: ["10 stakeholder interviews", "Problem statement locked", "Success metrics"] },
  { week: "Week 2", title: "Deep research & literature review", pct: 100, items: ["12 papers reviewed", "Competitive teardown", "Gap analysis"] },
  { week: "Week 3", title: "Architecture & prototype", pct: 62, items: ["System diagram", "Data model", "Prototype ML pipeline"] },
  { week: "Week 4", title: "Pilot & documentation", pct: 18, items: ["Pilot with 3 partners", "Docs & pitch deck", "Investor memo"] },
];

export const clusters = [
  { name: "Research", color: "#2563eb", items: ["Transformer forecasting", "Causal ML", "Time-series FMs"] },
  { name: "Technology", color: "#7c3aed", items: ["LangGraph", "PyTorch", "Redis Streams"] },
  { name: "Datasets", color: "#06b6d4", items: ["FoodWasteBench", "OpenFoodFacts", "CitySensors"] },
  { name: "GitHub", color: "#10b981", items: ["route-optimizer", "surplus-matcher", "shelter-registry"] },
  { name: "APIs", color: "#f59e0b", items: ["Google Maps", "Twilio", "Stripe Climate"] },
  { name: "Papers", color: "#ef4444", items: ["KDD 2024", "NeurIPS 2023", "ICML 2024"] },
];
