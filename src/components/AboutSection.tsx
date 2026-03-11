import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Lightbulb, Rocket, Handshake, Globe } from 'lucide-react';

const highlights = [
  { icon: Lightbulb, title: 'Visionary Strategy', desc: 'Transforming ideas into scalable digital realities.' },
  { icon: Rocket, title: 'Rapid Execution', desc: 'Deploying market-ready solutions with speed and precision.' },
  { icon: Handshake, title: 'Partnership First', desc: 'Your long-term ally in digital growth and innovation.' },
  { icon: Globe, title: 'Global Standards', desc: 'World-class development practices for every project.' },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="relative py-32 px-6">
      {/* Liquid background blobs */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] liquid-blob bg-primary/[0.03] blur-[60px]" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] liquid-blob-2 bg-accent/[0.03] blur-[50px]" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform' }}
          >
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Who We Are</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              Your Partner in <br /><span className="text-gradient">Digital Evolution</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We are more than just developers; we are architects of the future.
              Our mission is to empower businesses with cutting-edge technology that drives real growth.
              We bridge the gap between complex technical challenges and intuitive, user-centric solutions.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              From ambitious startups to established enterprises, we provide the technical expertise and strategic insight needed to dominate your market.
              We don't just build websites; we build engines for your success.
            </p>

            <div className="glass-card rounded-2xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {highlights.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.03 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors duration-300">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-sm text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
              {/* Liquid decorative elements */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full blur-[40px] liquid-blob" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-accent/8 rounded-full blur-[30px] liquid-blob-2" />

              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <motion.div animate={{ backgroundColor: ['hsl(42, 85%, 55%)', 'hsl(42, 85%, 65%)', 'hsl(42, 85%, 55%)'] }} transition={{ duration: 3, repeat: Infinity }} className="w-3 h-3 rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                {/* Code snippet visual */}
                <div className="font-mono text-[10px] xs:text-xs sm:text-sm space-y-2 overflow-x-auto custom-scrollbar pb-2">
                  <div>
                    <span className="text-primary">const</span>{' '}
                    <span className="text-gold-light">success</span>{' '}
                    <span className="text-muted-foreground">=</span>{' '}
                    <span className="text-primary">{'{'}</span>
                  </div>
                  <div className="pl-4 sm:pl-6">
                    <span className="text-foreground">strategy</span>
                    <span className="text-muted-foreground">:</span>{' '}
                    <span className="text-green-400">'Data-Driven'</span>
                    <span className="text-muted-foreground">,</span>
                  </div>
                  <div className="pl-4 sm:pl-6">
                    <span className="text-foreground">execution</span>
                    <span className="text-muted-foreground">:</span>{' '}
                    <span className="text-primary">['Flawless', 'Scalable']</span>
                    <span className="text-muted-foreground">,</span>
                  </div>
                  <div className="pl-4 sm:pl-6">
                    <span className="text-foreground">impact</span>
                    <span className="text-muted-foreground">:</span>{' '}
                    <span className="text-primary">Maximum</span>
                    <span className="text-muted-foreground">,</span>
                  </div>
                  <div className="pl-4 sm:pl-6">
                    <span className="text-foreground">partners</span>
                    <span className="text-muted-foreground">:</span>{' '}
                    <span className="text-green-400">'You + Us'</span>
                  </div>
                  <div>
                    <span className="text-primary">{'}'}</span>
                    <span className="text-muted-foreground">;</span>
                  </div>
                </div>

                {/* Tech stack pills */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {['Digital Strategy', 'Custom Development', 'UI/UX Design', 'Cloud Solutions', 'AI & ML', 'Enterprise Scale'].map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                      whileHover={{ scale: 1.08, borderColor: 'hsl(42 85% 55% / 0.3)' }}
                      className="px-3 py-1.5 text-xs font-heading font-medium rounded-lg bg-muted/50 text-muted-foreground border border-border/50 transition-all duration-300 cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
