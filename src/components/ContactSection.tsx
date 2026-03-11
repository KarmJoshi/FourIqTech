import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, MapPin, ArrowUpRight } from 'lucide-react';

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px] liquid-blob" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Get In Touch</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            Let's Build <span className="text-gradient">Together</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Ready to transform your ideas into reality? Let <span className="font-bold text-foreground">FOUR<span className="text-primary">IQ</span>TECH</span> be your digital architect.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Liquid decoration */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/[0.05] rounded-full blur-[80px] liquid-blob" />

          <div className="grid md:grid-cols-2 gap-10 relative">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-heading font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-heading font-medium text-foreground mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your project..."
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-500 text-sm resize-none"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 flex items-center justify-center gap-2"
              >
                Send Message <ArrowUpRight size={18} />
              </motion.button>
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-6">
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-foreground">Email Us</div>
                    <div className="text-sm text-muted-foreground mt-1">hello@fouriq.tech</div>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-foreground">Location</div>
                    <div className="text-sm text-muted-foreground mt-1">Available Worldwide, Remote-First</div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-10 pt-8 border-t border-border/20">
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours. For urgent matters, reach out via email directly.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
