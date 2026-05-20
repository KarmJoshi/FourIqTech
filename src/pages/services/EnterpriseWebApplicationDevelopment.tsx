import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Rocket, 
  Shield, 
  Activity, 
  Globe, 
  Database, 
  Server, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Box, 
  Cpu, 
  Layout, 
  MessageSquare, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw,
  Zap
} from 'lucide-react';

// --- SEO Schema Components ---

const ServiceSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Enterprise Web Application Development",
    "provider": {
      "@type": "Organization",
      "name": "FourIQ Tech",
      "url": "https://fouriq.tech"
    },
    "description": "FourIQ Tech is a leading enterprise web application development company. We build scalable, secure, and high-performance custom web solutions for global firms.",
    "areaServed": "Global",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Enterprise Development Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Micro-Frontend Architecture"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Legacy System Modernization"
          }
        }
      ]
    }
  };
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
};

const FaqSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the role of an enterprise web application development company?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An enterprise web application development company designs and builds large-scale software solutions tailored to complex business needs. They focus on scalability, security, and integration with existing corporate systems to ensure long-term stability."
        }
      },
      {
        "@type": "Question",
        "name": "How do you handle performance for apps with large datasets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We utilize advanced React virtualization techniques and optimized state management to ensure smooth rendering. By moving beyond basic virtualization, we enable enterprise apps to handle millions of records without sacrificing user experience."
        }
      },
      {
        "@type": "Question",
        "name": "Why use micro-frontends for enterprise applications?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Micro-frontends allow large teams to work independently on different parts of an application. This architecture solves the deployment coupling trap, enabling faster releases and more resilient codebase maintenance."
        }
      },
      {
        "@type": "Question",
        "name": "What security standards do you follow for custom enterprise software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We adhere to OWASP security principles, implement robust OAuth2/OpenID Connect authentication, and ensure data encryption at rest and in transit. Our development process includes regular security audits and vulnerability scanning."
        }
      }
    ]
  };
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
};

