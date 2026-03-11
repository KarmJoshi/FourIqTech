import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="border-t border-border/20 py-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 liquid-bg opacity-50" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative">
        <div className="font-display font-bold text-lg">
          <span>FOUR</span>
          <span className="text-primary glow-text">IQ</span>
          <span className="text-primary">TECH</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 FouriqTech. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Twitter', 'GitHub', 'LinkedIn'].map((link) => (
            <motion.a
              key={link}
              href="#"
              whileHover={{ y: -3, color: 'hsl(42 85% 55%)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm font-heading text-muted-foreground transition-colors duration-300"
            >
              {link}
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}
