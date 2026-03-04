import { motion } from 'framer-motion';

const projects = [
  { slug: "automotive-motion", title: "Automotive Motion", image: "https://picsum.photos/seed/wireframe/800/600", gradient: "from-violet-500 via-fuchsia-400/60 via-indigo-500/60 to-transparent", colSpan: "md:col-span-7" },
  { slug: "urban-architecture", title: "Urban Architecture", image: "https://picsum.photos/seed/building/800/600", gradient: "from-sky-500 via-blue-400/60 to-transparent", colSpan: "md:col-span-5" },
  { slug: "human-perspective", title: "Human Perspective", image: "https://picsum.photos/seed/person/800/600", gradient: "from-emerald-500 via-emerald-300/60 via-teal-500/60 to-transparent", colSpan: "md:col-span-5" },
  { slug: "brand-identity", title: "Brand Identity", image: "https://picsum.photos/seed/branding/800/600", gradient: "from-amber-500 via-amber-300/60 via-orange-500/60 to-transparent", colSpan: "md:col-span-7" },
];

export default function SelectedWorks() {
  return (
    <section id="work" className="bg-bg py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16"
        >
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Selected Work</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4">
              Featured <span className="font-display italic">projects</span>
            </h2>
            <p className="text-muted max-w-md">
              A selection of projects I've worked on, from concept to launch.
            </p>
          </div>
          
          <button className="hidden md:inline-flex group items-center gap-2 text-sm text-text-primary px-6 py-3 rounded-full border border-stroke hover:border-transparent relative overflow-hidden transition-all duration-300">
            <span className="relative z-10 flex items-center gap-2">
              View all work <span>→</span>
            </span>
            <div className="absolute inset-0 rounded-full p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
               <div className="absolute inset-0 accent-gradient rounded-full" />
               <div className="absolute inset-[1px] bg-bg rounded-full" />
            </div>
          </button>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`group relative bg-surface border border-stroke rounded-3xl overflow-hidden aspect-[4/3] md:aspect-auto ${project.colSpan} md:h-[500px] cursor-pointer`}
            >
              {/* Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                {/* Halftone Overlay */}
                <div 
                  className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '4px 4px' }}
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 backdrop-blur-lg transition-all duration-500 flex items-center justify-center z-10">
                <div className="relative px-6 py-3 bg-text-primary text-bg rounded-full overflow-hidden">
                  <div className="absolute inset-0 p-[1px] accent-gradient rounded-full animate-gradient-shift opacity-50" />
                  <span className="relative z-10 text-sm font-medium">
                    View — <span className="font-display italic">{project.title}</span>
                  </span>
                </div>
              </div>
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-30 mix-blend-overlay pointer-events-none`} />

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
