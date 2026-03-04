import { motion } from 'framer-motion';

const interests = [
  "Artificial Intelligence",
  "AI Agents & Automation",
  "Intelligent Software Systems",
  "Human–AI Collaboration",
  "Future of Technology",
  "Mathematics & Logical Thinking"
];

export default function Explorations() {
  return (
    <section id="interests" className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 md:mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">View Section</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4">
            Areas of <span className="font-display italic">Interest</span>
          </h2>
          <p className="text-muted max-w-md">
            Exploring the space between artificial intelligence, human potential, and profound philosophies.
          </p>
        </motion.div>

        {/* List */}
        <div className="flex flex-col">
          {interests.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group flex items-center justify-between py-6 md:py-8 border-b border-stroke hover:border-text-primary transition-colors cursor-default"
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-mono text-muted group-hover:text-accent transition-colors">
                  0{i + 1}
                </span>
                <span className="text-2xl md:text-4xl lg:text-5xl font-medium text-text-primary group-hover:translate-x-4 transition-transform duration-300">
                  {item}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-full border border-stroke flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-text-primary group-hover:text-bg transition-all duration-300 shrink-0">
                <span>→</span>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
