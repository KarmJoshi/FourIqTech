import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, Smartphone, Cpu, RefreshCw, ShoppingCart, Gauge, Palette, ArrowUpRight } from 'lucide-react';

const services = [
  {
    icon: Code2,
    title: 'Custom SaaS Development',
    path: '/services/custom-saas-platform-development',
    description:
      'Engineering high-performance, future-proof SaaS architectures tailored precisely to your specific business logic and scaling goals.',
    index: '01',
    badge: 'Flagship'
  },
  {
    icon: Cpu,
    title: 'Enterprise Next.js Development',
    path: '/services/enterprise-nextjs-development-agency',
    description:
      'Engineering complex, SSR-enabled Next.js platforms optimized for high indexing and absolute stability.',
    index: '02',
    badge: 'Modern'
  }
];

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative bg-background py-32 px-6 lg:px-12 overflow-hidden border-t border-white/5"
    >
      {/* Delicate background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 liquid-bg opacity-20" />
        <div className="absolute top-24 right-[10%] h-80 w-80 rounded-full bg-primary/10 blur-[100px] liquid-blob" />
        <div className="absolute bottom-24 left-[10%] h-80 w-80 rounded-full bg-accent/5 blur-[100px] liquid-blob-2" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 text-xs font-heading font-medium uppercase tracking-[0.25em] text-primary">
            ✦ Technical Capabilities
          </span>
          <h2 className="mt-5 font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Our Bespoke <span className="text-gradient">Services</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
            Engineering high-performance custom websites, architectures, and mobile systems configured explicitly for your company's commercial velocity.
          </p>
        </motion.div>

        {/* 3-Column Service Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 relative z-10"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={fadeUpVariant}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 transition-all duration-500 hover:border-primary/45 hover:scale-[1.02] flex flex-col justify-between min-h-[360px]"
              >
                {/* Backplate dynamic hover gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl opacity-40 group-hover:bg-primary/20 transition-all pointer-events-none" />

                <div className="relative z-10">
                  {/* Top line with serial & badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-600 group-hover:text-primary transition-colors">
                      {service.index}
                    </span>
                    <span className="text-[9px] font-heading font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-all">
                      {service.badge}
                    </span>
                  </div>

                  {/* Tech styled Icon */}
                  <div className="mt-8 inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-4 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
                    <Icon size={28} strokeWidth={1.8} />
                  </div>

                  {/* Title & description */}
                  <h3 className="mt-6 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-500 leading-snug">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {service.description}
                  </p>
                </div>

                {/* Footer action link */}
                <div className="mt-8 relative z-10 pt-4 border-t border-white/5 text-sm font-medium text-zinc-500 group-hover:text-primary transition-all duration-500">
                  <Link to={service.path} className="w-full flex items-center justify-between">
                    <span className="group-hover:underline">Explore Service</span>
                    <ArrowUpRight size={18} className="transform transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
