import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { gsap } from 'gsap';
import Navbar from './Navbar';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const roles = ["AI Systems Builder", "Mathematics Student", "Technologist"];

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
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.fromTo(".name-reveal", 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      );

      tl.fromTo(".blur-in",
        { opacity: 0, filter: "blur(10px)", y: 20 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1, delay: 0.3 },
        "-=0.8"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={containerRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <Navbar />
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
          autoPlay 
          muted 
          loop 
          playsInline 
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <div className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8">
          PORTFOLIO '26
        </div>
        
        <h1 className="name-reveal text-5xl md:text-7xl lg:text-8xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
          Mahimur Rahman Khan
        </h1>

        <div className="blur-in text-xl md:text-2xl text-muted mb-6 flex flex-col items-center">
          <div className="mb-2">
            An <span key={roleIndex} className="font-display italic text-text-primary animate-role-fade-in inline-block min-w-[200px] text-center">{roles[roleIndex]}</span>
          </div>
          <div>based in Bangladesh.</div>
        </div>

        <p className="blur-in text-sm md:text-base text-muted max-w-md mb-8 leading-relaxed">
          Mahimur Rahman Khan is a technologist focused on Mathematics, artificial intelligence, intelligent systems, and software development.
        </p>

        <div className="blur-in flex flex-col sm:flex-row gap-4 items-center mb-12">
          {/* See Works Button */}
          <button className="group relative rounded-full text-sm px-7 py-3.5 bg-text-primary text-bg hover:bg-bg hover:text-text-primary transition-colors duration-300 hover:scale-105 overflow-hidden">
            <span className="relative z-10">View Work</span>
            <span className="absolute inset-0 rounded-full p-[1px] accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="block w-full h-full bg-bg rounded-full" />
            </span>
          </button>

          {/* Reach Out Button */}
          <button className="group relative rounded-full text-sm px-7 py-3.5 bg-bg text-text-primary border-2 border-stroke hover:border-transparent transition-all duration-300 hover:scale-105 overflow-hidden">
            <span className="relative z-10">Contact Me</span>
            <span className="absolute inset-0 rounded-full p-[2px] accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pb-8 z-10">
        <span className="text-xs text-muted uppercase tracking-[0.2em]">SCROLL</span>
        <div className="w-px h-10 bg-stroke relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-text-primary animate-scroll-down" />
        </div>
      </div>
    </section>
  );
}
