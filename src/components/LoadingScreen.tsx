import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const words = ["Design", "Create", "Inspire"];
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 2700;

    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      const timeElapsed = time - startTimeRef.current;
      const progress = Math.min(timeElapsed / duration, 1);
      
      setCount(Math.floor(progress * 100));

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(onComplete, 400);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 900);

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(wordInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-8 md:p-12"
    >
      {/* Top Left Label */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xs text-muted uppercase tracking-[0.3em]"
      >
        Portfolio
      </motion.div>

      {/* Center Rotating Words */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center items-center">
        <div className="relative h-20 md:h-32 w-full overflow-hidden flex justify-center items-center">
             <AnimatePresence mode="wait">
              <motion.div
                key={words[wordIndex]}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80 absolute"
              >
                {words[wordIndex]}
              </motion.div>
            </AnimatePresence>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-end w-full">
        {/* Counter */}
        <div className="text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums mb-4">
          {String(count).padStart(3, "0")}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[3px] bg-stroke/50 relative overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 h-full w-full accent-gradient origin-left"
            style={{ scaleX: count / 100, boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
