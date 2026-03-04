import { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 100);
    });
  }, [scrollY]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-shadow duration-300 ${isScrolled ? 'shadow-md shadow-black/10' : ''}`}>
        
        {/* Logo */}
        <div className="group relative w-9 h-9 flex items-center justify-center cursor-pointer">
          <div className="absolute inset-0 rounded-full accent-gradient p-[1px] group-hover:rotate-180 transition-transform duration-500">
             <div className="w-full h-full bg-bg rounded-full" />
          </div>
          <div className="relative z-10 w-[calc(100%-2px)] h-[calc(100%-2px)] bg-bg rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="font-display italic text-[13px] text-text-primary">MRK</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-stroke mx-1" />

        {/* Nav Links */}
        <div className="flex items-center">
          {["Home", "Thoughts", "Interests"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors duration-200 ${item === 'Home' ? 'text-text-primary bg-stroke/50' : 'text-muted hover:text-text-primary hover:bg-stroke/50'}`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-stroke mx-1" />

        {/* Say Hi Button */}
        <a href="#contact" className="group relative inline-flex items-center justify-center rounded-full text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 overflow-hidden">
          <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ inset: '-2px' }} />
          <span className="relative z-10 flex items-center gap-1 bg-surface rounded-full px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-md text-muted group-hover:text-text-primary transition-colors duration-200">
            Say hi <span className="text-[10px]">↗</span>
          </span>
        </a>

      </div>
    </nav>
  );
}
