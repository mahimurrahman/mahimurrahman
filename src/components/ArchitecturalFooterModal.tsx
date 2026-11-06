import { useEffect, useState } from 'react';
import { MAHIM_PROFILE, FOREST_WAYPOINTS, WaypointNode } from '../data/portfolioData';
import {
  Compass,
  ExternalLink,
  Mail,
  Copy,
  Check,
  X,
  ArrowUpRight,
  Terminal,
  Footprints,
  Sparkles
} from 'lucide-react';

interface ArchitecturalFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeleportToWaypoint: (wp: WaypointNode) => void;
  onOpenReaModal: () => void;
}

export default function ArchitecturalFooterModal({
  isOpen,
  onClose,
  onTeleportToWaypoint,
  onOpenReaModal
}: ArchitecturalFooterModalProps) {
  const [dhakaTime, setDhakaTime] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(new Date());
        setDhakaTime(timeStr);
      } catch {
        setDhakaTime('Dhaka Local Time');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-h-[92vh] overflow-y-auto bg-[#040e12] border-t border-emerald-500/30 rounded-t-[36px] p-6 sm:p-10 md:p-14 shadow-2xl text-cream font-sans">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase text-emerald-300">
              Architectural Dossier &bull; Footer.Design Standard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onTeleportToWaypoint(FOREST_WAYPOINTS[0])}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all cursor-pointer"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Rewind to Sanctuary Gate</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Footer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Monumental Typographic Headline (footer.design style) */}
        <div className="relative mb-12">
          <div className="text-[9vw] sm:text-[7.5vw] font-display italic leading-none tracking-tight text-white/90 select-none">
            Mahimur Rahman Khan
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm font-mono text-neutral-400 border-b border-white/10 pb-8">
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>23.8341&deg; N, 90.2588&deg; E &bull; Savar, Dhaka, Bangladesh</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-300 font-semibold">{dhakaTime} GMT+6</span>
              <span className="opacity-40">&bull;</span>
              <span className="text-emerald-400/90 font-medium">Open for Systems Collaborations</span>
            </div>
          </div>
        </div>

        {/* 4-Column Architectural Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-14 text-sm">
          {/* Column 01: Reverse Engineering & Core Systems */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>01 &bull; Reverse Engineering</span>
            </div>
            <ul className="space-y-3 text-neutral-300 text-xs md:text-sm">
              <li>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReaModal();
                  }}
                  className="group flex items-center gap-1.5 hover:text-emerald-300 transition-colors text-left cursor-pointer"
                >
                  <span className="font-semibold text-white group-hover:text-emerald-300">
                    REA Citadel Architecture
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </button>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  MCP protocol, Hopper & Ghidra bridges
                </p>
              </li>
              <li>
                <a
                  href="https://github.com/morluto/rea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
                >
                  <span>morluto/rea (rea-agents)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <span className="text-white">Evidence Ledger & Provenance</span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Obs &bull; Deriv &bull; Infer &bull; Unknowns
                </p>
              </li>
              <li>
                <span className="text-white">RL AgentEnv Automation</span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  HAR recordings to training environments
                </p>
              </li>
            </ul>
          </div>

          {/* Column 02: 3D Sanctuary Waypoints */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>02 &bull; 3D Sanctuary Trail</span>
            </div>
            <ul className="space-y-2.5 text-xs md:text-sm">
              {FOREST_WAYPOINTS.map((wp) => (
                <li key={wp.id}>
                  <button
                    onClick={() => {
                      onClose();
                      onTeleportToWaypoint(wp);
                    }}
                    className="group flex items-center justify-between w-full hover:text-emerald-300 text-neutral-300 transition-colors cursor-pointer py-0.5"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] text-emerald-400/80">{wp.number}</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        {wp.title}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">
                      Walk &rarr;
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 03: Selected Thoughts & Research */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>03 &bull; Philosophical Dispatches</span>
            </div>
            <ul className="space-y-3 text-neutral-300 text-xs md:text-sm">
              <li>
                <span className="text-white font-medium">Human + AI Cognitive Symbiosis</span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Models as computational lenses, not substitutes
                </p>
              </li>
              <li>
                <span className="text-white font-medium">APIs as Sensory & Motor Nerves</span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Connecting probabilistic models to external state
                </p>
              </li>
              <li>
                <span className="text-white font-medium">Systems Over Isolated Software</span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Managing feedback loops & emergent complexity
                </p>
              </li>
              <li>
                <span className="text-white font-medium">Sovereign Intelligence Layer</span>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  The third evolutionary era of the internet
                </p>
              </li>
            </ul>
          </div>

          {/* Column 04: Contact & Social Presence */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>04 &bull; Direct Touchpoints</span>
            </div>
            <ul className="space-y-3 text-neutral-300 text-xs md:text-sm">
              <li>
                <a
                  href={`mailto:${MAHIM_PROFILE.email}`}
                  className="group flex items-center gap-1.5 text-white hover:text-emerald-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">{MAHIM_PROFILE.email}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => handleCopy(MAHIM_PROFILE.email, 'Email address')}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedText === 'Email address' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Copied to clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy email address</span>
                    </>
                  )}
                </button>
              </li>
              <li>
                <a
                  href={MAHIM_PROFILE.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-neutral-300 hover:text-white transition-colors py-1"
                >
                  <span>GitHub (@mahimurrahman)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={MAHIM_PROFILE.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-neutral-300 hover:text-white transition-colors py-1"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={MAHIM_PROFILE.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-neutral-300 hover:text-white transition-colors py-1"
                >
                  <span>X / Twitter (@MAHIMURRAHMAN01)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href={MAHIM_PROFILE.links.linktree}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-neutral-300 hover:text-white transition-colors py-1"
                >
                  <span>Linktree Portal</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Baseline Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <div>
            &copy; {new Date().getFullYear()} Mahimur Rahman Khan &bull; All Rights Reserved
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopy(`git clone ${window.location.origin}`, 'Git repo')}
              className="hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Branch: v3-3d-forest</span>
            </button>
            <span className="opacity-40">&bull;</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-emerald-400 text-[#041318] font-semibold hover:bg-emerald-300 transition-all cursor-pointer"
            >
              Return to 3D Walk &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
