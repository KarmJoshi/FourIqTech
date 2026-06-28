import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, CheckCircle2, Cloud, Box, Share, BarChart2, ShieldCheck, Activity } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Custom SaaS Development Services",
  "description": "Elevate your business with FourIQ Tech's expert custom SaaS development services. We build scalable, secure, and innovative cloud solutions for global startups and enterprises.",
  "serviceType": "Custom Software Development",
  "provider": {
    "@type": "Organization",
    "name": "FourIQ Tech",
    "url": "https://fouriqtech.com"
  },
  "areaServed": {
    "@type": "Place",
    "name": "Global"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "SaaS Development Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom SaaS Platform Development",
          "description": "End-to-end development of bespoke SaaS solutions tailored to unique business needs."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "SaaS Architecture Design & Consultation",
          "description": "Designing scalable, resilient, and secure cloud architectures for SaaS applications."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "SaaS Integration & API Development",
          "description": "Seamless integration with third-party systems and robust API development."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "SaaS Security & Compliance",
          "description": "Implementing advanced security protocols and ensuring regulatory compliance for SaaS platforms."
        }
      }
    ]
  },
  "url": "https://fouriqtech.com/services/custom-saas-development"
};

export default function CustomSaasDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);
  }, [setScrollLocked]);

  const heroRef = useRef(null);
  const resultsRef = useRef(null);
  const capabilitiesRef = useRef(null);
  const useCasesRef = useRef(null);
  const processRef = useRef(null);
  const whyUsRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const resultsInView = useInView(resultsRef, { once: true, margin: "-100px" });
  const capabilitiesInView = useInView(capabilitiesRef, { once: true, margin: "-100px" });
  const useCasesInView = useInView(useCasesRef, { once: true, margin: "-100px" });
  const processInView = useInView(processRef, { once: true, margin: "-100px" });
  const whyUsInView = useInView(whyUsRef, { once: true, margin: "-100px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Custom SaaS Development Services | FourIQ Tech"
        description="Elevate your business with FourIQ Tech's expert custom SaaS development services. We build scalable, secure, and innovative cloud solutions for global startups and enterprises."
        keywords="custom SaaS development services"
        route="/services/custom-saas-development"
        schema={serviceSchema}
      />
      <Navbar isVisible={navVisible} />

      {/* Hero Section */}
      <section ref={heroRef} className="sections py-36 px-6 lg:px-12 flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: 'url(/path/to/hero-bg.jpg)' }}>
        <motion.div
          className="max-w-4xl mx-auto"
          variants={fadeUp}
          initial="initial"
          animate={heroInView ? "animate" : "initial"}
        >
          <h1 className="text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            Unlock Growth with Expert <span className="text-gradient">Custom SaaS Development Services</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            FourIQ Tech engineers bespoke, scalable, and secure SaaS solutions, driving digital transformation and competitive advantage for global enterprises and startups.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/contact" className="bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box py-4 px-8 flex items-center group">
              Start Your Project <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/services" className="border border-primary text-primary font-heading font-semibold rounded-xl py-4 px-8 flex items-center group">
              Explore Services <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Results Bar Section */}
      <section ref={resultsRef} className="sections py-24 px-6 lg:px-12">
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          variants={fadeUp}
          initial="initial"
          animate={resultsInView ? "animate" : "initial"}
        >
          <div className="glass-card rounded-2xl p-7">
            <h3 className="text-5xl font-display font-bold text-gradient mb-2">+200%</h3>
            <p className="text-muted-foreground">Average ROI</p>
          </div>
          <div className="glass-card rounded-2xl p-7">
            <h3 className="text-5xl font-display font-bold text-gradient mb-2">99.9%</h3>
            <p className="text-muted-foreground">Uptime Guarantee</p>
          </div>
          <div className="glass-card rounded-2xl p-7">
            <h3 className="text-5xl font-display font-bold text-gradient mb-2">10M+</h3>
            <p className="text-muted-foreground">Users Supported</p>
          </div>
          <div className="glass-card rounded-2xl p-7">
            <h3 className="text-5xl font-display font-bold text-gradient mb-2">30%</h3>
            <p className="text-muted-foreground">Cost Reduction</p>
          </div>
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section ref={capabilitiesRef} className="sections py-24 px-6 lg:px-12 bg-muted">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={fadeUp}
          initial="initial"
          animate={capabilitiesInView ? "animate" : "initial"}
        >
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-4 text-center">✦ Capabilities</p>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-center mb-16">
            Robust Foundation for Your SaaS Vision
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-7 flex flex-col items-start">
              <Cloud className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Cloud-Native Architecture</h3>
              <p className="text-muted-foreground">Scalable, resilient microservices on AWS, Azure, or GCP for optimal performance and flexibility.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 flex flex-col items-start">
              <Box className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Microservices Development</h3>
              <p className="text-muted-foreground">Decoupled service design for agile deployment, enhanced fault tolerance, and simplified maintenance.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 flex flex-col items-start">
              <Share className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">API Integration & Management</h3>
              <p className="text-muted-foreground">Secure, robust integration with third-party systems and efficient API lifecycle management.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 flex flex-col items-start">
              <BarChart2 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Data Analytics & AI</h3>
              <p className="text-muted-foreground">Actionable business insights, predictive modeling, and intelligent feature integration with machine learning.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 flex flex-col items-start">
              <ShieldCheck className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Security & Compliance</h3>
              <p className="text-muted-foreground">End-to-end data encryption, regular security audits, and adherence to industry-specific regulatory compliance.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 flex flex-col items-start">
              <Activity className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">Scalability & Performance</h3>
              <p className="text-muted-foreground">High-throughput, low-latency systems engineered to support exponential user growth and data volumes.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Use Cases Section */}
      <section ref={useCasesRef} className="sections py-24 px-6 lg:px-12">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={fadeUp}
          initial="initial"
          animate={useCasesInView ? "animate" : "initial"}
        >
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-4 text-center">✦ Use Cases</p>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-center mb-16">
            Tailored SaaS Solutions Across Industries
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Enterprise Resource Planning (ERP) systems for streamlined operations.",
              "Customer Relationship Management (CRM) platforms for enhanced client engagement.",
              "Healthcare Management Solutions for secure patient data and workflows.",
              "Financial Technology (FinTech) applications with robust security and compliance.",
              "Logistics and Supply Chain Optimization tools for efficiency and visibility.",
              "E-commerce and Marketplace platforms supporting multi-vendor ecosystems."
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 glass-card rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Process Section */}
      <section ref={processRef} className="sections py-24 px-6 lg:px-12 bg-muted">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={fadeUp}
          initial="initial"
          animate={processInView ? "animate" : "initial"}
        >
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-4 text-center">✦ Our Process</p>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-center mb-16">
            Structured Development for Predictable Outcomes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card rounded-2xl p-7 text-center">
              <div className="text-gradient text-6xl font-display font-bold mb-4">01</div>
              <h3 className="text-xl font-heading font-semibold mb-3">Discovery & Strategy</h3>
              <p className="text-muted-foreground">Requirements gathering, market analysis, and solution architecture definition.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 text-center">
              <div className="text-gradient text-6xl font-display font-bold mb-4">02</div>
              <h3 className="text-xl font-heading font-semibold mb-3">Design & Prototyping</h3>
              <p className="text-muted-foreground">User experience (UX) and user interface (UI) design, wireframing, and interactive prototypes.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 text-center">
              <div className="text-gradient text-6xl font-display font-bold mb-4">03</div>
              <h3 className="text-xl font-heading font-semibold mb-3">Development & Integration</h3>
              <p className="text-muted-foreground">Agile development sprints, rigorous quality assurance, and seamless third-party API integration.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 text-center">
              <div className="text-gradient text-6xl font-display font-bold mb-4">04</div>
              <h3 className="text-xl font-heading font-semibold mb-3">Deployment & Support</h3>
              <p className="text-muted-foreground">Cloud deployment, continuous monitoring, performance optimization, and post-launch maintenance.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Us Section */}
      <section ref={whyUsRef} className="sections py-24 px-6 lg:px-12">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={fadeUp}
          initial="initial"
          animate={whyUsInView ? "animate" : "initial"}
        >
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-4 text-center">✦ Why FourIQ Tech</p>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-center mb-16">
            Your Trusted Partner for SaaS Innovation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-7 text-center">
              <h3 className="text-xl font-heading font-semibold mb-3">Expert Team</h3>
              <p className="text-muted-foreground">Dedicated senior architects and full-stack engineers with extensive SaaS domain expertise.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 text-center">
              <h3 className="text-xl font-heading font-semibold mb-3">Agile Methodology</h3>
              <p className="text-muted-foreground">Transparent, iterative development cycles ensuring rapid delivery and adaptive flexibility.</p>
            </div>
            <div className="glass-card rounded-2xl p-7 text-center">
              <h3 className="text-xl font-heading font-semibold mb-3">Security-First Approach</h3>
              <p className="text-muted-foreground">Proactive implementation of industry-leading security measures and strict regulatory compliance.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="sections py-24 px-6 lg:px-12 bg-muted">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={fadeUp}
          initial="initial"
          animate={faqInView ? "animate" : "initial"}
        >
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-4 text-center">✦ FAQ</p>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What is custom SaaS development?",
                a: "Custom SaaS development involves building cloud-based software tailored precisely to an organization's unique operational requirements and business models, offering distinct advantages over off-the-shelf solutions."
              },
              {
                q: "How long does custom SaaS development take?",
                a: "Project timelines vary based on complexity, features, and integrations, typically ranging from 4-6 months for an MVP to 12+ months for comprehensive enterprise solutions."
              },
              {
                q: "What are the key benefits of a custom SaaS solution?",
                a: "Benefits include enhanced operational efficiency, competitive differentiation, superior scalability, robust security controls, and reduced long-term total cost of ownership (TCO)."
              },
              {
                q: "What technologies do you use for custom SaaS development?",
                a: "We utilize modern stacks including React, Node.js, Python/Django, Ruby on Rails, Go, along with cloud platforms like AWS, Azure, and GCP, leveraging Docker and Kubernetes for containerization."
              },
              {
                q: "How do you ensure the security of a custom SaaS platform?",
                a: "Security is embedded throughout the SDLC: end-to-end encryption, secure coding practices, regular vulnerability assessments, penetration testing, and compliance with industry standards like GDPR, HIPAA, SOC 2."
              },
            ].map((item, index) => (
              <div key={index} className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-heading font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="sections py-24 px-6 lg:px-12 text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={fadeUp}
          initial="initial"
          animate={ctaInView ? "animate" : "initial"}
        >
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-4">✦ Get Started</p>
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to Transform Your Business with Custom SaaS?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Connect with our experts to discuss your vision and build a future-proof cloud solution.
          </p>
          <Link to="/contact" className="bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box py-4 px-8 inline-flex items-center group">
            Get a Free Consultation <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}