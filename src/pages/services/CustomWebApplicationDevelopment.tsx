import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, CheckCircle2, Monitor, Code, Database, Server, Settings, Shield, Workflow, Layers, Hourglass, DollarSign, Cloud, Scale, Lightbulb } from 'lucide-react'; // Added more relevant icons

const fadeUp = { hidden: { opacity: 0, y: 30, filter: 'blur(6px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Custom Web Application Development Services",
  "description": "FourIQ Tech provides custom web application development services, building secure, scalable, and intuitive web solutions for global startups and enterprises. We deliver tailored software that meets specific business objectives and drives innovation.",
  "url": "https://fouriqtech.com/services/custom-web-application-development",
  "serviceType": "Web Application Development",
  "provider": {
    "@type": "Organization",
    "name": "FourIQ Tech",
    "url": "https://fouriqtech.com"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "Contact for Quote",
    "areaServed": {
      "@type": "Place",
      "name": "Global"
    }
  }
};

export default function CustomWebApplicationDevelopment() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
    window.scrollTo(0, 0);
  }, [setScrollLocked]);

  const sectionRefs = {
    hero: useRef(null),
    metrics: useRef(null),
    capabilities: useRef(null),
    useCases: useRef(null),
    process: useRef(null),
    whyUs: useRef(null),
    faq: useRef(null),
    cta: useRef(null),
  };

  const inViewStates = {
    hero: useInView(sectionRefs.hero, { once: true, margin: '-80px' }),
    metrics: useInView(sectionRefs.metrics, { once: true, margin: '-80px' }),
    capabilities: useInView(sectionRefs.capabilities, { once: true, margin: '-80px' }),
    useCases: useInView(sectionRefs.useCases, { once: true, margin: '-80px' }),
    process: useInView(sectionRefs.process, { once: true, margin: '-80px' }),
    whyUs: useInView(sectionRefs.whyUs, { once: true, margin: '-80px' }),
    faq: useInView(sectionRefs.faq, { once: true, margin: '-80px' }),
    cta: useInView(sectionRefs.cta, { once: true, margin: '-80px' }),
  };

  return (
    <>
      <SEO
        title="Custom Web Application Development Services | FourIQ Tech"
        description="Unlock tailored innovation with FourIQ Tech's custom web application development services. We build secure, scalable, and intuitive web solutions for global startups and enterprises. Get a free consultation today."
        url="https://fouriqtech.com/services/custom-web-application-development"
        schema={serviceSchema}
      />
      <Navbar isVisible={navVisible} />
      <main className="bg-background text-foreground">
        {/* Section 1: HERO */}
        <section ref={sectionRefs.hero} className="relative overflow-hidden pt-36 pb-24 px-6 lg:px-12 grid-pattern">
          <motion.div
            className="max-w-7xl mx-auto text-center relative z-10"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.hero ? 'visible' : 'hidden'}
          >
            <div className="absolute liquid-blob bg-primary/[0.06] blur-[120px] w-80 h-80 -top-20 -left-20"></div>
            <div className="absolute liquid-blob-2 bg-primary/[0.06] blur-[120px] w-96 h-96 -bottom-20 -right-20"></div>

            <p className="text-primary uppercase tracking-[0.2em] font-display mb-4">✦ SOLUTIONS FOR THE MODERN WEB ✦</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 glow-text">
              Building <span className="text-gradient">Exceptional</span> Custom Web Applications
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto mb-10">
              FourIQ Tech engineers robust, scalable, and intuitive web solutions designed precisely for your business objectives. From complex enterprise platforms to innovative startup tools, we deliver performance and security.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/contact" className="px-8 py-3 bg-primary text-primary-foreground rounded-full text-lg font-display glow-box flex items-center gap-2">
                Get a Free Consultation <ArrowRight size={20} />
              </Link>
              <Link to="/services" className="px-8 py-3 border border-white/20 text-foreground rounded-full text-lg font-display hover:border-primary transition-colors flex items-center gap-2">
                Explore All Services <ArrowUpRight size={20} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Section 2: METRICS BAR */}
        <section ref={sectionRefs.metrics} className="py-24 px-6 lg:px-12">
          <motion.div
            className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.metrics ? 'visible' : 'hidden'}
            transition={{ staggerChildren: 0.1 }}
          >
            {[
              { number: '100+', label: 'Projects Completed' },
              { number: '98%', label: 'Client Retention' },
              { number: '15+', label: 'Years Experience' },
              { number: '1.2M+', label: 'User Engagements' },
            ].map((metric, i) => (
              <motion.div variants={fadeUp} key={i} className="glass-card p-8 text-center">
                <p className="text-4xl font-display text-gradient font-bold mb-2">{metric.number}</p>
                <p className="text-muted-foreground">{metric.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Section 3: CAPABILITIES */}
        <section ref={sectionRefs.capabilities} className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-b border-white/5">
          <motion.div
            className="max-w-7xl mx-auto"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.capabilities ? 'visible' : 'hidden'}
          >
            <h2 className="text-4xl font-bold text-center mb-16">
              Core <span className="text-gradient">Capabilities</span> in Custom Web Development
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={fadeUp}
              initial="hidden"
              animate={inViewStates.capabilities ? 'visible' : 'hidden'}
              transition={{ staggerChildren: 0.1 }}
            >
              {[
                { icon: Code, title: 'Full-Stack Development', description: 'From front-end interfaces to robust back-end systems and databases.' },
                { icon: Workflow, title: 'API Integration', description: 'Connecting your applications with third-party services and critical data sources.' },
                { icon: Layers, title: 'Scalable Architectures', description: 'Designing for growth, ensuring your application performs under heavy load.' },
                { icon: Shield, title: 'Security & Compliance', description: 'Implementing industry-best security protocols and data protection standards.' },
                { icon: Monitor, title: 'UX/UI Engineering', description: 'Crafting intuitive and engaging user experiences for complex systems.' },
                { icon: Server, title: 'Cloud Infrastructure', description: 'Deploying and managing applications on leading cloud platforms like AWS or Azure.' },
              ].map((capability, i) => (
                <motion.div variants={fadeUp} key={i} className="glass-card p-6 flex flex-col items-start text-left">
                  <div className="bg-primary/10 text-primary p-3 rounded-xl mb-4">
                    <capability.icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{capability.title}</h3>
                  <p className="text-muted-foreground">{capability.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Section 4: USE CASES */}
        <section ref={sectionRefs.useCases} className="py-24 px-6 lg:px-12">
          <motion.div
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.useCases ? 'visible' : 'hidden'}
          >
            <div>
              <p className="text-primary uppercase tracking-[0.2em] font-display mb-4">APPLICATIONS WE BUILD</p>
              <h2 className="text-4xl font-bold mb-6">
                Tailored Solutions for <span className="text-gradient">Diverse Industry Needs</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our custom web applications power innovation across various sectors. We engineer systems that streamline operations, enhance user engagement, and provide critical data insights, driving tangible business outcomes.
              </p>
              <Link to="/portfolio" className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Explore our portfolio <ArrowRight size={20} />
              </Link>
            </div>
            <motion.div
              className="grid grid-cols-1 gap-4"
              variants={fadeUp}
              initial="hidden"
              animate={inViewStates.useCases ? 'visible' : 'hidden'}
              transition={{ staggerChildren: 0.08 }}
            >
              {[
                'Enterprise Resource Planning (ERP)',
                'Customer Relationship Management (CRM)',
                'E-commerce Platforms',
                'Data Analytics Dashboards',
                'Booking & Reservation Systems',
                'Internal Operations Tools',
              ].map((useCase, i) => (
                <motion.div variants={fadeUp} key={i} className="glass-card p-5 flex items-center gap-4">
                  <CheckCircle2 size={24} className="text-gold" />
                  <p className="text-lg">{useCase}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Section 5: PROCESS */}
        <section ref={sectionRefs.process} className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-b border-white/5">
          <motion.div
            className="max-w-7xl mx-auto"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.process ? 'visible' : 'hidden'}
          >
            <h2 className="text-4xl font-bold text-center mb-16">
              Our <span className="text-gradient">Structured</span> Development Process
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={fadeUp}
              initial="hidden"
              animate={inViewStates.process ? 'visible' : 'hidden'}
              transition={{ staggerChildren: 0.1 }}
            >
              {[
                { num: '01', title: 'Discovery & Strategy', description: 'We define project scope, technical requirements, and strategic goals through in-depth consultations.' },
                { num: '02', title: 'Design & Architecture', description: 'Our team crafts user flows, interface designs, and a robust technical architecture for scalability.' },
                { num: '03', title: 'Development & Testing', description: 'Agile development sprints, continuous integration, and rigorous testing ensure quality and performance.' },
                { num: '04', title: 'Deployment & Support', description: 'Seamless launch, ongoing monitoring, and dedicated maintenance with continuous updates.' },
              ].map((step, i) => (
                <motion.div variants={fadeUp} key={i} className="glass-card relative p-8">
                  <p className="text-6xl font-display text-primary/10 absolute top-4 right-4">{step.num}</p>
                  <h3 className="text-xl font-semibold mb-3 pr-10">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Section 6: WHY US */}
        <section ref={sectionRefs.whyUs} className="py-24 px-6 lg:px-12">
          <motion.div
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.whyUs ? 'visible' : 'hidden'}
          >
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inViewStates.whyUs ? 'visible' : 'hidden'}
              transition={{ staggerChildren: 0.1 }}
            >
              <h2 className="text-4xl font-bold mb-8">
                Why Partner with <span className="text-gradient">FourIQ Tech</span>?
              </h2>
              {[
                { icon: Lightbulb, title: 'Engineering Excellence', description: 'Our solutions are built on a foundation of clean code, robust architecture, and best practices.' },
                { icon: Scale, title: 'Strategic Partnership', description: 'We collaborate closely, integrating as an extension of your in-house technical team.' },
                { icon: Cloud, title: 'Future-Proof Technology', description: 'We utilize modern, scalable technologies to ensure longevity and adaptability for your business.' },
              ].map((reason, i) => (
                <motion.div variants={fadeUp} key={i} className="flex items-start gap-4 mb-8 last:mb-0">
                  <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0">
                    <reason.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{reason.title}</h3>
                    <p className="text-muted-foreground">{reason.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="glass-modern p-8">
              <p className="text-3xl font-bold mb-6 text-gradient leading-tight">
                We engineer for performance, security, and long-term value.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-gold" />
                  <span className="font-semibold">99.9% Uptime Guarantee</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-gold" />
                  <span className="font-semibold">Dedicated Senior Developers</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-gold" />
                  <span className="font-semibold">Transparent Communication</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-gold" />
                  <span className="font-semibold">Post-Deployment Support</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </section>

        {/* Section 7: FAQ */}
        <section ref={sectionRefs.faq} className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-b border-white/5">
          <motion.div
            className="max-w-3xl mx-auto"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.faq ? 'visible' : 'hidden'}
          >
            <h2 className="text-4xl font-bold text-center mb-16">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'What exactly is custom web application development?',
                  a: 'Custom web application development involves building bespoke software solutions tailored to specific business requirements, rather than using off-the-shelf products. This approach ensures precise functionality, optimal integration, and a unique user experience for your organization.',
                },
                {
                  q: 'How long does custom web app development take?',
                  a: 'Development timelines vary significantly based on complexity, features, and integration needs. A typical project can range from 3 months for simpler applications to over 12 months for complex enterprise systems. We provide a detailed timeline after initial discovery.',
                },
                {
                  q: 'What technologies does FourIQ Tech use for custom web apps?',
                  a: 'We select technologies based on project requirements, performance needs, and scalability goals. Our stack often includes React, Next.js, Node.js, Python/Django, Ruby on Rails for front-end and back-end, and PostgreSQL, MongoDB for databases. We deploy on AWS, Google Cloud, or Azure.',
                },
                {
                  q: 'Is custom web application development more expensive than off-the-shelf software?',
                  a: 'While initial investment for custom solutions can be higher, they typically offer significant long-term savings and greater ROI. Custom apps avoid licensing fees, integrate better with existing systems, and provide exact functionality, eliminating unnecessary features and costs associated with adapting generic software.',
                },
                {
                  q: 'Why should I choose FourIQ Tech for my custom web application needs?',
                  a: 'FourIQ Tech delivers engineering excellence, strategic partnership, and future-proof solutions. Our senior development team focuses on robust architecture, security, and transparent communication, ensuring your custom application is a strategic asset built for scale and performance.',
                },
              ].map((item, i) => (
                <motion.details
                  variants={fadeUp}
                  key={i}
                  className="glass-card p-6 rounded-lg group"
                >
                  <summary className="flex justify-between items-center cursor-pointer text-xl font-semibold text-foreground hover:text-primary transition-colors">
                    {item.q}
                    <ArrowRight size={24} className="transform transition-transform duration-300 group-open:rotate-90 text-primary" />
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{item.a}</p>
                </motion.details>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 8: CTA */}
        <section ref={sectionRefs.cta} className="py-24 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 liquid-bg z-0"></div>
          <div className="absolute liquid-blob bg-primary/[0.08] blur-[150px] w-[500px] h-[500px] -top-1/2 -left-1/4 animate-blob-bounce-1"></div>
          <motion.div
            className="max-w-4xl mx-auto text-center relative z-10"
            variants={fadeUp}
            initial="hidden"
            animate={inViewStates.cta ? 'visible' : 'hidden'}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to build your next <span className="text-gradient">digital product</span>?
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10">
              Speak with our expert engineers about your project requirements and receive a tailored proposal designed for innovation and impact.
            </p>
            <Link to="/contact" className="px-10 py-4 bg-primary text-primary-foreground rounded-full text-xl font-display glow-box flex items-center justify-center gap-3 mx-auto max-w-fit">
              Start Your Project <ArrowRight size={24} />
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}