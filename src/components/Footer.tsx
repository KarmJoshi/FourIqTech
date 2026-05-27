import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/20 py-16 px-6 relative overflow-hidden bg-black/60">
      <div className="absolute inset-0 liquid-bg opacity-30 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="font-display font-bold text-2xl tracking-tight inline-block">
              <span>FOUR</span>
              <span className="text-primary glow-text">IQ</span>
              <span className="text-primary">TECH</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              FouriqTech is a global web design and custom software agency. We build bespoke SaaS platforms and high-speed web solutions configured explicitly for expansion.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Services Overview</Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog Insights</Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-foreground">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter / X</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">LinkedIn</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">GitHub</a>
              </li>
              <li>
                <span className="text-muted-foreground block text-xs">Direct: hello@fouriqtech.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 FouriqTech. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
