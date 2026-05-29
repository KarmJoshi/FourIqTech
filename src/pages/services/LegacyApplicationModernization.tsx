import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Bug, Cloud, Rocket, Workflow, ShieldCheck, Database, Lightbulb, ChevronDown } from 'lucide-react';

export default function LegacyApplicationModernization() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  // Animation variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const sectionsData = {
    "page_title": "Legacy Application Modernization Services | FourIQ Tech",
    "meta_description": "Future-proof your business with our legacy application modernization services. Transform outdated tech into scalable, high-performance web apps. Get a free audit.",
    "h1": "Scale Your Enterprise with Expert Legacy Application Modernization Services",
    "sections": [
      {
        "type": "hero",
        "heading": "Stop Managing Technical Debt. Start Driving Innovation.",
        "content_brief": "Transform your brittle, high-maintenance legacy systems into agile, cloud-native web applications. FourIQ Tech combines deep architectural expertise with modern frameworks to ensure your infrastructure evolves at the speed of your business.",
        "cta_text": "Request a Technical Audit"
      },
      {
        "type": "problem",
        "heading": "The Hidden Costs of Legacy Software",
        "content_brief": "Outdated applications aren't just slow—they are security risks that drain your ROI. From prohibitive maintenance costs and lack of integration to the 'React Heap Out of Memory' errors common in aging enterprise CI/CD pipelines, your legacy stack is a bottleneck to growth.",
        "cta_text": null
      },
      {
        "type": "solution",
        "heading": "Precision Engineering for Modern Architectures",
        "content_brief": "We don't just 'reskin' apps; we re-architect them. Our approach focuses on breaking down monoliths into manageable microservices and implementing multi-tenant design systems that achieve zero-latency white labeling at the edge.",
        "cta_text": "View Our Methodology"
      },
      {
        "type": "features",
        "heading": "Modernization Strategies That Scale",
        "content_brief": "We provide comprehensive modernization including Re-platforming (moving to cloud), Re-factoring (optimizing code), and Re-architecting (shifting to microservices). We specialize in solving complex issues like component-level versioning to prevent global breakages during enterprise scaling.",
        "cta_text": "Explore Features"
      },
      {
        "type": "process",
        "heading": "Our 4-Step Modernization Framework",
        "content_brief": "1. Discovery & Audit: Identifying bottlenecks and security gaps. 2. Strategy & Blueprint: Choosing the right stack (Next.js, Node, Cloud-native). 3. Iterative Execution: Low-risk, phased migration. 4. Optimization & Support: Continuous performance monitoring.",
        "cta_text": "How We Work"
      },
      {
        "type": "proof",
        "heading": "Real Results for Global Enterprises",
        "content_brief": "Our modernization projects consistently deliver a 40% reduction in infrastructure costs and 2x faster deployment cycles. By implementing sophisticated design systems and solving memory leaks in CI/CD, we turn technical liabilities into competitive advantages.",
        "cta_text": "Read Case Studies"
      },
      {
        "type": "faq",
        "heading": "Legacy Application Modernization: Frequently Asked Questions",
        "content_brief": "Common questions regarding the timeline, cost, and technical risks of modernizing enterprise software.",
        "cta_text": null
      },
      {
        "type": "cta",
        "heading": "Ready to Eliminate Your Technical Debt?",
        "content_brief": "Don't let outdated technology stall your digital transformation. Partner with FourIQ Tech to build a resilient, scalable, and modern application ecosystem.",
        "cta_text": "Schedule a Consultation"
      }
    ],
    "faq_items": [
      {
        "question": "What are legacy application modernization services?",
        "answer": "Legacy application modernization services involve the process of updating older software systems to modern tech stacks, cloud environments, and architectures to improve performance, security, and scalability while reducing maintenance costs."
      },
      {
        "question": "How long does the modernization process take?",
        "answer": "The timeline varies based on the complexity of the monolith, but typically ranges from 3 to 9 months. We use an iterative approach to ensure your business remains operational throughout the migration."
      },
      {
        "question": "Will modernizing my app cause downtime?",
        "answer": "No. We utilize strategies like the Strangler Fig pattern and edge injection to migrate functionality incrementally, ensuring zero-latency transitions and high availability for your users."
      },
      {
        "question": "Why choose FourIQ Tech for modernization?",
        "answer": "We specialize in solving high-level enterprise challenges, such as React heap memory issues and complex design system versioning, ensuring your new architecture is built for long-term stability."
      }
    ],
    "internal_links": [
      "/blog/react-design-system-versioning-enterprise-scale",
      "/blog/react-heap-out-of-memory-case-study",
      "/blog/multi-tenant-design-system-architecture-edge-injection"
    ],
    "schema_type": "Service",
    "target_keyword": "legacy application modernization services",
    "secondary_keywords": [
      "application re-architecture",
      "cloud migration services",
      "enterprise software modernization",
      "technical debt reduction"
    ]
  };

  const getSection = (type) => sectionsData.sections.find(sec => sec.type === type);

  const HeroSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("hero");
    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
        >
          <h1 className="font-display text-4xl md:text-6xl font-bold text-gradient mb-6 leading-tight">
            {sectionsData.h1}
          </h1>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8">
            {section.heading}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl glow-box text-lg font-semibold hover:scale-105 transition-transform duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {section.cta_text}
          </motion.a>
        </motion.div>
      </section>
    );
  };

  const ProblemSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("problem");
    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-black/40 rounded-3xl my-16">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center"
        >
          <Bug className="h-16 w-16 text-primary mx-auto mb-6" />
          <h3 className="font-display text-4xl md:text-5xl font-bold mb-8">
            {section.heading}
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {section.content_brief}
          </p>
        </motion.div>
      </section>
    );
  };

  const SolutionSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("solution");
    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center"
        >
          <Rocket className="h-16 w-16 text-primary mx-auto mb-6" />
          <h3 className="font-display text-4xl md:text-5xl font-bold mb-8">
            {section.heading}
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {section.content_brief}
          </p>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl glow-box text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {section.cta_text}
            </motion.a>
          )}
        </motion.div>
      </section>
    );
  };

  const FeaturesSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("features");
    const featureItems = [
      { icon: Cloud, title: "Re-platforming", description: "Seamless migration of your applications to robust cloud environments for enhanced scalability and reliability." },
      { icon: Database, title: "Re-factoring", description: "Optimizing existing codebases to improve performance, maintainability, and align with modern coding standards." },
      { icon: Workflow, title: "Re-architecting", description: "Transforming monolithic applications into agile microservices architectures for increased flexibility and independent deployment." },
      { icon: ShieldCheck, title: "Component Versioning", description: "Solving complex component-level versioning to prevent global breakages during enterprise scaling and updates." }
    ];

    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-black/40 rounded-3xl my-16">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center"
        >
          <h3 className="font-display text-4xl md:text-5xl font-bold mb-8">
            {section.heading}
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            {section.content_brief}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featureItems.map((item, index) => (
              <div key={index} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
                <item.icon className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-2xl font-semibold mb-3">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl glow-box text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {section.cta_text}
            </motion.a>
          )}
        </motion.div>
      </section>
    );
  };

  const ProcessSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("process");
    const processSteps = section.content_brief.split('. ').map(step => step.trim()).filter(step => step);

    const stepIcons = [Lightbulb, Workflow, Rocket, ShieldCheck];

    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center"
        >
          <h3 className="font-display text-4xl md:text-5xl font-bold mb-8">
            {section.heading}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 mt-12">
            {processSteps.map((step, index) => {
              const Icon = stepIcons[index % stepIcons.length];
              return (
                <div key={index} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h4 className="text-xl font-semibold mb-2">{step.split(':')}</h4>
                  <p className="text-muted-foreground">{step.split(':')}</p>
                </div>
              );
            })}
          </div>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl glow-box text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {section.cta_text}
            </motion.a>
          )}
        </motion.div>
      </section>
    );
  };

  const ProofSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("proof");
    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-black/40 rounded-3xl my-16">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center"
        >
          <h3 className="font-display text-4xl md:text-5xl font-bold mb-8">
            {section.heading}
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {section.content_brief}
          </p>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl glow-box text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {section.cta_text}
            </motion.a>
          )}
        </motion.div>
      </section>
    );
  };

  const FAQSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("faq");
    const [openQuestion, setOpenQuestion] = useState(null);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": sectionsData.faq_items.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <SEO
          title={sectionsData.page_title}
          description={sectionsData.meta_description}
          schema={faqSchema}
        />
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center"
        >
          <h3 className="font-display text-4xl md:text-5xl font-bold mb-8">
            {section.heading}
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            {section.content_brief}
          </p>
          <div className="max-w-3xl mx-auto text-left">
            {sectionsData.faq_items.map((item, index) => (
              <div key={index} className="glass-card p-6 rounded-xl mb-4 cursor-pointer" onClick={() => setOpenQuestion(openQuestion === index ? null : index)}>
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-foreground">{item.question}</h4>
                  <motion.div
                    initial={false}
                    animate={{ rotate: openQuestion === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
                {openQuestion === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mt-4 text-muted-foreground"
                  >
                    {item.answer}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    );
  };

  const CtaSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = getSection("cta");
    return (
      <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-black/40 rounded-3xl my-16">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUpVariant}
          className="text-center"
        >
          <h3 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-8">
            {section.heading}
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {section.content_brief}
          </p>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl glow-box text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {section.cta_text}
            </motion.a>
          )}
        </motion.div>
      </section>
    );
  };


  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SEO title={sectionsData.page_title} description={sectionsData.meta_description} />
      <Navbar visible={navVisible} />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ProcessSection />
        <ProofSection />
        <FAQSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}