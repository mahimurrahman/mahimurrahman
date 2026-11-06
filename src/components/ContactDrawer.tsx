import { useState, useRef, MouseEvent } from 'react';
import { MAHIM_PROFILE } from '../data/portfolioData';
import {
  Mail,
  Copy,
  Check,
  X,
  Send,
  Terminal,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLLAB_TOPICS = [
  {
    id: 'ai-systems',
    label: 'AI Systems & Agents',
    subject: 'Collaboration: AI Systems & Autonomous Workflows',
    body: 'Hi Mahimur,\n\nI was exploring your 3D sanctuary portfolio and wanted to discuss a project involving autonomous AI agents and intelligent systems architecture.\n\nBest regards,'
  },
  {
    id: 'reverse-eng',
    label: 'Reverse Engineering & REA',
    subject: 'Inquiry: Reverse Engineering Architecture & Tools',
    body: 'Hi Mahimur,\n\nI reviewed your synthesis of REA (morluto/rea) and wanted to connect regarding deep binary inspection, MCP tooling, or systems reverse engineering.\n\nBest regards,'
  },
  {
    id: 'mathematics',
    label: 'Mathematics & Logic',
    subject: 'Discussion: Mathematical Foundations & Modeling',
    body: 'Hi Mahimur,\n\nI came across your work in mathematics and computing and would love to exchange ideas on formal reasoning and algorithmic proof structures.\n\nBest regards,'
  },
  {
    id: 'general',
    label: 'General Inquiry / Say Hi',
    subject: 'Connecting from your 3D Portfolio Sanctuary',
    body: 'Hi Mahimur,\n\nJust wanted to reach out after walking through your 3D forest portfolio. Impressive work!\n\nBest regards,'
  }
];

export default function ContactDrawer({ isOpen, onClose }: ContactDrawerProps) {
  const [selectedTopic, setSelectedTopic] = useState(COLLAB_TOPICS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (!isOpen) return null;

  const mailtoHref = `mailto:${MAHIM_PROFILE.email}?subject=${encodeURIComponent(
    selectedTopic.subject
  )}&body=${encodeURIComponent(selectedTopic.body)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Magnetic Spotlight Container (cta.gallery style) */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative z-10 max-w-2xl w-full bg-[#051318] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden font-sans text-cream"
        style={{
          boxShadow: '0 0 50px -10px rgba(16, 185, 129, 0.15)'
        }}
      >
        {/* Dynamic Spotlight Glow tracking mouse */}
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(45, 212, 191, 0.18), transparent 40%)`
          }}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-400 text-[#041318]">
              DIRECT TOUCHPOINT
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              CTA.Gallery Standard
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-2xl sm:text-4xl font-display italic text-white mb-2">
          Let's Build Something Meaningful Together
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
          Whether you have an inquiry regarding autonomous AI systems, deep binary reverse engineering,
          or mathematical architectures, select a focus area below to launch your message.
        </p>

        {/* Topic Selector Pills */}
        <div className="mb-6">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2.5">
            Select Inquiry Focus:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COLLAB_TOPICS.map((topic) => {
              const isSelected = topic.id === selectedTopic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3 rounded-2xl text-left border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 text-white font-medium shadow-sm'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{topic.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Open Email vs Copy Email */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={mailtoHref}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#041318] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Launch Email Client Now</span>
          </a>

          <button
            onClick={() => handleCopy(MAHIM_PROFILE.email, 'email')}
            className="py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copiedKey === 'email' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copied {MAHIM_PROFILE.email}!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Email</span>
              </>
            )}
          </button>
        </div>

        {/* Terminal Quick-Runners (Styles.refero.design & CTA.gallery style) */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Quick Terminal Launchers
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Click to copy</span>
          </div>

          <div
            onClick={() => handleCopy('npx rea-agents setup', 'npx')}
            className="group flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/10 hover:border-teal-400/40 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-teal-400 select-none">$</span>
              <span className="truncate">npx rea-agents setup</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 group-hover:text-teal-300 shrink-0 ml-2">
              {copiedKey === 'npx' ? 'Copied!' : 'Copy'}
            </span>
          </div>

          <div
            onClick={() =>
              handleCopy(
                'git clone -b v3-3d-forest https://github.com/mahimurrahman/mahimurrahman.git',
                'git'
              )
            }
            className="group flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/10 hover:border-emerald-400/40 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-emerald-400 select-none">$</span>
              <span className="truncate">
                git clone -b v3-3d-forest https://github.com/mahimurrahman/mahimurrahman.git
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 group-hover:text-emerald-300 shrink-0 ml-2">
              {copiedKey === 'git' ? 'Copied!' : 'Copy'}
            </span>
          </div>
        </div>

        {/* Social Link Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={MAHIM_PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={MAHIM_PROFILE.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={MAHIM_PROFILE.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>X / Twitter</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] text-emerald-400/80">
            Responds within 24 hours &bull; Savar, Dhaka
          </div>
        </div>
      </div>
    </div>
  );
}
