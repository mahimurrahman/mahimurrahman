import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import CyberCitadelGame from './components/CyberCitadelGame';
import ForestSanctuary3D from './components/ForestSanctuary3D';
import V2EditorialDossier from './components/V2EditorialDossier';
import { Gamepad2, Sparkles } from 'lucide-react';

export type PortfolioViewMode = '3d-game' | '3d-forest' | 'v2-dossier';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<PortfolioViewMode>('3d-game');

  return (
    <main className="bg-[#02070a] min-h-screen text-neutral-200 selection:bg-teal-400 selection:text-black">
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && viewMode === '3d-game' && (
        <CyberCitadelGame
          onSwitchToForest={() => setViewMode('3d-forest')}
          onSwitchToDossier={() => setViewMode('v2-dossier')}
        />
      )}

      {!isLoading && viewMode === '3d-forest' && (
        <ForestSanctuary3D
          onSwitchToGame={() => setViewMode('3d-game')}
          onSwitchToEditorial={() => setViewMode('v2-dossier')}
        />
      )}

      {!isLoading && viewMode === 'v2-dossier' && (
        <div className="relative">
          {/* Quick Floating Switchers back to 3D Game / 3D Forest */}
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5">
            <button
              onClick={() => setViewMode('3d-game')}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-teal-400 hover:bg-teal-300 text-[#02070a] font-semibold text-xs md:text-sm shadow-2xl shadow-teal-950/80 transition-all hover:scale-105 cursor-pointer font-mono"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Launch 3D Game</span>
            </button>
            <button
              onClick={() => setViewMode('3d-forest')}
              className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-semibold text-xs md:text-sm shadow-2xl backdrop-blur-xl transition-all hover:scale-105 cursor-pointer font-mono"
            >
              <Sparkles className="w-4 h-4" />
              <span>3D Forest</span>
            </button>
          </div>

          <V2EditorialDossier
            onSwitchToGame={() => setViewMode('3d-game')}
            onSwitchToForest={() => setViewMode('3d-forest')}
          />
        </div>
      )}
    </main>
  );
}
