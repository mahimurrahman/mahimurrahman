import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import Hero from './components/Hero';
import Journal from './components/Journal';
import Explorations from './components/Explorations';
import Stats from './components/Stats';
import Contact from './components/Contact';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="bg-bg min-h-screen text-text-primary selection:bg-text-primary selection:text-bg">
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Hero />
          <Journal />
          <Explorations />
          <Stats />
          <Contact />
        </>
      )}
    </main>
  );
}