// --- UI Components ---

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-amber-500 transition-colors"
      >
        <span className="text-lg font-semibold pr-8 leading-snug">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const EnterpriseWebApplicationDevelopment = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-amber-500/30">
      <Helmet>
        <title>Enterprise Web Application Development Company | FourIQ Tech</title>
        <meta name="description" content="FourIQ Tech is a leading enterprise web application development company. We build scalable, secure, and high-performance custom web solutions for global firms." />
        <link rel="canonical" href="https://fouriq.tech/services/enterprise-web-application-development" />
      </Helmet>
      
      <ServiceSchema />
      <FaqSchema />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" /> Leading Enterprise Solutions
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Enterprise Web Application Development Company: Scale Your Digital Infrastructure
            </h1>
            <p className="text-xl md:text-2xl font-light text-slate-400 mb-10 leading-relaxed max-w-3xl">
              Architecting Future-Proof Digital Ecosystems for Global Enterprises. We build for speed, security, and extreme scalability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                Book a Technical Consultation <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-[#080d1a]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
                The High Cost of Legacy Bottlenecks and Deployment Coupling
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Monolithic architectures and outdated tech stacks often lead to the 'deployment coupling trap,' where small changes break global systems. Many enterprises struggle with rendering large datasets and maintaining performance across fragmented teams.
              </p>
              <button className="text-amber-500 font-bold flex items-center gap-2 hover:gap-3 transition-all border-b-2 border-amber-500/0 hover:border-amber-500 pb-1">
                Learn About Our Architecture Approach <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: AlertTriangle, title: "Deployment Traps", text: "Small updates causing system-wide failures." },
                { icon: ZapOff, title: "Latency Issues", text: "Poor performance in data-heavy modules." },
                { icon: Layers, title: "Monolithic Bloat", text: "Codebases that are impossible to maintain." },
                { icon: RefreshCw, title: "Inefficient Cycles", text: "Slow time-to-market for critical updates." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <item.icon className="w-8 h-8 text-amber-500 mb-4" />
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Decoupled, High-Performance Micro-Frontend Solutions</h2>
            <p className="text-slate-400 leading-relaxed">
              As a specialized enterprise web application development company, we implement micro-frontend patterns and advanced virtualization to ensure your platform remains fast and maintainable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Box,
                title: "Micro-Frontend Patterns",
                description: "Modular development that allows teams to deploy independently without risking system stability."
              },
              {
                icon: Activity,
                title: "Advanced Virtualization",
                description: "Optimized rendering techniques for massive datasets, ensuring sub-second interactions."
              },
              {
                icon: Shield,
                title: "Cloud-Native Security",
                description: "Built-in security protocols for global compliance and data protection across all layers."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-amber-500/30 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">{feature.description}</p>
                <button className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                  View Technical Methodology <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-[#020617] to-[#080d1a]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square rounded-3xl bg-amber-500/10 flex flex-col items-center justify-center p-6 text-center border border-amber-500/20">
                    <Cpu className="w-10 h-10 text-amber-500 mb-4" />
                    <span className="font-bold">Edge Runtime</span>
                  </div>
                  <div className="aspect-square rounded-3xl bg-blue-500/10 flex flex-col items-center justify-center p-6 text-center border border-blue-500/20">
                    <Globe className="w-10 h-10 text-blue-500 mb-4" />
                    <span className="font-bold">Global Scale</span>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="aspect-square rounded-3xl bg-slate-500/10 flex flex-col items-center justify-center p-6 text-center border border-slate-500/20">
                    <Database className="w-10 h-10 text-slate-300 mb-4" />
                    <span className="font-bold">Distributed State</span>
                  </div>
                  <div className="aspect-square rounded-3xl bg-orange-500/10 flex flex-col items-center justify-center p-6 text-center border border-orange-500/20">
                    <Server className="w-10 h-10 text-orange-500 mb-4" />
                    <span className="font-bold">CI/CD Pipeline</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Enterprise-Grade Features for Mission-Critical Apps</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our applications feature Micro-Frontend architecture for team autonomy, optimized virtualization for massive dataset rendering, and robust security protocols. We integrate seamless state management and automated CI/CD pipelines as standard practice.
              </p>
              <ul className="space-y-4 mb-10">
                {["Modular Design", "Seamless Integration", "Real-time Analytics", "Secure Data Flow"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    <span className="text-slate-200 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="px-8 py-3 rounded-xl border border-white/20 font-bold hover:bg-white/5 transition-colors">
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Agile Enterprise Development Lifecycle</h2>
            <p className="text-slate-400">A rigorous 4-step framework designed for speed and reliability.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Strategic Discovery", desc: "Technical auditing and requirement mapping." },
              { step: "02", title: "Architectural Design", desc: "Prototype design and system schema creation." },
              { step: "03", title: "Iterative Development", desc: "Agile sprints with bi-weekly review cycles." },
              { step: "04", title: "DevOps Orchestration", desc: "Automated testing and cloud deployment." }
            ].map((item, i) => (
              <div key={i} className="relative group p-8 rounded-3xl border border-white/5 hover:border-amber-500/20 bg-white/5">
                <div className="text-5xl font-black text-white/5 mb-6 group-hover:text-amber-500/10 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
             <button className="font-bold text-amber-500 flex items-center gap-2 mx-auto hover:gap-3 transition-all">
               See Our Process <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-24 bg-[#0f172a]/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Proven Results: Scaling Enterprise Velocity</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                We have helped clients achieve a 40% reduction in deployment times through micro-frontend optimization and improved front-end rendering speeds by 3x when handling millions of data points.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-white mb-1">40%</div>
                  <p className="text-sm text-amber-500 uppercase tracking-widest font-bold">Reduction in Deployment Time</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-1">3X</div>
                  <p className="text-sm text-amber-500 uppercase tracking-widest font-bold">Rendering Velocity Improvement</p>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl relative overflow-hidden group">
              <BarChart3 className="absolute -bottom-4 -right-4 w-48 h-48 text-white/10 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="text-2xl font-bold mb-6 relative z-10 text-white">Scaleups powered by our solutions.</h3>
              <p className="text-white/80 text-lg mb-8 relative z-10 leading-relaxed">
                "FourIQ Tech didn't just build us a web app; they re-architected our entire team's delivery model. The micro-frontend approach is a game-changer for our scale."
              </p>
              <button className="px-6 py-3 bg-white text-[#020617] font-bold rounded-lg relative z-10 flex items-center gap-2 hover:bg-slate-100 transition-colors">
                Read Case Studies <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Common questions about our enterprise development services, technical stack, and engagement models.
              </p>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <MessageSquare className="w-8 h-8 text-amber-500 mb-4" />
                <p className="text-sm font-semibold mb-2">Still have questions?</p>
                <button className="text-amber-500 font-bold hover:underline">Get More Answers</button>
              </div>
            </div>
            <div className="lg:col-span-2">
              <FaqItem 
                question="What is the role of an enterprise web application development company?" 
                answer="An enterprise web application development company designs and builds large-scale software solutions tailored to complex business needs. They focus on scalability, security, and integration with existing corporate systems to ensure long-term stability."
              />
              <FaqItem 
                question="How do you handle performance for apps with large datasets?" 
                answer="We utilize advanced React virtualization techniques and optimized state management to ensure smooth rendering. By moving beyond basic virtualization, we enable enterprise apps to handle millions of records without sacrificing user experience."
              />
              <FaqItem 
                question="Why use micro-frontends for enterprise applications?" 
                answer="Micro-frontends allow large teams to work independently on different parts of an application. This architecture solves the deployment coupling trap, enabling faster releases and more resilient codebase maintenance."
              />
              <FaqItem 
                question="What security standards do you follow for custom enterprise software?" 
                answer="We adhere to OWASP security principles, implement robust OAuth2/OpenID Connect authentication, and ensure data encryption at rest and in transit. Our development process includes regular security audits and vulnerability scanning."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center p-12 md:p-20 rounded-[3rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Ready to Modernize Your Enterprise Application?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Partner with a technical enterprise web application development company that understands the complexities of scale. Let's discuss your architectural needs and build a roadmap.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-amber-500/20">
                Start Your Project
              </button>
              <button className="px-10 py-5 bg-transparent border border-white/20 text-white font-bold rounded-2xl hover:bg-white/5 transition-all">
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links/Footer Info */}
      <footer className="py-12 border-t border-white/5 bg-[#020617]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} FourIQ Tech. Enterprise Architecture Specialists.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <a href="/blog/sharing-state-between-micro-frontends-architectural-patterns" className="hover:text-amber-500 transition-colors">Micro-Frontend Patterns</a>
              <a href="/blog/react-large-dataset-rendering-performance-optimization" className="hover:text-amber-500 transition-colors">Large Dataset Optimization</a>
              <a href="/blog/micro-frontend-performance-optimization-enterprise-case-study" className="hover:text-amber-500 transition-colors">Case Study</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnterpriseWebApplicationDevelopment;