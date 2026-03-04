import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

export default function Contact() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }, []);

  useEffect(() => {
    if (!marqueeRef.current) return;
    
    gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <section id="contact" className="relative bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden">
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0 opacity-50">
        <video 
          ref={videoRef}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1]"
          autoPlay 
          muted 
          loop 
          playsInline 
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-[60vh]">
        
        {/* Marquee */}
        <div className="w-full overflow-hidden py-12 md:py-20">
          <div ref={marqueeRef} className="flex whitespace-nowrap">
            {Array(10).fill("BUILDING THE FUTURE • ").map((text, i) => (
              <span key={i} className="text-5xl md:text-7xl lg:text-8xl font-display italic text-text-primary/10 px-4">
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Content */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 w-full text-center mb-16 md:mb-24">
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Have an idea, project, or collaboration in mind? I'm always open to discussions about technology, artificial intelligence, and building meaningful digital systems.
          </p>
          
          <motion.a 
            href="mailto:mahimurrahmankhan@gmail.com"
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-bg border-2 border-stroke rounded-full hover:border-transparent transition-all duration-300"
          >
            <span className="relative z-10 text-text-primary text-lg">Send me an email</span>
            <span className="relative z-10 text-xs">↗</span>
            <div className="absolute inset-0 rounded-full p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10">
               <div className="absolute inset-0 accent-gradient rounded-full" />
            </div>
          </motion.a>
        </div>

        {/* Footer Bar */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 w-full">
          <div className="border-t border-stroke pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                { name: "X (Twitter)", url: "https://x.com/MAHIMURRAHMAN01" },
                { name: "LinkedIn", url: "https://www.linkedin.com/in/mahimur-rahman-939008255/" },
                { name: "GitHub", url: "https://github.com/mahimurrahman" },
                { name: "Linktree", url: "https://linktr.ee/mahimurrahman" }
              ].map((link) => (
                <a 
                  key={link.name} 
                  href={link.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-text-primary hover:-translate-y-0.5 transition-all duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Availability / Footer */}
            <div className="flex flex-col md:items-end gap-2 text-left md:text-right mt-8 md:mt-0">
              <span className="text-sm text-text-primary font-medium">Mahimur Rahman Khan</span>
              <span className="text-sm text-muted max-w-xs">Exploring artificial intelligence, intelligent systems, and the future of technology.</span>
              <span className="text-xs text-muted/50 mt-2">© 2026 Mahimur Rahman Khan</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
