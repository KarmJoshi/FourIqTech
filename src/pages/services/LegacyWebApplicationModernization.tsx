import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, ShieldOff, Rocket, Bug, Code2, Cloud, Sparkles, Gauge, GitFork, ChevronDown } from 'lucide-react';

export default function LegacyWebApplicationModernization() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const HeroSection = () => {
    return (
      <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[150px] liquid-blob" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant}>
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] inline-block mb-4">
              ✦ Legacy Web Application Modernization Services
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight flex flex-col items-center">
              <span>Unlock Peak Performance</span>
              <span>with Tailored <span className="text-gradient">Legacy Web Application Modernization Services</span></span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-10">
              As a CTO or VP Engineering, you know the cost of stagnation. FouriqTech transforms your outdated systems into high-performance, scalable, and secure platforms designed for future growth and competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/#contact">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  className="py-4 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 flex items-center justify-center gap-2"
                >
                  Get a Free Modernization Strategy Session <ArrowUpRight size={18} />
                </motion.button>
              </a>
            </div>
            <p className="mt-8 text-sm text-muted-foreground font-heading uppercase tracking-widest">
              Trusted by 50+ enterprise leaders globally for transformative digital solutions.
            </p>
          </motion.div>
        </div>
      </section>
    );
  };

  const ProblemSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const icons = { ShieldOff, Rocket, Bug, Code2 };

    const problems = [
      { icon: "ShieldOff", title: "Security Vulnerabilities & Compliance Risks", description: "Legacy systems are often targets for cyber threats, posing significant risks to data and compliance. An outdated web app upgrade is crucial." },
      { icon: "Rocket", title: "Poor Performance & Scalability Issues", description: "Slow load times and inability to handle increased user loads frustrate users and stifle business growth. Modernization is key for high performance application modernization." },
      { icon: "Bug", title: "Excessive Maintenance & Development Costs", description: "Maintaining archaic codebases consumes disproportionate resources, diverting budget from innovation and efficient development." },
      { icon: "Code2", title: "Developer Churn & Integration Challenges", description: "Finding talent for legacy tech stacks is difficult, leading to high churn and struggles with integrating modern APIs and services for enterprise application re-platforming." }
    ];

    return (
      <section className="relative py-24 px-6 lg:px-12 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold">The High Cost of <span className="text-gradient">Outdated Web Applications</span></h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((prob, i) => {
              const Icon = icons[prob.icon as keyof typeof icons] || Code2;
              return (
                <motion.div key={i} variants={fadeUpVariant} className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-4 text-zinc-400 mb-6 group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 group-hover:text-white transition-colors">{prob.title}</h3>
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
    const icons = { Cloud, Sparkles, Gauge, GitFork };

    const solutions = [
      { icon: "Cloud", title: "Strategic Re-Platforming & Cloud Migration", description: "Seamlessly migrate your critical applications to modern, scalable cloud infrastructures. Our enterprise application re-platforming ensures minimal downtime and maximum efficiency." },
      { icon: "Sparkles", title: "Cutting-Edge UI/UX & Tech Stack Revitalization", description: "We deliver modern web application development for legacy systems, integrating React modernization services and Next.js application migration for stunning, performant user experiences." },
      { icon: "Gauge", title: "Performance Optimization & Scalability Architecture", description: "Architecting solutions for unparalleled speed and future-proof scalability, ensuring your application can grow with your business demands." },
      { icon: "GitFork", title: "Robust API Integrations & Ecosystem Expansion", description: "Connect your modernized application with essential third-party services, creating a cohesive, data-driven ecosystem that drives ROI." }
    ];

    return (
      <section className="relative py-32 px-6 lg:px-12">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[150px] liquid-blob pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">✦ Digital Transformation</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">FouriqTech: Your Partner in <span className="text-gradient">Digital Transformation</span></h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? "visible" : "hidden"} className="grid md:grid-cols-2 gap-8">
            {solutions.map((sol, i) => {
              const Icon = icons[sol.icon as keyof typeof icons] || Code2;
              return (
                <motion.div key={i} variants={fadeUpVariant} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-10 transition-[border-color,transform] duration-500 hover:border-primary/45">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-2xl opacity-40 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="relative z-10">
                    <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-5 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
                      <Icon size={32} strokeWidth={1.6} />
                    </div>
                    <h3 className="mt-8 font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                      {sol.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:pr-8">
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
      { step: 1, title: "Discovery & Audit", description: "We conduct a thorough analysis of your existing legacy web application, identifying pain points, opportunities, and defining a clear modernization roadmap aligned with your business objectives." },
      { step: 2, title: "Solution Design & Prototyping", description: "Our experts architect a modern solution, including tech stack recommendations, UI/UX wireframes, and prototypes, ensuring a clear vision for your transformed application." },
      { step: 3, title: "Agile Development & Migration", description: "Leveraging agile methodologies, we meticulously build, refactor, and migrate your application using cutting-edge technologies like React and Next.js, with continuous testing and feedback." },
      { step: 4, title: "Deployment & Post-Launch Support", description: "After rigorous quality assurance, we handle the seamless deployment of your new application. Our commitment extends to ongoing support, maintenance, and further enhancements." }
    ];

    return (
      <section className="py-24 px-6 lg:px-12 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold">Our Streamlined <span className="text-gradient">Modernization Process</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUpVariant} initial="hidden" animate={isInView ? "visible" : "hidden"} transition={{ delay: i * 0.15 }} className="relative group">
                <div className="text-[120px] font-display font-bold text-white/[0.03] absolute -top-16 -left-6 z-0 leading-none select-none group-hover:text-primary/[0.05] transition-colors duration-500">{step.step}</div>
                <div className="relative z-10 pt-6 border-t-[3px] border-primary/20 group-hover:border-primary transition-colors duration-500">
                  <h3 className="font-heading font-bold text-xl mb-4 text-white group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
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
      { value: "200+", label: "Projects Delivered" },
      { value: "3x", label: "Performance Gains on Average" },
      { value: "25%+", label: "Reduction in Maintenance Costs" },
      { value: "$25k+", label: "Avg. Project Value" }
    ];

    return (
      <section className="py-24 px-6 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {metrics.map((m, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="text-center p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all hover:-translate-y-1">
                <div className="text-4xl md:text-6xl font-display font-bold text-gradient mb-4">{m.value}</div>
                <div className="text-sm font-heading font-medium text-muted-foreground uppercase tracking-widest leading-relaxed max-w-[150px] mx-auto">{m.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  };

  const TechStackSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const techs = ["React", "Next.js", "TypeScript", "Node.js", "AWS", "GCP", "Docker", "Kubernetes", "GSAP", "Framer Motion", "Tailwind CSS", "PostgreSQL", "MongoDB"];
    
    return (
      <section className="py-20 px-6 lg:px-12 text-center overflow-hidden bg-[#050505]">
        <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant}>
          <h2 className="text-muted-foreground font-heading font-semibold uppercase tracking-widest text-sm mb-10 block">
            Built on a Foundation of Modern Excellence
          </h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {techs.map((tech, i) => (
              <div key={i} className="px-6 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-foreground hover:border-primary/50 hover:text-primary transition-all duration-300 font-medium">
                {tech}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    );
  };

  const FAQSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
      { "question": "What is legacy web application modernization?", "answer": "It's the process of updating outdated software systems and applications to modern technologies, architectures, and development practices. This involves re-platforming, re-architecting, and often a complete UI/UX overhaul to improve performance, scalability, security, and maintainability for an outdated web app upgrade." },
      { "question": "How long does a typical modernization project take?", "answer": "The timeline varies significantly based on the application's complexity, size, and your specific requirements. After our initial discovery and audit, we provide a detailed project roadmap with estimated timelines and milestones." },
      { "question": "What technologies do you use for modernization?", "answer": "We leverage a cutting-edge stack including React, Next.js, TypeScript, Node.js, and cloud platforms like AWS/GCP. Our expertise in react modernization services and Next.js application migration ensures future-proof solutions." },
      { "question": "What if we have specific compliance or industry regulations?", "answer": "FouriqTech has extensive experience working with clients in regulated industries. We embed compliance requirements into every stage of the modernization process, ensuring your application meets all necessary standards." },
      { "question": "What are the benefits of high performance application modernization?", "answer": "Beyond enhanced performance and security, modernization leads to lower operational costs, improved user experience, better scalability for growth, easier integration with new services, and a more agile development process that attracts top talent." }
    ];

    return (
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Frequently Asked <span className="text-gradient">Questions</span></h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about our modernization services.</p>
          </motion.div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden hover:border-white/20 transition-colors">
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left px-8 py-6 flex items-center justify-between font-heading font-medium text-lg hover:text-primary transition-colors"
                >
                  <span className="pr-8">{faq.question}</span>
                  <ChevronDown className={`transform transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                </button>
                <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
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
      <section className="py-32 px-6 lg:px-12 relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={fadeUpVariant}>
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Ready to Transform Your <span className="text-gradient">Digital Foundation?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Don't let outdated technology hold your business back. Contact FouriqTech today for a personalized consultation and unlock the full potential of your applications.
            </p>
            <a href="/#contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 60px hsl(42 85% 55% / 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="py-5 px-10 bg-primary text-primary-foreground font-heading font-bold text-lg rounded-xl glow-box transition-all duration-500 inline-flex items-center gap-3"
              >
                Request a Free Consultation Now <ArrowUpRight size={22} strokeWidth={2.5} />
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
        title="Legacy Web Application Modernization Services by FouriqTech" 
        description="Transform your outdated systems with FouriqTech's high-performance legacy web application modernization services. Boost scalability, security, and user experience." 
        url="https://fouriqtech.com/services/legacy-web-application-modernization" 
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
