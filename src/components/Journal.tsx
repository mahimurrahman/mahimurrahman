import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const journals = [
  { title: "The Future of Human + AI Collaboration", excerpt: "Artificial intelligence is often described as a replacement for human work. In reality, the most powerful future is not humans versus machines, but humans working alongside intelligent systems. AI models can process enormous amounts of information and generate ideas at incredible speed. Humans bring context, judgment, ethics, and creativity.", image: "https://picsum.photos/seed/ai_collab/100/100", readTime: "5 min read", date: "Recent" },
  { title: "Why APIs Are the Infrastructure of Modern AI", excerpt: "Modern artificial intelligence does not exist in isolation. Most powerful systems today are built by connecting multiple services together. APIs allow developers to combine different technologies into one working system.", image: "https://picsum.photos/seed/api_infra/100/100", readTime: "4 min read", date: "Recent" },
  { title: "Building Systems Instead of Just Software", excerpt: "Traditional programming focused on writing individual pieces of software. Today the challenge is different. The most valuable digital products are no longer single programs. They are systems composed of multiple components: data pipelines, AI models, APIs, automation tools, and user interfaces.", image: "https://picsum.photos/seed/system_b/100/100", readTime: "6 min read", date: "Recent" },
  { title: "The Intelligence Layer of the Internet", excerpt: "For decades the internet connected information. Now artificial intelligence is becoming a new layer on top of that infrastructure. Instead of only accessing information, machines are beginning to interpret, summarize, generate, and reason about it.", image: "https://picsum.photos/seed/int_layer/100/100", readTime: "7 min read", date: "Recent" },
];

export default function Journal() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="thoughts" className="bg-bg py-16 md:py-24">
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
              <span className="text-xs text-muted uppercase tracking-[0.3em]">Recent Thoughts</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4">
              Recent <span className="font-display italic">thoughts</span>
            </h2>
            <p className="text-muted max-w-md">
              A collection of ideas and reflections on artificial intelligence, technology, and the future of intelligent systems.
            </p>
          </div>
          
          <button className="hidden md:inline-flex group items-center gap-2 text-sm text-text-primary px-6 py-3 rounded-full border border-stroke hover:border-transparent relative overflow-hidden transition-all duration-300">
            <span className="relative z-10 flex items-center gap-2">
              View all <span>→</span>
            </span>
            <div className="absolute inset-0 rounded-full p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
               <div className="absolute inset-0 accent-gradient rounded-full" />
               <div className="absolute inset-[1px] bg-bg rounded-full" />
            </div>
          </button>
        </motion.div>

        {/* Journal Entries */}
        <div className="flex flex-col gap-4">
          {journals.map((entry, i) => {
            const isExpanded = expandedIndex === i;
            
            return (
            <motion.div
              key={entry.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`group flex flex-col md:flex-row items-center gap-6 p-4 bg-surface/30 hover:bg-surface border border-stroke transition-all duration-300 cursor-pointer ${isExpanded ? 'rounded-[40px]' : 'rounded-[40px] sm:rounded-full'}`}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
            >
              {/* Image */}
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden border border-stroke group-hover:border-accent transition-colors duration-300 shrink-0">
                <img 
                  src={entry.image} 
                  alt={entry.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Excerpt */}
              <div className="flex-1 text-center md:text-left flex flex-col justify-center">
                <h3 className="text-lg md:text-2xl font-medium text-text-primary group-hover:translate-x-1 transition-transform duration-300">
                  {entry.title}
                </h3>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted mt-3 text-left">
                        {entry.excerpt}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dotted Line */}
              <div className="hidden md:block flex-grow border-b border-dotted border-stroke/50 h-px" />

              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-muted shrink-0">
                <span>{entry.readTime}</span>
                <span className="w-1 h-1 bg-muted rounded-full" />
                <span>{entry.date}</span>
              </div>

              {/* Arrow Circle */}
              <div className={`w-10 h-10 rounded-full border border-stroke flex items-center justify-center transition-all duration-300 shrink-0 ${isExpanded ? 'bg-text-primary text-bg rotate-90' : 'group-hover:bg-text-primary group-hover:text-bg'}`}>
                <span>→</span>
              </div>

            </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
