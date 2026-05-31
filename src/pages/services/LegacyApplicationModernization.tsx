import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import {
  Sparkles,
  AlertCircle,
  Lightbulb,
  Zap,
  Shield,
  Cloud,
  Monitor,
  ClipboardPen,
  LayoutList,
  RefreshCcw,
  CheckCircle2,
  Award,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

const PAGE_DESIGN = {
  "page_title": "Legacy Web Application Modernization Services | FourIQ Tech",
  "meta_description": "Transform outdated systems with FourIQ Tech’s Legacy Web Application Modernization Services. We eliminate technical debt and optimize enterprise performance.",
  "h1": "Future-Proof Your Enterprise with Legacy Web Application Modernization Services",
  "sections": [
    {
      "type": "hero",
      "heading": "Modernize Your Legacy Stack Without the Operational Downtime",
      "content_brief": "FourIQ Tech helps global enterprises migrate monolithic architectures to scalable, cloud-native environments. We bridge the gap between outdated codebases and modern user expectations through strategic re-engineering.",
      "cta_text": "Schedule a Modernization Audit"
    },
    {
      "type": "problem",
      "heading": "The Hidden Cost of Stagnant Software",
      "content_brief": "Legacy applications often suffer from performance bottlenecks, security vulnerabilities, and mounting technical debt. These systems drain resources and prevent rapid deployment of new features, as detailed in our analysis of React Heap issues in enterprise CI/CD.",
      "cta_text": "Calculate Your Technical Debt"
    },
    {
      "type": "solution",
      "heading": "Strategic Modernization for the Modern Web",
      "content_brief": "We don't just rewrite code; we transform business logic into resilient architectures. From component-level versioning to edge injection for multi-tenant systems, we apply enterprise-grade solutions to your legacy challenges.",
      "cta_text": "View Our Tech Stack"
    },
    {
      "type": "features",
      "heading": "Key Benefits of Modernizing with FourIQ",
      "content_brief": "Our services focus on four pillars: Performance Optimization, Security Hardening, Cloud Scalability, and UI/UX Revitalization. We utilize advanced techniques like optimizing dashboard rerenders to ensure your new application is fast and responsive.",
      "cta_text": "Explore Features"
    },
    {
      "type": "process",
      "heading": "Our 4-Step Modernization Framework",
      "content_brief": "We follow a rigorous process: 1. Deep Infrastructure Audit, 2. Strategy & Roadmap Design, 3. Incremental Migration/Refactoring, and 4. Continuous Deployment & Testing. This ensures zero-latency transitions and high reliability.",
      "cta_text": "See Our Methodology"
    },
    {
      "type": "proof",
      "heading": "Proven Results for Global Enterprises",
      "content_brief": "We helped a Fortune 500 SaaS provider reduce cloud infrastructure costs by 35% while improving application load times by 60%. Our approach to scaling React design systems ensures long-term maintainability without global breakages.",
      "cta_text": "Read Case Studies"
    },
    {
      "type": "faq",
      "heading": "Frequently Asked Questions",
      "content_brief": "Common questions regarding our Legacy Web Application Modernization Services, timelines, and technical requirements.",
      "cta_text": "Contact an Expert"
    },
    {
      "type": "cta",
      "heading": "Ready to Reclaim Your Technical Edge?",
      "content_brief": "Don't let legacy code hold your business back. Partner with FourIQ Tech to modernize your infrastructure, improve security, and deliver a world-class user experience.",
      "cta_text": "Get Your Free Quote"
    }
  ],
  "faq_items": [
    {
      "question": "What is legacy web application modernization?",
      "answer": "It is the process of updating older software systems to modern architectures, such as cloud-native or microservices, to improve performance, security, and scalability while preserving core business logic."
    },
    {
      "question": "How long does a modernization project take?",
      "answer": "Timelines vary based on complexity, but most enterprise projects range from 3 to 9 months. We utilize incremental migration to ensure value is delivered throughout the process."
    },
    {
      "question": "Will there be downtime during the migration?",
      "answer": "No. We utilize strategies like blue-green deployments and edge-side injection to ensure that your existing users experience zero downtime while we transition to the modernized system."
    },
    {
      "question": "How do you handle data integrity during the move?",
      "answer": "We implement strict ETL (Extract, Transform, Load) protocols and automated testing suites to ensure that all legacy data is accurately mapped and migrated to the new database schema."
    },
    {
      "question": "Can you modernize only specific parts of our application?",
      "answer": "Yes, we often perform 'modular modernization' where we target high-impact areas like the frontend dashboard or specific API layers to solve immediate bottlenecks first."
    }
  ],
  "internal_links": [
    "/blog/optimizing-react-dashboard-rerenders-enterprise-saas",
    "/blog/react-design-system-versioning-enterprise-scale",
    "/blog/react-heap-out-of-memory-case-study",
    "/blog/multi-tenant-design-system-architecture-edge-injection"
  ],
  "schema_type": "Service",
  "target_keyword": "Legacy Web Application Modernization Services",
  "secondary_keywords": [
    "Software Re-engineering",
    "Application Refactoring",
    "Cloud Migration Strategy",
    "Technical Debt Management",
    "Enterprise SaaS Optimization"
  ]
};

export default function LegacyApplicationModernization() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Animation variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const HeroSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'hero');
    if (!section) return null;

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 text-center bg-background min-h-[80vh] flex items-center justify-center"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gradient">
            {PAGE_DESIGN.h1}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground text-lg rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.cta_text} <ArrowRight className="ml-2 h-5 w-5" />
          </motion.a>
        </div>
      </motion.section>
    );
  };

  const ProblemSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'problem');
    if (!section) return null;

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40 text-foreground"
      >
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
            {section.content_brief}
          </p>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.cta_text}
          </motion.a>
        </div>
      </motion.section>
    );
  };

  const SolutionSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'solution');
    if (!section) return null;

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-background text-foreground"
      >
        <div className="max-w-7xl mx-auto text-center">
          <Lightbulb className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
            {section.content_brief}
          </p>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.cta_text}
          </motion.a>
        </div>
      </motion.section>
    );
  };

  const FeaturesSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'features');
    if (!section) return null;

    const featurePillars = [
      { name: "Performance Optimization", icon: Zap },
      { name: "Security Hardening", icon: Shield },
      { name: "Cloud Scalability", icon: Cloud },
      { name: "UI/UX Revitalization", icon: Monitor },
    ];

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40 text-foreground"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto">
            {section.content_brief}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featurePillars.map((pillar, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-2xl flex flex-col items-center text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <pillar.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {pillar.name}
                </h3>
                <p className="text-muted-foreground">
                  {/* Detailed description could go here if available */}
                </p>
              </motion.div>
            ))}
          </div>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.cta_text}
          </motion.a>
        </div>
      </motion.section>
    );
  };

  const ProcessSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'process');
    if (!section) return null;

    const processSteps = [
      { name: "Deep Infrastructure Audit", icon: ClipboardPen },
      { name: "Strategy & Roadmap Design", icon: LayoutList },
      { name: "Incremental Migration/Refactoring", icon: RefreshCcw },
      { name: "Continuous Deployment & Testing", icon: CheckCircle2 },
    ];

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-background text-foreground"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto">
            {section.content_brief}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 rounded-2xl flex flex-col items-center text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="relative mb-4">
                  <span className="absolute -top-4 -left-4 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center text-xl font-bold">
                    {index + 1}
                  </span>
                  <step.icon className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {step.name}
                </h3>
              </motion.div>
            ))}
          </div>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.cta_text}
          </motion.a>
        </div>
      </motion.section>
    );
  };

  const ProofSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'proof');
    if (!section) return null;

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40 text-foreground"
      >
        <div className="max-w-7xl mx-auto text-center">
          <Award className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
            {section.content_brief}
          </p>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.cta_text}
          </motion.a>
        </div>
      </motion.section>
    );
  };

  const FAQSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'faq');
    if (!section) return null;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": PAGE_DESIGN.faq_items.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-background text-foreground"
      >
        <SEO
          title={PAGE_DESIGN.page_title}
          description={PAGE_DESIGN.meta_description}
          schema={faqSchema}
        />
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            {section.content_brief}
          </p>
          <div className="space-y-4">
            {PAGE_DESIGN.faq_items.map((item, index) => (
              <div key={index} className="glass-card rounded-xl p-6 cursor-pointer">
                <button
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`h-6 w-6 text-primary transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 text-muted-foreground border-t border-gray-700 pt-4"
                  >
                    <p>{item.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {section.cta_text}
            </motion.a>
          </div>
        </div>
      </motion.section>
    );
  };

  const CtaSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px 0px" });
    const section = PAGE_DESIGN.sections.find(s => s.type === 'cta');
    if (!section) return null;

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40 text-foreground"
      >
        <div className="max-w-7xl mx-auto text-center glass-card p-12 rounded-3xl">
          <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-4xl mx-auto">
            {section.content_brief}
          </p>
          <motion.a
            href="/#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground text-lg rounded-xl font-semibold glow-box transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {section.cta_text} <ArrowRight className="ml-2 h-5 w-5" />
          </motion.a>
        </div>
      </motion.section>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SEO title={PAGE_DESIGN.page_title} description={PAGE_DESIGN.meta_description} />
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