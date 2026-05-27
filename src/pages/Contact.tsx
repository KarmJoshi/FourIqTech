import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';
import { motion, useInView } from 'framer-motion';
import { Mail, MapPin, CheckCircle2, ChevronDown, MessageSquare, PhoneCall, HelpCircle } from 'lucide-react';

export default function Contact() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();
  const [isSuccess, setIsSuccess] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const handleSubmissionClick = () => {
    // Graceful delayed simulation so the user feels immediate reactivity before system submission
    setTimeout(() => setIsSuccess(true), 1500);
  };

  const faqs = [
    {
      question: "How long does it take to receive a response after submitting?",
      answer: "Our consulting team typical reviews all incoming queries and responds within 12 to 24 business hours. If your request is urgent, please note it in the project brief."
    },
    {
      question: "What is your typical project kickoff timeline?",
      answer: "Following our discovery call and plan approval, we can typically mobilize a dedicated team and begin design sprints within 5 to 7 business days."
    },
    {
      question: "Do you offer localized support or face-to-face meetings?",
      answer: "We are a remote-first organization operating globally, which allows us to source the absolute best design and software engineering talent. We conduct regular video syncs and maintain active Slack channels to keep teams aligned perfectly."
    },
    {
      question: "Do you require a minimum budget investment?",
      answer: "Yes, our custom development and architectural redesign scopes typically begin at a minimum investment of $25,000 to ensure we can dedicate the full, uncompromised attention of our expert personnel."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <SEO 
        title="Contact Us | Schedule a Consultation | FouriqTech" 
        description="Get in touch with FouriqTech. Contact us for custom SaaS platform engineering, UI/UX designs, or modern web redesign consultations." 
        url="https://fouriqtech.com/contact" 
      />
      <Navbar isVisible={navVisible} />
      
      <main className="flex-1 w-full pt-36 pb-20 px-6 lg:px-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-24 left-[10%] w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-24 right-[10%] w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <span className="text-primary text-sm font-heading font-medium tracking-[0.2em] uppercase">✦ Connect With Us</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
              Let's Engineer Your <span className="text-gradient">Digital Solution</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Have an ambitious vision or a complex technological bottleneck? Fill out the brief below, and our leadership team will reach out within 12-24 hours.
            </p>
          </motion.div>

          {/* Form & Info Grid */}
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-24">
            {/* Form Section */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 glass-card rounded-3xl p-8 relative overflow-hidden"
            >
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="font-display text-3xl font-bold">Message Transmitted!</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Your details have been successfully logged. We will review your project brief and follow up with detailed next steps shortly.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-3 rounded-xl border border-white/10 hover:border-primary/40 hover:text-primary transition-all text-xs font-heading font-bold uppercase tracking-wider"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <form 
                  action="https://formsubmit.co/hello@fouriqtech.com" 
                  method="POST" 
                  className="space-y-6"
                  onSubmit={handleSubmissionClick}
                >
                  {/* Form Settings */}
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />
                  <input type="hidden" name="_next" value="https://fouriqtech.com/contact" />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3.5 rounded-xl bg-muted/15 border border-border/40 text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/35 transition-all text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="john@domain.com"
                        className="w-full px-4 py-3.5 rounded-xl bg-muted/15 border border-border/40 text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/35 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      placeholder="Your Company Ltd"
                      className="w-full px-4 py-3.5 rounded-xl bg-muted/15 border border-border/40 text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/35 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Scope Brief</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Outline your requirements, current pain points, and desired timeline..."
                      className="w-full px-4 py-3.5 rounded-xl bg-muted/15 border border-border/40 text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/35 transition-all text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    Transmit Message
                    <MessageSquare size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <input type="text" name="_honey" style={{ display: 'none' }} />
                </form>
              )}
            </motion.div>

            {/* Info Section */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 space-y-8"
            >
              <div className="glass-card rounded-3xl p-8 space-y-8">
                <h3 className="font-display text-2xl font-bold text-gradient">Direct Operations</h3>
                
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/5 shadow-md">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground text-sm">Email Correspondence</h4>
                    <p className="text-muted-foreground text-xs mt-1">For general inquiries and partnerships:</p>
                    <p className="text-primary text-sm font-medium mt-1 select-all hover:underline">hello@fouriqtech.com</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/5 shadow-md">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground text-sm">Global Headquarters</h4>
                    <p className="text-muted-foreground text-xs mt-1">Operating physically and remotely worldwide:</p>
                    <p className="text-foreground text-sm font-medium mt-1">Remote-First Model (Worldwide)</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/5 shadow-md">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground text-sm">Consultation Support</h4>
                    <p className="text-muted-foreground text-xs mt-1">Direct support hotline (Sales & Technical):</p>
                    <p className="text-foreground text-sm font-medium mt-1 select-all">+91 81403 71710</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-primary mb-2">✦ Active Verification</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  To secure our client channels against spam bots, your first submission will generate a secure authorization token to verify your email.
                </p>
              </div>
            </motion.div>
          </div>

          {/* FAQs Section */}
          <div className="max-w-4xl mx-auto border-t border-white/5 pt-20">
            <div className="text-center mb-12">
              <span className="text-primary text-sm font-heading font-medium tracking-[0.2em] uppercase">✦ FAQ</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Frequently Asked <span className="text-gradient">Questions</span></h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-white/5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-colors overflow-hidden">
                  <button 
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left px-8 py-5 flex items-center justify-between font-heading font-medium text-base hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle size={18} className="text-primary/70" />
                      {faq.question}
                    </span>
                    <ChevronDown className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  <div className={`px-8 overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-56 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-muted-foreground text-sm leading-relaxed pl-7">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
