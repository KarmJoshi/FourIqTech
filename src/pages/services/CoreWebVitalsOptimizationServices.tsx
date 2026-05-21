import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Rocket, Zap, TrendingDown, Bug, Atom, FlaskConical, Image, LayoutGrid, Move, Search, Code, GanttChartSquare, ShieldCheck, LineChart, Award, HelpCircle, Phone } from 'lucide-react';

export default function CoreWebVitalsOptimizationServices() {
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

  const pageDesign = {
    "page_title": "Core Web Vitals Optimization Services | FourIQ Tech",
    "meta_description": "Expert Core Web Vitals Optimization Services for enterprises. Improve LCP, INP, and CLS to boost SEO rankings and user experience with FourIQ Tech's engineers.",
    "h1": "Enterprise Core Web Vitals Optimization Services",
    "sections": [
      {
        "type": "hero",
        "heading": "Stop Losing Revenue to Slow Load Times",
        "content_brief": "FourIQ Tech provides high-performance engineering to help global brands pass the Core Web Vitals assessment. We optimize your Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift to secure your SEO rankings and maximize conversion rates.",
        "cta_text": "Request a Technical Audit"
      },
      {
        "type": "problem",
        "heading": "The High Cost of Poor Web Performance",
        "content_brief": "Google's ranking algorithm now penalizes sites that fail the Core Web Vitals test. High bounce rates, abandoned carts, and lower organic visibility are the direct results of poor LCP and unstable layouts (CLS). If your metrics aren't in the 'Good' range, you are losing market share to faster competitors.",
        "cta_text": "Check Your Scores"
      },
      {
        "type": "solution",
        "heading": "A Scientific Approach to Page Speed",
        "content_brief": "We don't just suggest fixes; we implement them. Our performance engineers dive deep into your critical rendering path, resource prioritization, and JavaScript execution to ensure your site is optimized for real-world user conditions across all devices.",
        "cta_text": null
      },
      {
        "type": "features",
        "heading": "Comprehensive Optimization Coverage",
        "content_brief": "Our service includes LCP acceleration via image optimization and CDN tuning, CLS elimination through aspect-ratio implementation, and INP readiness by reducing main-thread blocking. We specialize in complex architectures including React and Micro-Frontends.",
        "cta_text": "View Full Scope"
      },
      {
        "type": "process",
        "heading": "Our 4-Step Performance Framework",
        "content_brief": "1. Discovery & Lab Testing: Deep audit using Lighthouse and CrUX data. 2. Critical Path Optimization: Eliminating render-blocking resources. 3. Code & Asset Refinement: Minification, compression, and modern format migration. 4. Continuous Monitoring: Setting up performance budgets to prevent regression.",
        "cta_text": "See Our Methodology"
      },
      {
        "type": "proof",
        "heading": "Real Metrics, Proven Gains",
        "content_brief": "We helped a global enterprise reduce LCP from 5.2s to 1.4s, resulting in a 22% increase in mobile conversion rates. Our strategies are built on the same principles detailed in our case study on architecting scale at enterprise velocity.",
        "cta_text": "Read the Case Study"
      },
      {
        "type": "faq",
        "heading": "Frequently Asked Questions",
        "content_brief": "Answers to the most common questions regarding Core Web Vitals, Google's ranking signals, and the technical requirements for optimization.",
        "cta_text": null
      },
      {
        "type": "cta",
        "heading": "Ready to Pass the Core Web Vitals Assessment?",
        "content_brief": "Don't let technical debt hold back your SEO growth. Partner with FourIQ Tech to transform your site speed into a competitive advantage.",
        "cta_text": "Schedule a Strategy Call"
      }
    ],
    "faq_items": [
      {
        "question": "What are Core Web Vitals?",
        "answer": "Core Web Vitals are a set of specific factors that Google considers important in a webpage's overall user experience. They consist of three specific user interaction and page speed measurements: Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS)."
      },
      {
        "question": "How long does it take to see SEO results from optimization?",
        "answer": "While performance improvements are immediate, Google's Search Console usually takes 28 days to aggregate enough field data from real users to validate the fixes and update your site's status in the 'Good' category."
      },
      {
        "question": "Will you need access to our source code?",
        "answer": "Yes, to provide effective Core Web Vitals Optimization Services, our engineers require access to your codebase to implement critical path CSS, optimize asset delivery, and refactor performance-intensive JavaScript modules."
      },
      {
        "question": "What is the difference between FID and INP?",
        "answer": "First Input Delay (FID) only measured the delay of the very first user interaction. Interaction to Next Paint (INP) is a more comprehensive metric that replaces FID, measuring the latency of all interactions throughout the entire lifespan of a page visit."
      }
    ],
    "internal_links": [
      "/blog/micro-frontend-performance-optimization-enterprise-case-study",
      "/blog/react-large-dataset-rendering-performance-optimization",
      "/blog/sharing-state-between-micro-frontends-architectural-patterns"
    ],
    "schema_type": "Service",
    "target_keyword": "Core Web Vitals Optimization Services",
    "secondary_keywords": [
      "LCP optimization",
      "Interaction to Next Paint",
      "Cumulative Layout Shift fixes",
      "PageSpeed Insights improvement",
      "Web performance consulting"
    ]
  };

  const HeroSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'hero');
    if (!section) return null;
    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative py-24 px-6 lg:px-12 bg-background"
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-gradient">
            {pageDesign.h1}
          </h1>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8 text-foreground">
            {section.heading}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-xl glow-box transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="mr-3 h-6 w-6" />
              {section.cta_text}
            </motion.a>
          )}
        </div>
      </motion.section>
    );
  };

  const ProblemSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'problem');
    if (!section) return null;
    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-8 py-3 text-md font-semibold bg-primary text-primary-foreground rounded-xl glow-box transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingDown className="mr-3 h-5 w-5" />
              {section.cta_text}
            </motion.a>
          )}
        </div>
      </motion.section>
    );
  };

  const SolutionSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'solution');
    if (!section) return null;
    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-background"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-gradient">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {section.content_brief}
          </p>
        </div>
      </motion.section>
    );
  };

  const FeaturesSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'features');
    if (!section) return null;
    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <motion.div variants={fadeUpVariant} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
              <Image className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-foreground">LCP Acceleration</h3>
              <p className="text-muted-foreground">Image optimization, CDN tuning, and critical CSS inlining.</p>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
              <LayoutGrid className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-foreground">CLS Elimination</h3>
              <p className="text-muted-foreground">Aspect-ratio implementation and proper font loading strategies.</p>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="glass-card p-8 rounded-2xl flex flex-col items-center text-center">
              <Move className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-foreground">INP Readiness</h3>
              <p className="text-muted-foreground">Main-thread blocking reduction and efficient event handling.</p>
            </motion.div>
          </div>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center mt-12 px-8 py-3 text-md font-semibold bg-primary text-primary-foreground rounded-xl glow-box transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GanttChartSquare className="mr-3 h-5 w-5" />
              {section.cta_text}
            </motion.a>
          )}
        </div>
      </motion.section>
    );
  };

  const ProcessSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'process');
    if (!section) return null;

    const processSteps = [
      { icon: Search, title: "Discovery & Lab Testing", description: "Deep audit using Lighthouse and CrUX data." },
      { icon: Code, title: "Critical Path Optimization", description: "Eliminating render-blocking resources." },
      { icon: FlaskConical, title: "Code & Asset Refinement", description: "Minification, compression, and modern format migration." },
      { icon: ShieldCheck, title: "Continuous Monitoring", description: "Setting up performance budgets to prevent regression." },
    ];

    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-background"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-gradient">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariant}
                className="glass-card p-8 rounded-2xl flex flex-col items-center text-center"
              >
                <step.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center mt-12 px-8 py-3 text-md font-semibold bg-primary text-primary-foreground rounded-xl glow-box transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Atom className="mr-3 h-5 w-5" />
              {section.cta_text}
            </motion.a>
          )}
        </div>
      </motion.section>
    );
  };

  const ProofSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'proof');
    if (!section) return null;
    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          {section.cta_text && (
            <motion.a
              href={pageDesign.internal_links} // Example: linking to the first internal link for case study
              className="inline-flex items-center justify-center px-8 py-3 text-md font-semibold bg-primary text-primary-foreground rounded-xl glow-box transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LineChart className="mr-3 h-5 w-5" />
              {section.cta_text}
            </motion.a>
          )}
        </div>
      </motion.section>
    );
  };

  const FaqSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'faq');
    if (!section) return null;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pageDesign.faq_items.map(item => ({
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
        className="py-24 px-6 lg:px-12 bg-background"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-10 text-center text-gradient">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
            {section.content_brief}
          </p>
          <div className="space-y-6">
            {pageDesign.faq_items.map((item, index) => (
              <details key={index} className="glass-card p-6 rounded-xl cursor-pointer">
                <summary className="flex items-center justify-between text-xl font-semibold text-foreground">
                  {item.question}
                  <HelpCircle className="h-6 w-6 text-primary ml-4" />
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </motion.section>
    );
  };

  const CtaSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const section = pageDesign.sections.find(s => s.type === 'cta');
    if (!section) return null;
    return (
      <motion.section
        ref={ref}
        variants={fadeUpVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="py-24 px-6 lg:px-12 bg-black/40"
      >
        <div className="max-w-5xl mx-auto text-center glass-card p-10 md:p-16 rounded-3xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-gradient">
            {section.heading}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {section.content_brief}
          </p>
          {section.cta_text && (
            <motion.a
              href="/#contact"
              className="inline-flex items-center justify-center px-12 py-5 text-xl font-semibold bg-primary text-primary-foreground rounded-xl glow-box transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="mr-3 h-7 w-7" />
              {section.cta_text}
            </motion.a>
          )}
        </div>
      </motion.section>
    );
  };


  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SEO
        title={pageDesign.page_title}
        description={pageDesign.meta_description}
        keywords={pageDesign.secondary_keywords.join(', ')}
        schema={{
          "@context": "https://schema.org",
          "@type": pageDesign.schema_type,
          "name": pageDesign.page_title.replace(' | FourIQ Tech', ''),
          "description": pageDesign.meta_description,
          "url": "https://fouriq.com/services/core-web-vitals-optimization-services", // Replace with actual domain
          "potentialAction": {
            "@type": "ContactAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://fouriq.com/#contact" // Replace with actual domain
            },
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ],
            "actionApplication": {
              "@type": "SoftwareApplication",
              "name": "Contact Form"
            }
          }
        }}
      />
      <Navbar visible={navVisible} />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ProcessSection />
        <ProofSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}