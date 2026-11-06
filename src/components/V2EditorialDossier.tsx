import { useState } from 'react';
import { motion } from 'framer-motion';
import { MAHIM_V2_DATA } from '../data/v2Data';
import {
  Gamepad2,
  Sparkles,
  BookOpen,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Github,
  Linkedin,
  Terminal,
  Cpu,
  Brain,
  Layers,
  ArrowUpRight,
  Send,
  Compass
} from 'lucide-react';

interface V2EditorialDossierProps {
  onSwitchToGame: () => void;
  onSwitchToForest: () => void;
}

export default function V2EditorialDossier({
  onSwitchToGame,
  onSwitchToForest
}: V2EditorialDossierProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedThought, setSelectedThought] = useState<number | null>(null);

  const copyEmail = () => {
    navigator.clipboard.writeText(MAHIM_V2_DATA.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#02070a] text-neutral-200 font-sans selection:bg-teal-400 selection:text-black">
      {/* TOP FLOATING NAVIGATION (navbar.gallery inspired) */}
      <header className="sticky top-0 z-40 bg-[#02070a]/85 backdrop-blur-2xl border-b border-white/10 px-6 md:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center font-mono font-bold text-xs text-[#02070a]">
              MRK
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                {MAHIM_V2_DATA.name}
              </div>
              <div className="text-[11px] font-mono text-teal-300/80">
                {MAHIM_V2_DATA.role} &bull; {MAHIM_V2_DATA.location}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onSwitchToGame}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-400 hover:bg-teal-300 text-[#02070a] font-semibold text-xs font-mono transition-all shadow-lg shadow-teal-950/60 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>3D Cyber Game</span>
            </button>
            <button
              onClick={onSwitchToForest}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-mono transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>3D Forest Walk</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 md:px-12 pt-16 pb-20 max-w-6xl mx-auto overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>V2 ARCHITECTURE &bull; MATHEMATICS &times; AI SYSTEMS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display italic text-white tracking-tight mb-6 leading-[1.08]">
            Exploring the geometry of <span className="text-teal-400">intelligence</span> and machine systems.
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed mb-8">
            {MAHIM_V2_DATA.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onSwitchToGame}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-teal-400 hover:bg-teal-300 text-[#02070a] font-semibold text-sm transition-all hover:scale-105 shadow-xl shadow-teal-950/80 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play 3D Browser Game</span>
            </button>
            <button
              onClick={copyEmail}
              className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/15 text-sm transition-colors cursor-pointer"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
              <span>{copiedEmail ? 'Email Copied' : MAHIM_V2_DATA.email}</span>
            </button>
          </div>
        </div>

        {/* METRICS / STATS (from V2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 pt-12 border-t border-white/10">
          {MAHIM_V2_DATA.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/40 transition-colors"
            >
              <div className="text-3xl font-mono font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-teal-300 mb-2">
                {stat.label}
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDATIONAL NARRATIVE */}
      <section className="px-6 md:px-12 py-16 bg-[#040d12]/60 border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-400">
              01 &bull; Identity & Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-display italic text-white mt-2">
              Foundational Narrative
            </h2>
            <p className="text-xs font-mono text-neutral-400 mt-2">
              Direct from the V2 Core Dossier
            </p>
          </div>

          <div className="lg:col-span-8 space-y-5">
            {MAHIM_V2_DATA.narrative.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-sm sm:text-base text-neutral-200 leading-relaxed font-light"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* SIX AREAS OF INTEREST (from V2) */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-teal-400">
              02 &bull; Research & Systems
            </span>
            <h2 className="text-3xl sm:text-4xl font-display italic text-white mt-2">
              Six Areas of Focus
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-400 max-w-sm mt-3 md:mt-0">
            These domains modulate the 3D Cyber Citadel mini-game objectives and research architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MAHIM_V2_DATA.areasOfInterest.map((area) => (
            <div
              key={area.id}
              className="group p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-teal-400/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-teal-300 mb-4">
                  <span>AREA {area.id}</span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 group-hover:scale-125 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-300 transition-colors">
                  {area.title}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-light">
                  {area.summary}
                </p>
              </div>

              {area.gameObjective && (
                <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-mono text-amber-300/90">
                  <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{area.gameObjective}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* RECENT THOUGHTS & ESSAYS (from V2) */}
      <section className="px-6 md:px-12 py-20 bg-[#030a0e]/80 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-400">
              03 &bull; Philosophical Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-display italic text-white mt-2">
              Recent Thoughts & Reflections
            </h2>
            <p className="text-xs font-mono text-neutral-400 mt-2">
              Four essays from the V2 branch exploring AI agents, cognition, and mathematical depth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MAHIM_V2_DATA.thoughts.map((thought, idx) => (
              <div
                key={thought.title}
                className="p-7 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-teal-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
                    <span className="text-teal-300 uppercase tracking-wider">{thought.date}</span>
                    <span>{thought.readTime}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3 leading-snug">
                    {thought.title}
                  </h3>

                  <blockquote className="p-3.5 rounded-xl bg-teal-500/10 border-l-2 border-teal-400 text-xs italic text-teal-200/90 mb-4">
                    &ldquo;{thought.excerpt}&rdquo;
                  </blockquote>

                  <p className="text-xs text-neutral-300 leading-relaxed font-light">
                    {selectedThought === idx ? thought.content : `${thought.content.slice(0, 180)}...`}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setSelectedThought(selectedThought === idx ? null : idx)}
                    className="text-xs font-mono text-teal-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {selectedThought === idx ? 'Collapse Essay' : 'Read Full Reflection →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER & CONNECT (cta.gallery + footer.design standard) */}
      <footer className="px-6 md:px-12 py-16 border-t border-white/10 bg-[#020508]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-display italic text-white mb-2">
              Let&apos;s Build Resilient Systems Together
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Savar, Dhaka, Bangladesh &bull; {MAHIM_V2_DATA.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={MAHIM_V2_DATA.github}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={MAHIM_V2_DATA.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${MAHIM_V2_DATA.email}`}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-teal-400 hover:bg-teal-300 text-[#02070a] font-semibold text-xs font-mono transition-all shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <div>&copy; {new Date().getFullYear()} {MAHIM_V2_DATA.name}. Built with Procedural Three.js & V2 Architecture.</div>
          <div className="flex items-center gap-4">
            <button onClick={onSwitchToGame} className="text-teal-400 hover:underline cursor-pointer">
              Launch 3D Game
            </button>
            <span>&bull;</span>
            <button onClick={onSwitchToForest} className="text-emerald-400 hover:underline cursor-pointer">
              3D Forest Walk
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
