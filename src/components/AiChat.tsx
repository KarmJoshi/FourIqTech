import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_FREE_KEY || '';

const SYSTEM_PROMPT = `You are FourIQ AI — the intelligent assistant for FouriqTech, a premium web development and digital services company. You help visitors understand our services, answer technical questions, and guide them toward the right solution.

About FouriqTech:
- We build custom SaaS platforms, enterprise web applications, and high-performance websites
- Services: Website Development, App Development, UI/UX Design, SEO & Digital Marketing, Consulting
- Tech stack: React, Next.js, TypeScript, Node.js, PostgreSQL, Supabase, Tailwind CSS
- We specialize in enterprise-grade solutions: multi-tenant architectures, design systems, performance optimization

Our AI-Powered Automation (what makes us unique):
- We have a fully autonomous AI SEO agency that runs 24/7 without human intervention
- The AI Director makes strategic decisions daily: what content to create, which service pages to build, what technical fixes to apply
- AI Content Team: Automatically researches keywords, writes SEO-optimized blog posts, generates cover images with Imagen 4, and publishes them
- AI Structural Team: Builds new service landing pages from scratch — designs architecture, generates React code, self-heals broken code, and deploys to production
- AI Technical SEO Team: Audits site performance, fixes Core Web Vitals, manages sitemaps, and submits URLs to Google Search Console
- Google Search Console Integration: Tracks rankings, clicks, impressions — the AI uses this data to decide what to build next
- Everything is automated: from keyword research → content creation → image generation → code deployment → Google indexing
- The AI agents coordinate like a real agency: Director → Manager → Specialized Teams → Publisher → Live on site

How it works for clients:
- We can set up similar AI-powered content and SEO systems for your business
- Your website grows organically while you focus on your core business
- Blog posts, landing pages, and technical optimizations happen automatically
- All content is QA-checked before publishing (human tone, accuracy, SEO compliance)

Tone: Professional but friendly. Concise. Technical when needed. Enthusiastic about our AI capabilities.
Keep responses under 150 words unless the user asks for detail.
If asked about pricing, say we offer custom quotes based on project scope — suggest they reach out via the contact form or email hello@fouriqtech.com.
If asked about the AI agency, explain how it works with enthusiasm — this is our competitive advantage.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm FourIQ AI. Ask me anything about our services, tech stack, or how we can help your project. 🚀" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Chat is not configured yet. Please reach out via our contact form!" }]);
        setIsLoading(false);
        return;
      }

      // Build conversation history for context
      const history = messages.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              ...history,
              { role: 'user', parts: [{ text: userMessage }] }
            ],
            generationConfig: { 
              temperature: 0.7, 
              maxOutputTokens: 500,
              topP: 0.9,
            }
          })
        }
      );

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that. Try again or reach out via our contact form.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center hover:shadow-primary/50 transition-shadow"
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50"
            style={{ background: 'hsl(220 25% 4%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]" style={{ background: 'hsl(220 25% 5%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Bot size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 font-heading">FourIQ AI</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Powered by Gemini</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-all"
                  aria-label="Close chat"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant' 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    {msg.role === 'assistant' 
                      ? <Bot size={13} className="text-primary" /> 
                      : <User size={13} className="text-zinc-400" />
                    }
                  </div>
                  
                  {/* Bubble */}
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white/[0.04] border border-white/[0.06] text-zinc-300'
                      : 'bg-primary/15 border border-primary/20 text-zinc-200'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Bot size={13} className="text-primary" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <Loader2 size={14} className="text-primary animate-spin" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/[0.06]" style={{ background: 'hsl(220 25% 5%)' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about our services..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-primary/30 transition-all disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[9px] text-zinc-600 text-center mt-2 uppercase tracking-wider">
                ✦ Powered by FourIQ AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
