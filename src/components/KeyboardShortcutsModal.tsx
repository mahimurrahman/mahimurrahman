import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    category: 'Spatial Movement & Navigation',
    items: [
      { keys: ['W', 'A', 'S', 'D'], desc: 'Walk forward, backward, or strafe along forest trail' },
      { keys: ['↑', '←', '↓', '→'], desc: 'Alternative directional arrow walking keys' },
      { keys: ['Shift'], desc: 'Hold while walking to sprint through sanctuary' },
      { keys: ['Scroll'], desc: 'Scrub & glide forward / backward smoothly' },
      { keys: ['Drag'], desc: 'Click & drag mouse to look around in 360°' }
    ]
  },
  {
    category: 'Shrine Teleportation',
    items: [
      { keys: ['1'], desc: 'Jump to Shrine 01: The Sanctuary Gate' },
      { keys: ['2'], desc: 'Jump to Shrine 02: REA Reverse Engineering Citadel' },
      { keys: ['3'], desc: 'Jump to Shrine 03: Garden of Selected Works' },
      { keys: ['4'], desc: 'Jump to Shrine 04: Grove of Six Pillars' },
      { keys: ['5'], desc: 'Jump to Shrine 05: Pond of Reflections' },
      { keys: ['6'], desc: 'Jump to Shrine 06: The Horizon Portal' }
    ]
  },
  {
    category: 'Sanctuary Environment & Toggles',
    items: [
      { keys: ['Space'], desc: 'Toggle cinematic Auto-Walk stroll' },
      { keys: ['M'], desc: 'Mute / unmute procedural forest soundscape' },
      { keys: ['C'], desc: 'Switch camera: 3rd-person avatar vs 1st-person view' },
      { keys: ['F'], desc: 'Open Architectural Footer (footer.design)' },
      { keys: ['?'], desc: 'Open / close this keyboard shortcuts guide' }
    ]
  }
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 max-w-2xl w-full bg-[#051419] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl font-sans text-cream">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-display italic text-white">
              Keyboard & Navigation Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-mono uppercase tracking-widest text-emerald-400/90 mb-3">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
                  >
                    <span className="text-neutral-300">{item.desc}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2.5 py-1 rounded-lg bg-black/70 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Tip: Press ESC anytime to close active overlays</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-emerald-400 text-[#041318] font-semibold hover:bg-emerald-300 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
