import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, CloudOff, ShieldOff, Layers, Gauge, Cloud, Shield, Code2, Palette, ChevronDown } from 'lucide-react';

export default function CustomSaasPlatformDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const HeroSection = () => {
    return (
      <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden">
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px] liquid-blob" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant}>
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] inline-block mb-4">
              ✦ Custom SaaS Platform Development Services
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
              Innovate & Scale with FouriqTech's Bespoke <span className="text-gradient">Custom SaaS Platform Development Services</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Struggling with off-the-shelf limitations or legacy systems? We engineer high-performance, future-proof SaaS solutions tailored precisely to your unique business logic and ambitious growth goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/#contact">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 flex items-center justify-center gap-2"
                >
                  Get a Free Consultation <ArrowUpRight size={18} />
                </motion.button>
              </a>
            </div>
            <p className="mt-8 text-sm text-muted-foreground font-heading uppercase tracking-widest">
              Trusted by 50+ global enterprises and innovative startups
            </p>
          </motion.div>
        </div>
      </section>
    );
  };

  const ProblemSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const icons = { CloudOff, ShieldOff, Layers, Gauge };

    const problems = [
      { icon: "CloudOff", title: "Scalability Roadblocks", description: "Generic platforms often buckle under growth, leading to performance issues and expensive refactoring down the line. We address scalable web application development for startups from day one." },
      { icon: "ShieldOff", title: "Security Vulnerabilities", description: "Inadequate security measures in non-custom solutions expose your data and users to significant risks, damaging trust and your brand reputation." },
      { icon: "Layers", title: "Feature Mismatch", description: "Off-the-shelf software rarely aligns perfectly with complex business processes, forcing compromises that hinder efficiency and user experience." },
      { icon: "Gauge", title: "Slow Time-to-Market", description: "Delays in development can cost you market share. You need a bespoke SaaS platform agency that prioritizes agile delivery without sacrificing quality." }
    ];

    return (
      <section className="relative py-24 px-6 lg:px-12 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold">The Challenges of <span className="text-gradient">Modern SaaS Development</span></h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((prob, i) => {
              const Icon = icons[prob.icon as keyof typeof icons] || CloudOff;
              return (
                <motion.div key={i} variants={fadeUpVariant} className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-4 text-zinc-400 mb-6">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{prob.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{prob.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  const SolutionSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const icons = { Cloud, Shield, Code2, Palette };

    const solutions = [
      { icon: "Cloud", title: "Scalable & Future-Proof Architecture", description: "We build custom SaaS platforms designed for exponential growth, ensuring seamless performance from your first user to your millionth. Our enterprise SaaS solutions development prioritizes efficiency and adaptability." },
      { icon: "Shield", title: "Fortified Security & Compliance", description: "Security is baked into every layer of your custom SaaS platform. We implement robust protocols and best practices to protect your data and ensure regulatory compliance." },
      { icon: "Code2", title: "Precision-Engineered Business Logic", description: "No compromises. We meticulously craft every feature to match your exact operational needs, delivering intuitive workflows and unparalleled efficiency for your unique custom SaaS platform development services." },
      { icon: "Palette", title: "Exceptional UI/UX & Brand Experience", description: "Beyond functionality, we create captivating user experiences with luxury UI/UX design and modern animations, ensuring your SaaS product development company delivers an intuitive and delightful journey." }
    ];

    return (
      <section className="relative py-32 px-6 lg:px-12">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px] liquid-blob translate-y(-50%)" />
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ The FouriqTech Approach</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">Your Partner for <span className="text-gradient">Unrivaled SaaS Platforms</span></h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 gap-8">
            {solutions.map((sol, i) => {
              const Icon = icons[sol.icon as keyof typeof icons] || Code2;
              return (
                <motion.div key={i} variants={fadeUpVariant} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 transition-[border-color,transform] duration-500 hover:border-primary/45">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-2xl opacity-40" />
                  
                  <div className="relative z-10">
                    <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-5 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
                      <Icon size={32} strokeWidth={1.6} />
                    </div>
                    <h3 className="mt-8 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                      {sol.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      {sol.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  };

  const ProcessSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    
    const steps = [
      { step: 1, title: "Discovery & Strategy", description: "We dive deep into your vision, market, and business goals to define clear requirements and a strategic roadmap for your custom SaaS platform." },
      { step: 2, title: "Design & Prototyping", description: "Our experts craft high-fidelity UI/UX designs and interactive prototypes, ensuring an intuitive, engaging, and branded user experience." },
      { step: 3, title: "Agile Development & QA", description: "Leveraging modern tech stacks, our engineers build your SaaS platform iteratively, with continuous testing and client feedback at every stage for rapid, high-quality development." },
      { step: 4, title: "Deployment & Launch", description: "We manage the entire deployment process, ensuring a smooth, secure launch. Post-launch, we provide ongoing support and optimization to ensure your platform thrives." }
    ];

    return (
      <section className="py-24 px-6 lg:px-12 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold">Our Streamlined <span className="text-gradient">SaaS Development Process</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUpVariant} initial="hidden" animate={isInView ? "visible" : "hidden"} transition={{ delay: i * 0.15 }} className="relative">
                <span className="text-6xl font-display font-bold text-white/5 absolute -top-8 -left-4 z-0">{step.step}</span>
                <div className="relative z-10 pt-4 border-t-2 border-primary/20 hover:border-primary transition-colors duration-300">
                  <h3 className="font-heading font-bold text-lg mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const MetricsSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const metrics = [
      { value: "200+", label: "Custom Projects Delivered" },
      { value: "99.9%", label: "Average Uptime for SaaS Solutions" },
      { value: "4.9/5", label: "Client Satisfaction Rating" },
      { value: "$25k+", label: "Minimum Project Investment" }
    ];

    return (
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((m, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="text-center p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-colors">
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">{m.value}</div>
                <div className="text-sm font-heading text-muted-foreground uppercase tracking-wider">{m.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  };

  const TechStackSection = () => {
    const techs = ["React", "Next.js", "TypeScript", "Node.js", "AWS", "PostgreSQL", "GSAP", "Framer Motion", "Vite"];
    return (
      <section className="py-20 px-6 lg:px-12 text-center overflow-hidden">
        <span className="text-muted-foreground font-heading uppercase tracking-widest text-sm mb-8 block">Cutting-Edge Technologies We Master</span>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {techs.map((tech, i) => (
            <div key={i} className="px-6 py-3 rounded-full border border-white/10 bg-white/5 text-foreground hover:border-primary/50 hover:text-primary transition-all cursor-default">
              {tech}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const FAQSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
      { "question": "What is the typical timeline for custom SaaS platform development?", "answer": "The timeline varies based on complexity and features, but a typical custom SaaS platform development project ranges from 4 to 12 months. We use agile methodologies to ensure efficient delivery and regular milestones." },
      { "question": "How much does a custom SaaS platform cost?", "answer": "Project costs for custom SaaS solutions at FouriqTech start from $25,000, depending on the scope, features, and chosen technology stack. We provide transparent, detailed quotes after a thorough discovery phase." },
      { "question": "Do you offer post-launch support and maintenance?", "answer": "Absolutely. Our service extends beyond launch. We provide comprehensive post-development support, maintenance, security updates, and performance monitoring to ensure your SaaS platform runs flawlessly." },
      { "question": "What makes FouriqTech a leading SaaS product development company?", "answer": "Our blend of high-end UI/UX design, cutting-edge technology expertise (React, Next.js, GSAP), ROI-driven strategies, and a truly bespoke approach ensures we build not just software, but a competitive advantage for your business." },
      { "question": "Can you integrate our new SaaS platform with existing systems?", "answer": "Yes, seamless integration with your current CRM, ERP, payment gateways, and other third-party services is a core part of our custom SaaS platform development services. We ensure your new platform fits perfectly into your ecosystem." }
    ];

    return (
      <section className="py-32 px-6 lg:px-12 bg-black/30">
        <div className="max-w-3xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Frequently Asked <span className="text-gradient">Questions</span></h2>
          </motion.div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-white/10 rounded-2xl bg-[#0d0d0d] overflow-hidden">
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left px-8 py-6 flex items-center justify-between font-heading font-medium text-lg hover:text-primary transition-colors"
                >
                  {faq.question}
                  <ChevronDown className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <div className={`px-8 overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const FinalCTASection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-[100%] blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant}>
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6">
              Ready to Transform Your Vision into a <span className="text-gradient">Market-Leading SaaS Platform?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Don't settle for off-the-shelf limitations. Partner with FouriqTech, the bespoke SaaS platform agency, to build a solution that drives innovation, efficiency, and exponential growth.
            </p>
            <a href="/#contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 60px hsl(42 85% 55% / 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="py-5 px-10 bg-primary text-primary-foreground font-heading font-bold text-lg rounded-xl glow-box transition-all duration-500 inline-flex items-center gap-2"
              >
                Schedule Your Free Consultation <ArrowUpRight size={22} />
              </motion.button>
            </a>
          </motion.div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <SEO 
        title="Custom SaaS Platform Development Services | FouriqTech" 
        description="FouriqTech delivers custom SaaS platform development services, crafting scalable web application development for startups and robust enterprise SaaS solutions. Partner with a leading SaaS product development company." 
        url="https://fouriqtech.com/services/custom-saas-platform-development" 
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full">
        <HeroSection />
        <MetricsSection />
        <ProblemSection />
        <SolutionSection />
        <ProcessSection />
        <TechStackSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
