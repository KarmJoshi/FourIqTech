import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { LayoutGrid, Users, Code2, Layers, Smartphone, BarChart3, ArrowUpRight, CheckCircle2, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useScrollLock } from '@/components/SmoothScroll';

export default function EnterpriseUiUxDesignServices() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32">
      <SEO 
        title="Enterprise UI/UX Design Services | FouriqTech Agency" 
        description="Scale your product with premium enterprise UI/UX design services. Custom design systems, B2B SaaS UX, and high-performance web app interfaces for global brands." 
        url="https://fouriqtech.com/services/enterprise-ui-ux-design-services" 
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] liquid-blob" />
          <div className="max-w-7xl mx-auto relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
                We Build Premium <span className="text-gradient">Enterprise UI UX Design Services</span> That Drive ROI
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mt-8 mb-10">
                Transform your complex product into a seamless, high-performance experience. We partner with VPs of Product and CTOs to design intuitive, scalable digital ecosystems.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <a href="/#contact" className="py-3.5 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 flex items-center gap-2 hover:scale-[1.02]">
                  Schedule Your Strategy Call <ArrowUpRight size={18} />
                </a>
                <span className="text-sm font-medium text-muted-foreground">✦ Trusted by 50+ enterprise SaaS companies globally</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-24 px-6 bg-[#080808]">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16">Is Your Product Failing to Scale?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[ 
                { icon: LayoutGrid, title: 'Inconsistent Design', desc: 'Fragmented interfaces across modules damage user trust and slow down your development velocity.' },
                { icon: Users, title: 'Low User Retention', desc: 'Complicated UX leads to increased churn. If users can\'t navigate your value, they won\'t stay.' },
                { icon: Code2, title: 'Bloated Architecture', desc: 'A mismatch between design intent and implementation creates technical debt that kills product performance.' }
              ].map((item, i) => (
                <div key={i} className="glass-card p-8 rounded-3xl border border-white/5">
                  <item.icon size={32} className="text-primary mb-6" />
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-16">Our Premium User Interface Design Approach</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[ 
                { icon: Layers, title: 'Enterprise Design Systems', desc: 'We build scalable, atomic design systems that ensure design consistency and speed up your production cycles.' },
                { icon: Smartphone, title: 'Custom Web Application UI', desc: 'Bespoke interfaces for your specific business logic, built to look as good as they perform.' },
                { icon: BarChart3, title: 'ROI-Driven B2B SaaS UX', desc: 'We focus on user outcomes. Every pixel is placed to drive conversions, retention, and business growth.' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10">
                   <item.icon size={38} className="text-primary mb-6" />
                   <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{item.title}</h3>
                   <p className="mt-4 text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-4xl font-bold mb-16">Our Proven Delivery Process</h2>
            <div className="grid md:grid-cols-4 gap-6">
               {['Strategic Discovery', 'Rapid Prototyping', 'Design System Development', 'Implementation & Launch'].map((title, i) => (
                 <div key={i} className="space-y-4">
                    <div className="text-4xl font-bold text-primary/30">0{i+1}</div>
                    <h3 className="text-lg font-bold">{title}</h3>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-5xl font-bold mb-8">Ready to Redefine Your Digital Product?</h2>
            <p className="text-xl text-muted-foreground mb-12">Partner with a world-class design agency to align your UI with your business goals. Limited capacity for new enterprise partners this quarter.</p>
            <a href="/#contact" className="inline-flex py-4 px-10 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box">Start Your Project</a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}