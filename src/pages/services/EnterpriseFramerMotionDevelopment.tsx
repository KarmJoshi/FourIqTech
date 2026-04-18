import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ArrowUpRight, AlertTriangle, Code2, ShieldAlert, Layers, Cpu, Zap, 
  CheckCircle2, ChevronDown, Gauge, Users, Target, Rocket 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';

export default function EnterpriseFramerMotionDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  
  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32">
      <SEO 
        title="Enterprise Framer Motion Development Services | FouriqTech" 
        description="Transform your web presence with high-end enterprise Framer Motion development services. We deliver premium React animation and custom UI/UX experiences." 
        url="https://fouriqtech.com/services/enterprise-framer-motion-development" 
      />
      
      <Navbar isVisible={navVisible} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-32">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 text-center">
          <div className="absolute inset-0 bg-primary/[0.03] rounded-[100px] blur-[150px] liquid-blob -z-10" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Elite Animation Engineering</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold mt-6 mb-8 tracking-tight">
              High-Performance <br />
              <span className="text-gradient">Enterprise Framer Motion Development</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              We bridge the gap between creative ambition and technical precision. Empowering global brands with premium React animation services that drive engagement, conversion, and market authority.
            </p>
            <a href="/#contact" className="inline-block">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="py-4 px-10 bg-primary text-primary-foreground font-heading font-bold rounded-xl glow-box transition-all duration-500 flex items-center justify-center gap-2 mx-auto"
              >
                Scale Your UX Today <ArrowUpRight size={20} />
              </motion.button>
            </a>
            <p className="mt-8 text-sm text-muted-foreground font-medium">Trusted by 50+ enterprise organizations across the globe</p>
          </motion.div>
        </section>

        {/* Problems Section */}
        <section className="py-24">
          <h2 className="font-display text-4xl font-bold mb-16 text-center">The Stagnation of Static Digital Experiences</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: AlertTriangle, title: "Conversion Drop-offs", desc: "Static, lifeless interfaces fail to capture attention. Your users demand immersive journeys, and without advanced motion, you are leaving engagement on the table." },
              { icon: Code2, title: "Performance Bottlenecks", desc: "Poorly implemented animations bloat your bundle size and degrade Core Web Vitals, actively hurting your SEO rankings and global reach." },
              { icon: ShieldAlert, title: "Lack of Differentiation", desc: "In a saturated market, generic templates are invisible. You need a custom Framer Motion agency that understands how to translate your unique brand DNA into interactive code." }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 hover:border-primary/45 transition-all">
                <item.icon className="text-primary mb-6" size={40} />
                <h3 className="font-display text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-24">
          <h2 className="font-display text-4xl font-bold mb-16 text-center">Advanced Animation Web Development at Scale</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Layers, title: "Seamless Motion Orchestration", desc: "We specialize in complex Framer Motion consulting for enterprises, crafting smooth, hardware-accelerated transitions that feel native and infinitely polished." },
              { icon: Cpu, title: "Optimized Interaction Logic", desc: "Leveraging premium React animation services, we ensure that every interaction is not just beautiful, but optimized for performance-critical enterprise web applications." },
              { icon: Zap, title: "ROI-Driven UX Systems", desc: "Our animations serve a purpose. We design purposeful, high-end UI/UX that guides users through your conversion funnel, directly impacting your bottom line." }
            ].map((item, i) => (
              <div key={i} className="glass-modern p-10 rounded-3xl border border-white/10">
                <item.icon className="text-accent mb-6" size={40} />
                <h3 className="font-display text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24">
          <h2 className="font-display text-4xl font-bold mb-16">Our Precision Delivery Framework</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { step: "01", title: "Discovery & Strategy", text: "We analyze your user flow and animation requirements to define the technical scope for your enterprise application." },
              { step: "02", title: "Prototyping & Motion Design", text: "Iterative design cycles where we prove our concepts through high-fidelity, interactive prototypes." },
              { step: "03", title: "Development & Integration", text: "Building with pixel-perfect precision using Framer Motion and GSAP, integrated seamlessly into your architecture." },
              { step: "04", title: "Performance Optimization", text: "Rigorous testing of animation frame rates and code-splitting to ensure flawless performance on all devices." }
            ].map((step, i) => (
              <div key={i} className="flex gap-6 border-b border-white/5 pb-8">
                <div className="text-primary font-display text-4xl font-black opacity-40">{step.step}</div>
                <div>
                  <h4 className="font-bold text-xl mb-2">{step.title}</h4>
                  <p className="text-muted-foreground">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-24 text-center">
          <h2 className="font-display text-4xl font-bold mb-12">The Modern Animation Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Framer Motion", "GSAP", "React", "Next.js", "TypeScript", "WebGL", "Three.js", "Tailwind CSS"].map(tech => (
              <span key={tech} className="px-6 py-3 rounded-full border border-primary/20 bg-primary/5 text-primary font-heading uppercase tracking-widest text-sm">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How does Framer Motion affect my site speed?", a: "When implemented correctly by specialists, it has zero negative impact. We use optimization techniques like lazy loading, code-splitting, and hardware-accelerated transforms." },
              { q: "Do you offer Framer Motion consulting for enterprises?", a: "Yes. We offer specialized consulting to train your team or architect complex animation systems that align with enterprise-scale codebases." },
              { q: "Why choose FouriqTech over a standard web agency?", a: "We focus exclusively on high-end, bespoke solutions. Our mastery of advanced animation and performance architecture ensures you get a product that is both stunning and fast." }
            ].map((faq, i) => (
              <details key={i} className="group border border-white/10 rounded-2xl bg-muted/30">
                <summary className="p-8 cursor-pointer font-bold flex justify-between items-center text-lg">
                  {faq.q}
                  <ChevronDown className="group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-8 pb-8 text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 rounded-[3rem] bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 text-center px-6 mt-12">
          <h2 className="font-display text-5xl font-bold mb-6">Ready to Define Your Digital Presence?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Stop settling for standard interactions. Partner with FouriqTech to lead your industry with world-class, enterprise-grade animation experiences.</p>
          <a href="/#contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="py-4 px-12 bg-primary text-primary-foreground font-bold rounded-2xl glow-box"
            >
              Schedule Your Strategic Consultation
            </motion.button>
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}