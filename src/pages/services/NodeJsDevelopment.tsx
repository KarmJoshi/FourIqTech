import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, ArrowRight, CheckCircle2, Zap, Database, Package, Server, Clock, Settings, ShieldCheck, Users, Award, Lightbulb, ChevronDown, MonitorDot
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Expert Node.js Development Services",
  "serviceType": "Node.js Development",
  "provider": {
    "@type": "Organization",
    "name": "FourIQ Tech",
    "url": "https://fouriqtech.com"
  },
  "description": "FourIQ Tech offers expert Node.js development services for building scalable, high-performance web applications and APIs. Partner with us for robust enterprise solutions.",
  "url": "https://fouriqtech.com/services/node-js-development",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Node.js Development Offerings",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Node.js Application Development"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Node.js API Development & Integration"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Microservices Architecture with Node.js"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Real-time Application Development (WebSockets)"
        }
      }
    ]
  }
};

export default function NodeJsDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);
  }, [setScrollLocked]);

  const heroRef = useRef(null);
  const metricsRef = useRef(null);
  const capabilitiesRef = useRef(null);
  const useCasesRef = useRef(null);
  const processRef = useRef(null);
  const whyUsRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-80px' });
  const metricsInView = useInView(metricsRef, { once: true, margin: '-80px' });
  const capabilitiesInView = useInView(capabilitiesRef, { once: true, margin: '-80px' });
  const useCasesInView = useInView(useCasesRef, { once: true, margin: '-80px' });
  const processInView = useInView(processRef, { once: true, margin: '-80px' });
  const whyUsInView = useInView(whyUsRef, { once: true, margin: '-80px' });
  const faqInView = useInView(faqRef, { once: true, margin: '-80px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' });

  return (
    <>
      <SEO
        title="Expert Node.js Development Services | FourIQ Tech"
        description="FourIQ Tech offers expert Node.js development services for building scalable, high-performance web applications and APIs. Partner with us for robust enterprise solutions."
        url="https://fouriqtech.com/services/node-js-development"
        schema={serviceSchema}
      />
      <Navbar isVisible={navVisible} />
      <main className="relative bg-background text-foreground">

        {/* Hero Section */}
        <section className="pt-36 pb-24 relative overflow-hidden grid-pattern">
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10"
          >
            <div className="absolute liquid-blob h-96 w-96 bg-primary/[0.06] blur-[120px] top-10 -left-20 animate-blob-bounce-1"></div>
            <div className="absolute liquid-blob-2 h-80 w-80 bg-primary/[0.06] blur-[120px] bottom-20 -right-20 animate-blob-bounce-2"></div>
            <p className="text-primary uppercase tracking-[0.2em] font-display mb-4">
              ✦ Scalable Backend Solutions
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight glow-text">
              Expert Node.js Development Services for <span className="text-gradient">Scalable Enterprise</span> Applications
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mb-10">
              FourIQ Tech delivers high-performance Node.js solutions tailored for complex enterprise environments. We build robust, real-time applications and APIs that drive business growth.
            </p>
            <div className="flex space-x-4">
              <Link to="/contact" className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-lg font-display glow-box transition-all duration-300 hover:scale-105 flex items-center">
                Start a Project <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/services" className="px-8 py-3 border border-white/20 text-foreground rounded-full text-lg font-display transition-all duration-300 hover:bg-white/10 hover:border-white/30 flex items-center">
                Explore All Services <ArrowUpRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Metrics Bar */}
        <section className="py-24 px-6 lg:px-12 bg-white/[0.01]">
          <motion.div
            ref={metricsRef}
            initial="hidden"
            animate={metricsInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { num: "99.9%", label: "Uptime SLA" },
              { num: "150+", label: "Node.js Projects" },
              { num: "40%", label: "Faster Development" },
              { num: "2M+", label: "API Requests/Sec" },
            ].map((metric, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } }
                }}
                className="glass-card p-6 text-center"
              >
                <p className="text-4xl font-display text-gradient mb-2">{metric.num}</p>
                <p className="text-muted-foreground">{metric.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Capabilities */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5">
          <motion.div
            ref={capabilitiesRef}
            initial="hidden"
            animate={capabilitiesInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Core <span className="text-gradient">Node.js Capabilities</span> We Deliver
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Real-time Applications", description: "Build interactive chat, streaming, and collaborative tools using WebSockets and event-driven architecture." },
                { icon: Database, title: "Scalable APIs & Microservices", description: "Design and implement high-performance RESTful and GraphQL APIs, optimized for microservices deployment." },
                { icon: Package, title: "Custom Web Applications", description: "Develop robust and feature-rich web applications, from dashboards to complex enterprise portals." },
                { icon: Server, title: "Backend for Frontend (BFF)", description: "Construct tailored backend layers for specific frontend experiences, optimizing data delivery and performance." },
                { icon: Settings, title: "Serverless Node.js", description: "Deploy cost-effective, auto-scaling Node.js functions on AWS Lambda, Google Cloud Functions, and Azure Functions." },
                { icon: MonitorDot, title: "IoT Backend & Data Streams", description: "Develop efficient backends for IoT devices, managing data ingestion, processing, and real-time analytics." },
              ].map((cap, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { delay: i * 0.08 } }
                  }}
                  className="glass-card p-8 flex flex-col items-start"
                >
                  <div className="bg-primary/10 text-primary p-3 rounded-xl mb-4">
                    <cap.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{cap.title}</h3>
                  <p className="text-muted-foreground">{cap.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Use Cases */}
        <section className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-white/5">
          <motion.div
            ref={useCasesRef}
            initial="hidden"
            animate={useCasesInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <p className="text-primary uppercase tracking-[0.2em] font-display mb-4">
                Solutions Across Industries
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Node.js Powers <span className="text-gradient">Diverse Applications</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Node.js excels in environments requiring high concurrency and real-time data processing. We build solutions that meet these demands, ensuring performance and reliability for critical systems.
              </p>
              <Link to="/contact" className="text-primary hover:text-primary/80 flex items-center font-display">
                Discuss Your Use Case <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-6">
              {[
                "Data Streaming & Analytics Platforms",
                "E-commerce Backend & APIs",
                "Content Management Systems (CMS)",
                "Fintech & Banking Solutions",
                "Healthcare & Pharma Applications",
                "Logistics & Supply Chain Management",
              ].map((useCase, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: { opacity: 1, x: 0, transition: { delay: i * 0.07 } }
                  }}
                  className="glass-card p-5 flex items-center space-x-4"
                >
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <p className="text-lg font-medium">{useCase}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Process */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5">
          <motion.div
            ref={processRef}
            initial="hidden"
            animate={processInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Our <span className="text-gradient">Node.js Development</span> Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Discovery & Strategy", desc: "We align on project goals, technical requirements, and establish a clear roadmap for execution.", num: 1 },
                { title: "Architecture & Design", desc: "Our architects design scalable, secure, and maintainable Node.js systems, planning module interactions.", num: 2 },
                { title: "Development & Testing", desc: "Agile teams implement features, perform rigorous unit, integration, and performance testing.", num: 3 },
                { title: "Deployment & Support", desc: "Solutions are deployed to production with robust monitoring, followed by ongoing maintenance and optimization.", num: 4 },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } }
                  }}
                  className="glass-card p-8 relative overflow-hidden"
                >
                  <span className="absolute top-0 right-0 text-6xl font-display text-primary/10 -mt-2 -mr-2 select-none">{step.num}</span>
                  <h3 className="text-2xl font-semibold mb-3 pr-10">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Why Us */}
        <section className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-white/5">
          <motion.div
            ref={whyUsRef}
            initial="hidden"
            animate={whyUsInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <p className="text-primary uppercase tracking-[0.2em] font-display mb-4">
                Our Differentiators
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Partner with FourIQ Tech for <span className="text-gradient">Node.js Excellence</span>?
              </h2>
              <div className="space-y-8">
                {[
                  { icon: ShieldCheck, title: "Enterprise-Grade Security", desc: "We build with security-first principles, protecting your data and applications." },
                  { icon: Users, title: "Experienced Engineering Teams", desc: "Our Node.js developers are senior-level experts with a track record of delivering complex projects." },
                  { icon: Award, title: "Performance & Optimization Focus", desc: "Applications are engineered for speed, low latency, and efficient resource utilization." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { delay: i * 0.1 } }
                    }}
                    className="flex items-start space-x-4"
                  >
                    <div className="bg-primary/10 text-primary p-3 rounded-xl flex-shrink-0">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
              }}
              className="glass-modern p-10 relative overflow-hidden"
            >
              <h3 className="text-3xl font-bold text-gradient mb-6 leading-tight">
                "We architect Node.js solutions for peak efficiency, handling millions of concurrent requests without compromise."
              </h3>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <p className="text-4xl font-display text-primary mb-1">10+</p>
                  <p className="text-muted-foreground">Years in Node.js</p>
                </div>
                <div>
                  <p className="text-4xl font-display text-primary mb-1">95%</p>
                  <p className="text-muted-foreground">Client Retention</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5">
          <motion.div
            ref={faqRef}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              {[
                {
                  q: "What is Node.js and why is it suitable for enterprise applications?",
                  a: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It excels in non-blocking, event-driven I/O, making it ideal for scalable network applications. For enterprises, Node.js provides high performance for microservices, real-time data processing, and APIs, supporting concurrent user loads efficiently."
                },
                {
                  q: "What types of applications can be built with Node.js?",
                  a: "Node.js is versatile. We build a range of applications including RESTful APIs, microservices, real-time chat applications, data streaming platforms, IoT backends, serverless functions, and complex web applications requiring high throughput and low latency."
                },
                {
                  q: "How does Node.js handle scalability compared to other technologies?",
                  a: "Node.js achieves high scalability through its non-blocking, asynchronous architecture. It efficiently handles many concurrent connections with a single thread using an event loop. This allows it to outperform traditional multi-threaded servers in I/O-bound operations, making it highly effective for scalable enterprise systems."
                },
                {
                  q: "What is FourIQ Tech's experience with Node.js development?",
                  a: "FourIQ Tech has over a decade of specialized experience in Node.js development. Our teams have delivered over 150 Node.js projects for various industries, including fintech, healthcare, e-commerce, and logistics, consistently building robust and high-performing solutions."
                },
                {
                  q: "How long does a typical Node.js project take to develop?",
                  a: "Project timelines vary based on complexity, scope, and specific features. A typical Node.js project can range from 3 months for a focused API development to 9-12+ months for large-scale enterprise applications with extensive integrations. We provide detailed timelines after the discovery phase."
                },
              ].map((item, i) => (
                <motion.details
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { delay: i * 0.07 } }
                  }}
                  className="group glass-card p-6"
                >
                  <summary className="flex justify-between items-center cursor-pointer text-lg font-semibold text-foreground hover:text-primary transition-colors">
                    {item.q}
                    <ChevronDown className="h-5 w-5 transform transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-4 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                </motion.details>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 lg:px-12 relative overflow-hidden liquid-bg">
          <motion.div
            ref={ctaRef}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="max-w-7xl mx-auto text-center relative z-10"
          >
            <div className="absolute h-96 w-96 bg-primary/[0.08] blur-[150px] rounded-full -top-10 left-1/2 -translate-x-1/2 animate-pulse-slow"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative">
              Ready to Build Your Next <span className="text-gradient">Node.js Application</span>?
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto mb-10">
              Partner with FourIQ Tech to architect and develop high-performance Node.js solutions that drive your business forward.
            </p>
            <Link to="/contact" className="px-10 py-4 bg-primary text-primary-foreground rounded-full text-xl font-display glow-box transition-all duration-300 hover:scale-105 inline-flex items-center">
              Get Started Today <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </motion.div>
        </section>

      </main>
      <Footer />
    </>
  );
}