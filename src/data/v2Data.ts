export interface AreaOfInterest {
  id: string;
  title: string;
  summary: string;
  gameObjective?: string;
}

export interface ThoughtEssay {
  title: string;
  readTime: string;
  date: string;
  excerpt: string;
  content: string;
}

export interface V2Profile {
  name: string;
  shortName: string;
  role: string;
  location: string;
  domain: string;
  linktree: string;
  github: string;
  linkedin: string;
  email: string;
  focus: string;
  tagline: string;
  stats: { label: string; value: string; desc: string }[];
  narrative: string[];
  areasOfInterest: AreaOfInterest[];
  thoughts: ThoughtEssay[];
}

export const MAHIM_V2_DATA: V2Profile = {
  name: "Mahimur Rahman Khan",
  shortName: "Mahim",
  role: "Mathematics Student & Technologist",
  location: "Savar, Dhaka, Bangladesh",
  domain: "mahimurrahman.me",
  linktree: "https://linktr.ee/mahimurrahman",
  github: "https://github.com/mahimurrahman",
  linkedin: "https://www.linkedin.com/in/mahimurrahman-khan",
  email: "mahimurrahmmankhan@gmail.com",
  focus: "Mathematics • Artificial Intelligence • Intelligent Systems • Software Architecture",
  tagline: "Exploring artificial intelligence, intelligent systems, and the future of technology.",
  stats: [
    { label: "Projects Built", value: "5+", desc: "Solving real-world problems through intelligent systems" },
    { label: "Technologies Used", value: "10+", desc: "Mastered tools, frameworks, and foundational math" },
    { label: "Areas of Focus", value: "Core", desc: "AI Systems • Automation • Scalable Software" },
  ],
  narrative: [
    "I am a mathematics student and technologist based in Bangladesh, exploring the critical intersection between pure mathematical structures, artificial intelligence, and scalable software systems.",
    "Rather than merely assembling software components, I focus on building resilient, autonomous systems with foundational depth. My work revolves around AI agents, intelligent automation pipelines, and exploring the architectural layers that power modern intelligence.",
    "Guided by rigorous mathematical thinking—spanning linear algebra, discrete systems, and formal logic—I strive to design technology that augments human cognitive capability and builds a meaningful digital future.",
  ],
  areasOfInterest: [
    {
      id: "01",
      title: "Artificial Intelligence",
      summary: "Investigating deep representations, cognitive architectures, vector embeddings, and reasoning loops that power modern neural intelligence.",
      gameObjective: "Collect AI Core Alpha at the Northern Overpass"
    },
    {
      id: "02",
      title: "AI Agents & Automation",
      summary: "Building autonomous goal-seeking workflows, tool-use systems, deterministic execution graphs, and self-correcting agent swarms.",
      gameObjective: "Reach the Automation Beacon at the High-Speed Drift Ring"
    },
    {
      id: "03",
      title: "Intelligent Software Systems",
      summary: "Architecting high-throughput distributed backends, resilient event loops, and intelligent micro-services that act as the backbone for machine learning.",
      gameObjective: "Navigate the Distributed Grid Ramp Network"
    },
    {
      id: "04",
      title: "Human–AI Collaboration",
      summary: "Designing interfaces and co-pilot systems where machines augment human intellectual depth rather than replacing creative agency.",
      gameObjective: "Access the Symbiosis Tower in Sector 4"
    },
    {
      id: "05",
      title: "Future of Technology",
      summary: "Examining post-deep-learning paradigms, local edge compute, verifiable AI execution, and ethical computing foundations.",
      gameObjective: "Unlock the Quantum Horizon Terminal"
    },
    {
      id: "06",
      title: "Mathematics & Logical Thinking",
      summary: "Grounding engineering in formal linear algebra, multivariable optimization, probability theory, discrete graph structures, and algorithmic proofs.",
      gameObjective: "Execute the Stunt Jump through the Mathematical Hypercube"
    },
  ],
  thoughts: [
    {
      title: "The Future of Human + AI Collaboration",
      readTime: "5 min read",
      date: "Recent Thought",
      excerpt: "AI is transitioning from a conversational novelty into an external cognitive cortex. The real breakthrough isn't artificial general intelligence acting in isolation, but synchronized human-machine symbiotic loops.",
      content: "The prevailing narrative often frames AI as a looming replacement for human intellect. However, historically, our greatest computational leaps have always been augmentative. When an engineer or mathematician pairs with an agent capable of navigating high-dimensional latent space in real time, the friction between hypothesis and experimentation collapses. The future belongs to those who view intelligent models not as workers, but as computational lenses."
    },
    {
      title: "Why APIs Are the Infrastructure of Modern AI",
      readTime: "4 min read",
      date: "Recent Thought",
      excerpt: "Models are the compute engines, but composable, standardized APIs are the circulatory system enabling intelligence to permeate software.",
      content: "Weights and neural networks are inert matrices without structured I/O. The real capability leap in recent AI development didn't occur purely due to parameter scaling—it happened because APIs allowed agents to call functions, query vector databases, trigger webhooks, and alter external state. In essence, APIs are the sensory and motor nerves connecting raw mathematical inference to physical reality."
    },
    {
      title: "Building Systems Instead of Just Software",
      readTime: "6 min read",
      date: "Recent Thought",
      excerpt: "Software produces outputs for given inputs; systems manage continuous feedback, self-healing, state convergence, and emergent complexity.",
      content: "Most modern development emphasizes rapid feature assembly. But as systems integrate probabilistic models, traditional deterministic code patterns fail. Engineering in the era of intelligence demands systemic thinking: designing fail-safes, observability loops, self-correcting prompt flows, and distributed data pipelines that remain stable under non-deterministic conditions."
    },
    {
      title: "The Intelligence Layer of the Internet",
      readTime: "7 min read",
      date: "Recent Thought",
      excerpt: "We are currently laying the foundations for an ambient intelligence layer embedded directly into the fabric of the web.",
      content: "The original Internet was designed to transmit raw packets of data. The Web 2.0 era organized human social graphs and platform commerce. Today, we are constructing the third sovereign layer: an omnipresent cognitive mesh where information is not simply retrieved, but contextualized, reasoned about, and synthesized on demand by autonomous background processes."
    }
  ]
};
