import { motion } from 'framer-motion';

const stats = [
  { number: "5+", label: "Projects Built", sublabel: "Solving real-world problems." },
  { number: "10+", label: "Technologies Used", sublabel: "Mastered tools & frameworks." },
  { number: "Core", label: "Areas of Focus", sublabel: "AI Systems • Automation • Software" },
];

export default function Stats() {
  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 md:mb-24"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">Stats & Facts</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary mb-4">
            Making an <span className="font-display italic">impact</span>
          </h2>
          <p className="text-muted max-w-md">
            Delivering results that matter through design and technology.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col gap-6 ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-text-primary">
                {stat.number}
              </div>
              <div className="h-px bg-stroke w-full" />
              <div>
                <div className="text-xl md:text-2xl font-bold text-text-primary mb-2">{stat.label}</div>
                <div className="text-sm text-muted">{stat.sublabel}</div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
