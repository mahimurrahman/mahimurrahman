import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import ForestSanctuary3D from './components/ForestSanctuary3D';
import Hero from './components/Hero';
import SelectedWorks from './components/SelectedWorks';
import Journal from './components/Journal';
import Explorations from './components/Explorations';
import Stats from './components/Stats';
import Contact from './components/Contact';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'3d-forest' | 'classic-2d'>('3d-forest');

  return (
    <main className="bg-bg min-h-screen text-text-primary selection:bg-text-primary selection:text-bg">
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && viewMode === '3d-forest' && (
        <ForestSanctuary3D onSwitchToEditorial={() => setViewMode('classic-2d')} />
      )}

      {!isLoading && viewMode === 'classic-2d' && (
        <div className="relative">
          {/* Floating button to return to the 4K 3D Forest Walk */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setViewMode('3d-forest')}
              className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#041318] font-semibold text-xs md:text-sm shadow-2xl shadow-emerald-950/80 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter 4K 3D Forest Walk</span>
            </button>
          </div>

          <Hero />
          <SelectedWorks />
          <Journal />
          <Explorations />
          <Stats />
          <Contact />
        </div>
      )}
    </main>
  );
}
