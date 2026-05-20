import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ShieldAlert, 
  Code2, 
  Search, 
  Layers, 
  Cpu, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  ChevronDown,
  Globe,
  Gauge,
  Workflow
} from 'lucide-react';

const NextjsSeoServices: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqItems = [
    {
      "question": "Is Next.js naturally good for SEO?",
      "answer": "While Next.js provides the tools for excellent SEO, such as SSR and SSG, it requires expert configuration to ensure search engines crawl and index content correctly without hydration errors."
    },
    {
      "question": "How do you handle SEO for large-scale Next.js apps?",
      "answer": "We utilize Incremental Static Regeneration (ISR) and advanced caching strategies to ensure millions of pages are indexed without sacrificing build times or server performance."
    },
    {
      "question": "Does your service include Core Web Vitals optimization?",
      "answer": "Yes, we focus heavily on LCP, FID, and CLS by optimizing image assets, reducing main-thread blocking, and implementing efficient data fetching patterns."
    },
    {
      "question": "Can you fix SEO issues in existing Next.js projects?",
      "answer": "Absolutely. We perform a comprehensive technical audit to identify bottlenecks in your current architecture and provide a roadmap for remediation."
    }
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Next.js SEO Services",
    "provider": {
      "@type": "Organization",
      "name": "FourIQ Tech"
    },
    "description": "Expert Next.js SEO Services focusing on SSR, ISR, and Core Web Vitals to help enterprise React applications dominate search results.",
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Technical SEO Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Next.js Technical Audit"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Core Web Vitals Optimization"
          }
        }
      ]
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-amber-500/30">
      <Helmet>
        <title>Next.js SEO Services | Enterprise Technical SEO Agency</title>
        <meta name="description" content="Scale your organic traffic with expert Next.js SEO Services. We optimize SSR, ISR, and Core Web Vitals to help enterprise React applications dominate search results." />
        <link rel="canonical" href="https://fouriq.tech/services/nextjs-seo-services" />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FourIQ Tech</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#problem" className="hover:text-amber-500 transition-colors">The Challenge</a>
            <a href="#solution" className="hover:text-amber-500 transition-colors">Our Approach</a>
            <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
            <a href="#process" className="hover:text-amber-500 transition-colors">Framework</a>
          </div>
          <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-semibold">
            Contact Sales
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full -z-10" />
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3" /> Technical Excellence
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 leading-[1.1]">
              Enterprise Next.js SEO Services for High-Performance Growth
            </h1>
            <p className="text-xl text-slate-400 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
              Stop trading performance for discoverability. Many Next.js applications suffer from poor indexation and slow hydration. 
              Our specialized services bridge the gap between cutting-edge React architecture and search engine requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                Book a Technical SEO Audit <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
                View Case Studies
              </button>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-24 px-6 bg-[#03081c]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">The Headless SEO Trap</h2>
                <p className="text-lg text-slate-400 font-light leading-relaxed mb-8">
                  Generic SEO agencies don't understand the nuances of hydration, server-side rendering (SSR), and incremental static regeneration (ISR). 
                  Without expert configuration, your Next.js site may face duplicate content issues, missing metadata, and crawling bottlenecks that stifle growth.
                </p>
                <div className="space-y-4">
                  {[
                    "Hydration mismatch causing layout shifts",
                    "Ghost pages in Google's index",
                    "Heavy client-side bundles blocking crawlers",
                    "Dynamic metadata rendering failures"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm mt-8">
                  <div className="text-amber-500 font-bold text-3xl mb-2">404</div>
                  <div className="text-slate-400 text-sm">Indexing Errors Found in standard React apps</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                  <div className="text-orange-500 font-bold text-3xl mb-2">62%</div>
                  <div className="text-slate-400 text-sm">Traffic lost due to slow hydration</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="py-24 px-6">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Precision Engineering for Search Visibility</h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-light text-lg">
              FourIQ Tech provides a developer-first approach to SEO. We don't just give you a checklist; we implement the architectural changes needed.
            </p>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-amber-500/50 transition-colors group">
              <Code2 className="w-12 h-12 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-4">Architecture First</h3>
              <p className="text-slate-400 font-light">Fine-tuning data fetching strategies (SSR vs ISR) to ensure content is available before the first byte.</p>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-amber-500/50 transition-colors group">
              <Globe className="w-12 h-12 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-4">Pipeline Optimization</h3>
              <p className="text-slate-400 font-light">Optimizing your build pipeline for maximum indexability and ultra-fast deployment cycles.</p>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-amber-500/50 transition-colors group">
              <Cpu className="w-12 h-12 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-4">Technical Implementation</h3>
              <p className="text-slate-400 font-light">Hands-on PRs for dynamic sitemaps, robots.txt management, and structured data injection.</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 text-amber-500 font-bold hover:underline">
              View Our Technical Approach <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-gradient-to-b from-[#020617] to-[#0f172a]">
          <div className="max-w-7xl mx-auto border border-white/10 rounded-[40px] overflow-hidden bg-white/5">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 lg:p-20">
                <h2 className="text-4xl font-bold mb-6 leading-tight">Technical SEO Built for the Modern Web</h2>
                <p className="text-slate-400 font-light text-lg mb-8">
                  Our service focuses on the four pillars of Next.js success. We don't settle for "SEO-friendly"—we aim for SEO dominance.
                </p>
                <ul className="space-y-6">
                  {[
                    { t: "Optimized Rendering", d: "Deep implementation of SSR/SSG patterns for instant loading." },
                    { t: "Automated Metadata", d: "Dynamic injection for high-scale e-commerce and SaaS." },
                    { t: "Massive Sitemaps", d: "Automated XML generation for datasets with 1M+ nodes." },
                    { t: "Web Vitals Excellence", d: "Core performance metrics that keep you in the green." }
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="mt-1 w-5 h-5 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-black" />
                      </div>
                      <div>
                        <span className="block font-bold text-white">{feat.t}</span>
                        <span className="text-slate-400 text-sm font-light">{feat.d}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-500/5 p-12 lg:p-20 border-l border-white/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="relative w-full max-w-md aspect-square rounded-3xl border border-amber-500/20 bg-slate-900 shadow-2xl p-6 flex flex-col gap-4">
                  <div className="h-4 w-3/4 bg-amber-500/20 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded-full" />
                  <div className="h-32 w-full bg-slate-800 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-amber-500" />
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <div className="h-8 w-8 rounded-full bg-slate-800" />
                    <div className="h-8 w-8 rounded-full bg-slate-800" />
                    <div className="h-8 w-8 rounded-full bg-amber-500/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 text-center">Our 4-Step Optimization Framework</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { n: "01", t: "Audit", d: "Deep-dive architectural audit and bottleneck identification." },
                { n: "02", t: "Implement", d: "Hands-on implementation of SSR/ISR patterns." },
                { n: "03", t: "Optimize", d: "Core Web Vital optimization and asset compression." },
                { n: "04", t: "Monitor", d: "Continuous monitoring to prevent future regressions." }
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="text-6xl font-black text-white/5 absolute -top-8 -left-2 tracking-tighter">{step.n}</div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-3 text-amber-500">{step.t}</h3>
                    <p className="text-slate-400 font-light text-sm leading-relaxed">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-20 flex justify-center">
              <button className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold text-lg">
                Start the Process
              </button>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section className="py-24 px-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[40px] p-1 shadow-2xl shadow-amber-500/10">
              <div className="bg-[#020617] rounded-[38px] p-10 lg:p-20 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-6">Real Results for Complex Architectures</h2>
                  <p className="text-xl text-slate-300 font-light mb-8">
                    By optimizing a micro-frontend architecture for a global SaaS provider, we achieved transformative results that directly impacted the bottom line.
                  </p>
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <div className="text-4xl font-bold text-amber-500 mb-1">42%</div>
                      <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">LCP Improved</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-orange-500 mb-1">115%</div>
                      <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Traffic Increase</div>
                    </div>
                  </div>
                  <button className="text-amber-500 font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
                    Read the Case Study <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-white/5 rounded-3xl border border-white/10 p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center"><Workflow className="text-amber-500" /></div>
                    <div>
                      <div className="font-bold">Next.js Micro-frontend</div>
                      <div className="text-slate-400 text-xs">Technical Implementation</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-white/5 rounded-full"><div className="h-full w-[98%] bg-green-500 rounded-full" /></div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                      <span>Performance</span><span>98/100</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full"><div className="h-full w-[94%] bg-green-500 rounded-full" /></div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                      <span>SEO Score</span><span>94/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-center">Expert Insights on Next.js SEO</h2>
            <p className="text-slate-400 text-center mb-16 font-light">Common questions about how we handle search engine optimization for React and Next.js applications at scale.</p>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-lg">{item.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-48 pb-6' : 'max-h-0'}`}>
                    <p className="text-slate-400 font-light leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/20 blur-[140px] rounded-full -z-10" />
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">Ready to Dominate the SERPs?</h2>
            <p className="text-xl text-slate-400 font-light mb-12 max-w-2xl mx-auto">
              Don't let technical debt hold back your organic growth. Partner with FourIQ Tech to turn your Next.js application into a high-ranking, lead-generating machine.
            </p>
            <button className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-white font-bold text-xl shadow-2xl shadow-amber-500/30 hover:scale-105 transition-transform">
              Schedule Your Strategy Call
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/10 bg-[#010413]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center"><Layers className="w-5 h-5 text-black" /></div>
              <span className="text-2xl font-bold">FourIQ Tech</span>
            </div>
            <p className="text-slate-500 max-w-sm font-light">
              Engineering organic growth for the world's most sophisticated React applications. Developer-led SEO for enterprise scale.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Services</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Technical SEO Audit</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Next.js Optimization</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Core Web Vitals</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">React Architecture</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Insights</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="/blog/sharing-state-between-micro-frontends-architectural-patterns" className="hover:text-amber-500 transition-colors">Micro-frontend Patterns</a></li>
              <li><a href="/blog/react-large-dataset-rendering-performance-optimization" className="hover:text-amber-500 transition-colors">Rendering Large Datasets</a></li>
              <li><a href="/blog/micro-frontend-performance-optimization-enterprise-case-study" className="hover:text-amber-500 transition-colors">Case Study: Enterprise Performance</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-4 text-slate-600 text-xs font-medium">
          <p>© 2024 FourIQ Tech Technical Agency. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NextjsSeoServices;