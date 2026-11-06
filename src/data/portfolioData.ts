export interface WaypointNode {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  biome: string;
  zPosition: number;
  xOffset: number;
  accentColor: string;
  summary: string;
  tags: string[];
  details: {
    heading: string;
    body: string;
    codeSnippet?: string;
    metrics?: { label: string; value: string }[];
    items?: { title: string; subtitle?: string; description: string; badge?: string }[];
  };
}

export const MAHIM_PROFILE = {
  name: "Mahimur Rahman Khan",
  shortName: "Mahim",
  roles: [
    "AI Systems Builder",
    "Mathematics Student",
    "Reverse Engineering Architect",
    "Technologist"
  ],
  location: "Savar, Dhaka, Bangladesh",
  domain: "mahimurrahman.me",
  email: "mahimurrahmankhan@gmail.com",
  links: {
    github: "https://github.com/mahimurrahman",
    linkedin: "https://www.linkedin.com/in/mahimur-rahman-939008255/",
    twitter: "https://x.com/MAHIMURRAHMAN01",
    linktree: "https://linktr.ee/mahimurrahman",
    reaRepo: "https://github.com/morluto/rea"
  },
  bio: [
    "I am a mathematics student and technologist based in Savar, Dhaka, Bangladesh, exploring the critical intersection between pure mathematical structures, artificial intelligence, reverse engineering, and scalable software systems.",
    "Rather than merely assembling software components, I focus on building resilient, autonomous systems with foundational depth—from multi-agent orchestration and MCP reverse-engineering pipelines to formal mathematical reasoning.",
    "Guided by rigorous mathematical thinking—spanning linear algebra, discrete graph structures, and formal logic—I design technology that augments human cognitive capability and uncovers how complex systems work down to the binary level."
  ],
  stats: [
    { number: "5+", label: "Systems & Projects", sublabel: "Autonomous & intelligent architectures" },
    { number: "30+", label: "Binary & App Targets", sublabel: "Inspected via REA MCP workflows" },
    { number: "10+", label: "Core Technologies", sublabel: "TypeScript, Python, AI, Math & RE" },
    { number: "4K", label: "Spatial Computing", sublabel: "Real-time procedural WebGL / Three.js" }
  ]
};

export const FOREST_WAYPOINTS: WaypointNode[] = [
  {
    id: "sanctuary-gate",
    number: "01",
    title: "The Sanctuary Gate",
    subtitle: "Origin • Identity • Mathematical Vision",
    biome: "Emerald Canopy Entrance",
    zPosition: 10,
    xOffset: 0,
    accentColor: "#34d399",
    summary: "Welcome to the living 3D sanctuary of Mahimur Rahman Khan — Technologist, Mathematics Student, and AI Systems Builder based in Savar, Dhaka, Bangladesh.",
    tags: ["Mathematics", "AI Systems", "Bangladesh", "Spatial Portfolio"],
    details: {
      heading: "Where Pure Mathematics Meets Living Systems",
      body: "Walk forward through the forest trail using W/A/S/D, Arrow Keys, Scroll, or the HUD autopilot. Every clearing in this sanctuary represents a pillar of my work: from reverse-engineering systems down to the binary level, to autonomous AI agents, selected engineering works, and philosophical reflections.",
      metrics: [
        { label: "Location", value: "Savar, Dhaka, BD" },
        { label: "Discipline", value: "Math & AI Systems" },
        { label: "Philosophy", value: "Systems > Software" },
        { label: "Mode", value: "Interactive 3D Walk" }
      ],
      items: [
        {
          title: "Mathematical Foundation",
          badge: "Core Pillar",
          description: "Grounding software architecture in formal linear algebra, multivariable optimization, probability theory, discrete graph structures, and algorithmic proofs."
        },
        {
          title: "Autonomous AI Engineering",
          badge: "Core Pillar",
          description: "Designing goal-seeking workflows, deterministic execution graphs, MCP tool servers, and human-AI symbiotic loops."
        },
        {
          title: "Deep Systems Inspection",
          badge: "Core Pillar",
          description: "Understanding software from high-level web & Electron boundaries all the way down to machine instructions, CFG, and binary provenance."
        }
      ]
    }
  },
  {
    id: "rea-citadel",
    number: "02",
    title: "REA Reverse Engineering Citadel",
    subtitle: "morluto/rea • One MCP for Reverse Engineering Anything",
    biome: "Bioluminescent Binary Glade",
    zPosition: -32,
    xOffset: -4.2,
    accentColor: "#2dd4bf",
    summary: "Deep architectural synthesis of REA (Reverse Engineer Anything): a local-only Model Context Protocol (MCP) & CLI system for inspecting binaries, JS/Electron apps, .NET, Android, firmware, and runtime behavior with strict Evidence provenance.",
    tags: ["MCP Server", "Ghidra / Hopper / IDA", "AST & Bytecode", "Evidence Ledger", "RL Environments"],
    details: {
      heading: "See a Feature You Like. Understand How It Works, Down to the Binary Level.",
      body: "REA connects AI coding agents (Claude Code, Cursor, Gemini CLI, Codex) to deterministic reverse-engineering providers over stdio/HTTP MCP and CLI adapters. Dependencies flow strictly inward: CLI/MCP Adapters → Shared Application Workflows (SessionProviderRouter, BinarySession, EvidenceLedger) → Provider Adapters → Pure Domain Semantics.",
      codeSnippet: `// REA Inward Architecture & Evidence Provenance Flow
Agent / CLI  ──►  MCP Server / CLI Adapter (Compact & Full JSON Schemas)
             ──►  Application Layer (BinarySession + EvidenceLedger + CapabilityScope)
             ──►  Deep Native Providers: Hopper | Ghidra Headless | IDA MCP | Kuna
             ──►  Static & Runtime Adapters: JS/Electron ASAR | .NET CIL | JADX APK
             ──►  In-Process Readers: Go | Rust | GPU CUBIN/PTX | EVM | GGUF | ELF/PE`,
      metrics: [
        { label: "Deep Providers", value: "Hopper • Ghidra • IDA • Kuna" },
        { label: "Target Formats", value: "30+ Binary & App Formats" },
        { label: "Epistemic Model", value: "Obs • Deriv • Infer • Unknown" },
        { label: "RL Export", value: "HAR → AgentEnv Synthesis" }
      ],
      items: [
        {
          title: "Epistemic Discipline & Evidence Ledger",
          badge: "Domain Invariant",
          description: "Strictly separates direct observations, deterministic derivations, inferences, and explicit unknowns (NOT_ENOUGH_INFO). Every claim preserves byte offsets, digests, and source provenance."
        },
        {
          title: "Deep Native Decompilation & Disassembly",
          badge: "Native Engines",
          description: "Bridges Hopper (Python Unix socket), Ghidra (ephemeral headless Java bridge with 16-bit DOS support), IDA Pro (read-only GUI/headless MCP), Kuna, Rizin, GDB/MI, and Frida instrumentation."
        },
        {
          title: "Multi-Target Static & Runtime Reconstruction",
          badge: "30+ Analyzers",
          description: "Covers Electron/JS ASAR bundles & source maps, .NET PE/CLI metadata, Android APK/JADX/ADB, Firmware (Binwalk/Unblob), GPU CUDA/PTX, EVM bytecode, Go/Rust build info, and GGUF/safetensors."
        },
        {
          title: "Notable Reconstructions & RL Environment Builder",
          badge: "Showcases",
          description: "Reconstructed DX-Ball's x86 sound-pan function (matching all 63 compiled bytes across 3,205 cases), traced Notion's Electron IPC clipboard bridge, recovered TH04's PC-98 16-bit bullet-ring math, and converts recorded HAR traffic into runnable AgentEnv RL training environments."
        }
      ]
    }
  },
  {
    id: "selected-works",
    number: "03",
    title: "Garden of Selected Works",
    subtitle: "Featured Engineering • Systems From Concept to Launch",
    biome: "Sunlit Botanical Pavilion",
    zPosition: -76,
    xOffset: 4.2,
    accentColor: "#f59e0b",
    summary: "A curated sanctuary of featured works spanning autonomous agent pipelines, reverse-engineering intelligence, high-dimensional mathematical visualizations, and spatial web architectures.",
    tags: ["AI Systems", "Reverse Engineering", "Spatial WebGL", "Full-Stack Architecture"],
    details: {
      heading: "Featured Projects & Architectural Builds",
      body: "Each project is engineered as a complete, self-reinforcing system rather than an isolated script—combining mathematical rigor, modern AI toolchains, and tactile visual design.",
      metrics: [
        { label: "Architecture", value: "End-to-End Systems" },
        { label: "Stack", value: "TS • React • Three.js • Python" },
        { label: "AI Integration", value: "MCP • Gemini • Agent Loops" },
        { label: "Quality Bar", value: "Zero-Placeholder Production" }
      ],
      items: [
        {
          title: "REA System Explorer & Binary Intelligence Workflow",
          subtitle: "MCP Reverse Engineering Integration",
          badge: "Featured",
          description: "Interactive architectural model and workflow harness for inspecting native binaries, Electron apps, and runtime traces with strict Evidence provenance and automated C/TypeScript reconstruction."
        },
        {
          title: "Autonomous Multi-Agent Orchestration Engine",
          subtitle: "AI Systems & Tool-Use Graphs",
          badge: "AI Core",
          description: "Goal-seeking agent runtime connecting LLM reasoning loops with deterministic API execution, vector memory, and self-correcting verification gates."
        },
        {
          title: "Automotive Motion & Algorithmic Dynamics",
          subtitle: "Kinematics & Real-Time Telemetry",
          badge: "Simulation",
          description: "High-precision motion modeling, wireframe telemetry visualization, and physics-informed state estimation for dynamic mechanical systems."
        },
        {
          title: "Urban Architecture & Spatial Computing Sanctuary",
          subtitle: "4K Procedural Three.js / WebGL Experience",
          badge: "Spatial Web",
          description: "This living 3D botanical forest and architectural pavilion—featuring custom GLSL foliage wind shaders, procedural terrain, dynamic day/twilight atmosphere, and interactive spatial waypoints."
        }
      ]
    }
  },
  {
    id: "areas-of-interest",
    number: "04",
    title: "Grove of Six Pillars",
    subtitle: "Core Explorations • Mathematics, AI & Philosophy",
    biome: "Ancient Stone & Fern Circle",
    zPosition: -120,
    xOffset: -4.0,
    accentColor: "#38bdf8",
    summary: "Exploring the space between artificial intelligence, formal mathematical structures, human cognitive potential, and systemic software design.",
    tags: ["Artificial Intelligence", "AI Agents", "Intelligent Systems", "Human-AI Symbiosis", "Mathematics"],
    details: {
      heading: "The Six Domains of Inquiry",
      body: "My research and engineering revolve around six interconnected pillars where pure mathematical reasoning powers practical, next-generation intelligence.",
      items: [
        {
          title: "01 — Artificial Intelligence",
          badge: "Neural & Symbolic",
          description: "Investigating deep representations, cognitive architectures, vector embeddings, and reasoning loops that power modern neural intelligence."
        },
        {
          title: "02 — AI Agents & Automation",
          badge: "Autonomous Graphs",
          description: "Building autonomous goal-seeking workflows, MCP tool-use systems, deterministic execution graphs, and self-correcting agent swarms."
        },
        {
          title: "03 — Intelligent Software Systems",
          badge: "Resilient Backends",
          description: "Architecting high-throughput distributed backends, resilient event loops, and intelligent microservices that act as the backbone for machine learning."
        },
        {
          title: "04 — Human–AI Collaboration",
          badge: "Cognitive Symbiosis",
          description: "Designing interfaces and interactive workspaces where AI acts as an external cognitive cortex—collapsing the friction between hypothesis and verification."
        },
        {
          title: "05 — Future of Technology",
          badge: "Edge & Verifiable AI",
          description: "Examining post-deep-learning paradigms, local-first reverse engineering, verifiable execution, and ethical computing foundations."
        },
        {
          title: "06 — Mathematics & Logical Thinking",
          badge: "Formal Foundations",
          description: "Grounding engineering in formal linear algebra, multivariable optimization, probability theory, discrete graph structures, and algorithmic proofs."
        }
      ]
    }
  },
  {
    id: "journal-pond",
    number: "05",
    title: "Pond of Reflections",
    subtitle: "Recent Thoughts • Essays on Intelligence & Systems",
    biome: "Mirror Water & Lantern Clearing",
    zPosition: -164,
    xOffset: 3.8,
    accentColor: "#a7f3d0",
    summary: "A collection of essays and philosophical reflections on human-AI collaboration, APIs as cognitive nerves, systemic engineering, and the intelligence layer of the internet.",
    tags: ["Essays", "Human + AI", "API Infrastructure", "Systemic Thinking", "Cognitive Mesh"],
    details: {
      heading: "Recent Thoughts & Philosophical Dispatches",
      body: "Reflections written at the intersection of mathematical theory and hands-on systems engineering.",
      items: [
        {
          title: "The Future of Human + AI Collaboration",
          subtitle: "5 min read • Cognitive Symbiosis",
          badge: "Essay 01",
          description: "The prevailing narrative often frames AI as a replacement for human work. In reality, our greatest computational leaps are augmentative. When an engineer or mathematician pairs with an agent capable of navigating high-dimensional latent space in real time, the friction between hypothesis and experimentation collapses. Intelligent models are computational lenses."
        },
        {
          title: "Why APIs Are the Infrastructure of Modern AI",
          subtitle: "4 min read • Sensory & Motor Nerves",
          badge: "Essay 02",
          description: "Weights and neural networks are inert matrices without structured I/O. The real capability leap occurred because standardized APIs and protocols like MCP allowed agents to call functions, inspect binaries, query vector databases, and alter external state. APIs are the sensory and motor nerves connecting mathematical inference to reality."
        },
        {
          title: "Building Systems Instead of Just Software",
          subtitle: "6 min read • State Convergence",
          badge: "Essay 03",
          description: "Traditional programming focused on writing individual pieces of software. Today the most valuable digital products are systems composed of data pipelines, AI models, APIs, verification gates, and spatial interfaces—designed with fail-safes and observability loops that remain stable under probabilistic conditions."
        },
        {
          title: "The Intelligence Layer of the Internet",
          subtitle: "7 min read • Sovereign Cognitive Mesh",
          badge: "Essay 04",
          description: "For decades the internet connected raw packets of information. Now artificial intelligence is becoming a sovereign layer on top of that infrastructure—an omnipresent cognitive mesh where information is not merely retrieved, but interpreted, proven, and synthesized on demand."
        }
      ]
    }
  },
  {
    id: "summit-portal",
    number: "06",
    title: "The Horizon Portal",
    subtitle: "Connect & Collaborate • Savar, Dhaka to the World",
    biome: "Starlit Sanctuary Summit",
    zPosition: -206,
    xOffset: 0,
    accentColor: "#fbbf24",
    summary: "Have an idea, research inquiry, or engineering collaboration in mind? Step up to the summit portal to connect directly with Mahimur Rahman Khan.",
    tags: ["Contact", "Collaboration", "GitHub", "LinkedIn", "X / Twitter"],
    details: {
      heading: "Let's Build Meaningful Intelligent Systems Together",
      body: "I am always open to discussions about mathematics, artificial intelligence, reverse engineering, and building resilient digital systems. Reach out directly via email or connect across platforms.",
      metrics: [
        { label: "Email", value: "mahimurrahmankhan@gmail.com" },
        { label: "Base", value: "Savar, Dhaka, Bangladesh" },
        { label: "GitHub", value: "@mahimurrahman" },
        { label: "Status", value: "Open for Collaboration" }
      ],
      items: [
        {
          title: "Direct Electronic Mail",
          subtitle: "mahimurrahmankhan@gmail.com",
          badge: "Primary",
          description: "Send a direct message regarding AI systems engineering, mathematical research, or software collaboration."
        },
        {
          title: "GitHub Repositories & Open Source",
          subtitle: "github.com/mahimurrahman",
          badge: "Code",
          description: "Explore my source code, experiments, portfolio iterations, and systems engineering projects."
        },
        {
          title: "Professional Network & Updates",
          subtitle: "LinkedIn • X (@MAHIMURRAHMAN01) • Linktree",
          badge: "Social",
          description: "Connect on LinkedIn, follow real-time technical thoughts on X, or access all links via Linktree."
        }
      ]
    }
  }
];
