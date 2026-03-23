import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Mail, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isSuccess, setIsSuccess] = useState(false);

  // We use standard HTML submission now (which is 100% reliable)
  // but we can add a simple "Sent!" visual state for those who stay on page.
  const handleSubmissionClick = () => {
    // We delay the UI change slightly so they see the button react
    setTimeout(() => setIsSuccess(true), 1500);
  };

  return (
    <section id="contact" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px] liquid-blob" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-heading font-medium tracking-[0.2em]">CONTACT ✦ FOURIQTECH</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
            Let's Build <span className="text-gradient">Together</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Ready to scale your digital presence? We typically respond within 12-24 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 relative">
          {/* THE FORM CONTAINER */}
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">
                  We'll reach out to your inbox shortly.<br/>
                  Check <strong>hello@fouriqtech.com</strong> if you need to activate.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-primary text-xs font-bold uppercase tracking-widest hover:underline pt-4"
                >
                  Send Another?
                </button>
              </motion.div>
            ) : (
              <form 
                action="https://formsubmit.co/hello@fouriqtech.com" 
                method="POST" 
                className="space-y-5"
                onSubmit={handleSubmissionClick}
              >
                {/* Form Settings */}
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_next" value="https://www.fouriqtech.com" />
                
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 rounded-xl bg-muted/20 border border-border/40 text-foreground focus:outline-none focus:border-primary/40 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-muted/20 border border-border/40 text-foreground focus:outline-none focus:border-primary/40 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Project Brief</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3.5 rounded-xl bg-muted/20 border border-border/40 text-foreground focus:outline-none focus:border-primary/40 transition-all text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group overflow-hidden"
                >
                  Send Message
                  <CheckCircle2 size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Anti-Spam (Honeypot) at bottom */}
                <input type="text" name="_honey" style={{ display: 'none' }} />
              </form>
            )}
          </div>

          {/* CONTACT DETAILS */}
          <div className="flex flex-col justify-between py-6">
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/5">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-foreground">Direct Email</h4>
                  <p className="text-muted-foreground mt-1 select-all">hello@fouriqtech.com</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/5">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-foreground">Location</h4>
                  <p className="text-muted-foreground mt-1">Available Worldwide (Remote-First)</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-muted/20 border border-border/40 mt-auto">
              <p className="text-[12px] leading-relaxed text-muted-foreground uppercase font-bold tracking-[0.1em]">
                ✦ Note: The first inquiry requires a quick email verification check.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
