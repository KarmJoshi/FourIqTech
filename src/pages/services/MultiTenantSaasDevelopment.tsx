import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import {
  Rocket,
  AlertTriangle,
  ShieldCheck,
  Database,
  Globe,
  Zap,
  CheckCircle,
  Users,
  Palette,
  Monitor,
  LayoutGrid,
  Search,
  IterationCcw,
  CloudUpload,
  LineChart,
  Award,
  HelpCircle,
  Mail,
  LockKeyhole,
  Server,
  Rows,
  Cog,
  Code
} from 'lucide-react'; // Added more icons based on content brief

export default function MultiTenantSaasDevelopment() {
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

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });

  const problemRef = useRef(null);
  const problemInView = useInView(problemRef, { once: true, margin: "-100px" });

  const solutionRef = useRef(null);
  const solutionInView = useInView(solutionRef, { once: true, margin: "-100px" });

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const processRef = useRef(null);
  const processInView = useInView(processRef, { once: true, margin: "-100px" });

  const proofRef = useRef(null);
  const proofInView = useInView(proofRef, { once: true, margin: "-100px" });

  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, margin: "-100px" });

  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best database strategy for multi-tenant SaaS development services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The choice between database-per-tenant, schema-per-tenant, or shared schema depends on your scale and security requirements. We typically recommend isolated schemas or databases for enterprise clients to ensure zero data leakage and optimal performance."
        }
      },
      {
        "@type": "Question",
        "name": "How do you handle white-labeling in multi-tenant environments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We utilize Edge Injection technology to deliver zero-latency white-labeling. This allows specific tenant branding and UI configurations to be injected at the network edge, ensuring a personalized experience without performance penalties."
        }
      },
      {
        "@type": "Question",
        "name": "Can you migrate a single-tenant application to a multi-tenant architecture?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we specialize in refactoring legacy single-tenant applications into scalable multi-tenant platforms. Our process involves decoupling the data layer and implementing a robust tenant identification middleware."
        }
      },
      {
        "@type": "Question",
        "name": "How do you ensure security between different tenants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Security is maintained through strict Row-Level Security (RLS) at the database level or physical separation of storage. We also implement tenant-specific encryption keys to ensure that even in a shared environment, data remains private and inaccessible to others."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SEO
        title="Multi-Tenant SaaS Development Services | FourIQ Tech"
        description="Scale your platform with expert multi-tenant SaaS development services. FourIQ Tech builds secure, high-performance, and isolated multi-tenant architectures."
        schema={faqSchema}
      />
      <Navbar visible={navVisible} />
      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto text-center">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="flex flex-col items-center"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-gradient">
              Enterprise-Grade Multi-Tenant SaaS Development Services
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8">
              Architecting Scalable SaaS Platforms for Global Growth. Position FourIQ Tech as the premier partner for building multi-tenant architectures that prioritize data isolation, security, and performance. Emphasize our ability to handle complex enterprise requirements through advanced engineering.
            </p>
            <motion.a
              href="/#contact"
              className="glow-box bg-primary text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your SaaS Project
            </motion.a>
          </motion.div>
        </section>

        {/* Problem Section */}
        <section ref={problemRef} className="py-24 px-6 lg:px-12 bg-black/40">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={problemInView ? "visible" : "hidden"}
            className="max-w-7xl mx-auto text-center"
          >
            <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              The Complexity of Modern SaaS Scaling
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Developing a scalable SaaS platform introduces numerous challenges. Common pitfalls of poor multi-tenancy include "noisy neighbor" performance issues, where one tenant's heavy usage impacts others. There are also significant data leakage risks if isolation isn't meticulously handled, and the high maintenance overhead of managing individual instances for every client can quickly become unmanageable and costly.
            </p>
          </motion.div>
        </section>

        {/* Solution Section */}
        <section ref={solutionRef} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto text-center">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={solutionInView ? "visible" : "hidden"}
            className="flex flex-col items-center"
          >
            <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Our Approach: Secure, Isolated, and High-Performance
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              We tackle multi-tenancy challenges head-on by focusing on robust isolation models. Our strategies include database-per-tenant or schema-based isolation, ensuring absolute data separation and security for each client. We also leverage cutting-edge technologies like edge computing to guarantee low latency and high availability, providing a seamless experience across global regions for all tenants.
            </p>
            <motion.a
              href="/#contact"
              className="glow-box bg-primary text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Our Architecture Solutions
            </motion.a>
          </motion.div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-24 px-6 lg:px-12 bg-black/40">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="max-w-7xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16">
              Key Capabilities of Our Multi-Tenant Platforms
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="glass-card p-8 rounded-2xl text-center">
                <Database className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Robust Data Isolation</h3>
                <p className="text-muted-foreground">Ensuring complete separation and security of each tenant's data.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Automated Tenant Onboarding</h3>
                <p className="text-muted-foreground">Streamlined and efficient process for integrating new clients.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-center">
                <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">White-Labeling via Edge Injection</h3>
                <p className="text-muted-foreground">Personalized branding and UI at the network edge with zero latency.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-center">
                <Monitor className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Real-time Usage Monitoring</h3>
                <p className="text-muted-foreground">Track and analyze tenant activity and performance in real-time.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-center">
                <Code className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Component-Level Versioning</h3>
                <p className="text-muted-foreground">Prevent system-wide breakages with granular control over component updates.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Process Section */}
        <section ref={processRef} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto text-center">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={processInView ? "visible" : "hidden"}
            className="flex flex-col items-center"
          >
            <LayoutGrid className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-12">
              From Architecture Design to Global Deployment
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              <div className="glass-card p-8 rounded-2xl">
                <Search className="w-10 h-10 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">1. Discovery & Data Modeling</h3>
                <p className="text-muted-foreground">In-depth analysis of your business needs and crafting optimal data structures.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <Server className="w-10 h-10 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">2. Infrastructure & Tenant Strategy</h3>
                <p className="text-muted-foreground">Designing a resilient infrastructure and a tailored tenant isolation strategy.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <IterationCcw className="w-10 h-10 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">3. Agile Iterative Development</h3>
                <p className="text-muted-foreground">Building your platform with agile methodologies, ensuring flexibility and rapid delivery.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <CloudUpload className="w-10 h-10 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">4. Automated CI/CD and Scaling</h3>
                <p className="text-muted-foreground">Implementing continuous integration/delivery and ensuring seamless scaling to meet demand. We also excel in solving complex memory issues in enterprise-scale environments.</p>
              </div>
            </div>
            <motion.a
              href="/#contact"
              className="glow-box bg-primary text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold mt-12 hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Technical Consult
            </motion.a>
          </motion.div>
        </section>

        {/* Proof Section */}
        <section ref={proofRef} className="py-24 px-6 lg:px-12 bg-black/40">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={proofInView ? "visible" : "hidden"}
            className="max-w-7xl mx-auto text-center"
          >
            <LineChart className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Proven Results for Scaling Startups
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              Our expertise delivers tangible benefits. For one multi-tenant client, we successfully reduced infrastructure costs by 40% while simultaneously maintaining a consistent 99.99% uptime. This commitment extends to ensuring we can scale complex React design systems without introducing global breakages, allowing for continuous innovation and growth.
            </p>
            <Award className="w-16 h-16 text-primary mx-auto mt-8" />
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section ref={faqRef} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">What is the best database strategy for multi-tenant SaaS development services?</h3>
                </div>
                <p className="text-muted-foreground">The choice between database-per-tenant, schema-per-tenant, or shared schema depends on your scale and security requirements. We typically recommend isolated schemas or databases for enterprise clients to ensure zero data leakage and optimal performance.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">How do you handle white-labeling in multi-tenant environments?</h3>
                </div>
                <p className="text-muted-foreground">We utilize Edge Injection technology to deliver zero-latency white-labeling. This allows specific tenant branding and UI configurations to be injected at the network edge, ensuring a personalized experience without performance penalties.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">Can you migrate a single-tenant application to a multi-tenant architecture?</h3>
                </div>
                <p className="text-muted-foreground">Yes, we specialize in refactoring legacy single-tenant applications into scalable multi-tenant platforms. Our process involves decoupling the data layer and implementing a robust tenant identification middleware.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">How do you ensure security between different tenants?</h3>
                </div>
                <p className="text-muted-foreground">Security is maintained through strict Row-Level Security (RLS) at the database level or physical separation of storage. We also implement tenant-specific encryption keys to ensure that even in a shared environment, data remains private and inaccessible to others.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="py-24 px-6 lg:px-12 bg-black/40 text-center">
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            className="max-w-4xl mx-auto"
          >
            <Mail className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Ready to Build Your SaaS Empire?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Don't let architectural complexities hinder your growth. Partner with FourIQ Tech to build a resilient, scalable, and secure multi-tenant SaaS platform that powers your global ambitions. Reinforce our technical authority and global reach.
            </p>
            <motion.a
              href="/#contact"
              className="glow-box bg-primary text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get a Custom Quote
            </motion.a>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}