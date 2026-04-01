import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Bot, Send, Key, Loader2, Sparkles, MessageCircle } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  input: string;
  setInput: (s: string) => void;
  isLoading: boolean;
  handleSend: () => Promise<void>;
  clearHistory: () => void;
  keyLabel: string;
  totalKeys: number;
}

export function ChatPanel({
  isOpen, onClose, messages, input, setInput, isLoading, handleSend, clearHistory, keyLabel, totalKeys
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0e14]/90 backdrop-blur-3xl animate-in fade-in duration-300 px-4">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-[40px] border border-white/5 bg-[#10141a]/60 shadow-[0_0_100px_-20px_rgba(0,245,255,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-ai-primary/[0.03] to-transparent pointer-events-none" />
        
        {/* HEADER Architecture */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-10 py-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-ai-primary rounded-[22px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-ai-primary to-ai-purple shadow-lg shadow-ai-primary/20">
                <Bot className="h-7 w-7 text-[#0a0e14] group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#10141a] p-0.5 shadow-md">
                <div className="h-full w-full rounded-full bg-ai-tertiary animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-neutral-100 tracking-tight">AI STRATEGIC DIRECTOR</h3>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5">
                   <Key className="h-3 w-3 text-neutral-600" />
                   <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">{keyLabel} ROTATION</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-800" />
                <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">LATENCY: OPTIMAL</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs font-bold text-neutral-500 hover:text-white transition-colors rounded-xl px-4">
              ARCHIVE LOGS
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-2xl text-neutral-500 hover:bg-white/5 hover:text-white transition-all">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Intelligence Stream */}
        <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8 relative z-10 custom-scrollbar bg-black/10">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-10 text-center animate-in fade-in duration-1000">
              <div className="relative">
                 <div className="absolute inset-0 bg-ai-purple blur-3xl opacity-10" />
                 <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-white/[0.02] border border-white/5 group-hover:border-ai-primary/20 transition-colors shadow-2xl">
                    <MessageCircle className="h-10 w-10 text-ai-primary" />
                 </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-display font-medium text-neutral-200">Awaiting Directive</h4>
                <p className="max-w-md text-sm text-neutral-500 font-medium leading-relaxed">
                  The AI Managing Director is synchronized. Query strategic insights, keyword mandates, or technical architectures for FourIQ.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {["Current SEO Performance", "Sector Gap Analysis", "Dispatch Keyword Audit", "Topical Authority Map"].map((q) => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="group relative h-12 rounded-2xl border border-white/5 bg-white/[0.01] px-5 text-left text-[11px] font-bold tracking-widest text-neutral-500 transition-all hover:bg-ai-primary/5 hover:border-ai-primary/20 hover:text-ai-primary hover:translate-y-[-2px] uppercase">
                    <div className="flex items-center justify-between">
                       {q}
                       <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                  <div className={`max-w-[75%] rounded-[28px] px-8 py-5 text-sm leading-relaxed shadow-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-ai-primary to-ai-primary-dim text-[#0a0e14] font-bold"
                      : "obsidian-glass border-white/5 text-neutral-200 font-medium"
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`mt-3 flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase ${msg.role === "user" ? "text-[#0a0e14]/50" : "text-neutral-600"}`}>
                      <Clock size={10} />
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="flex items-center gap-4 rounded-[28px] obsidian-glass border-white/5 px-8 py-5 text-sm text-neutral-400 font-medium">
                    <div className="relative">
                      <div className="absolute inset-0 bg-ai-primary rounded-full animate-ping opacity-20" />
                      <Loader2 className="h-4 w-4 animate-spin text-ai-primary relative z-10" />
                    </div>
                    <span className="tracking-widest uppercase text-[10px] font-bold">Processing System Response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Command Input Hud */}
        <div className="border-t border-white/5 bg-white/[0.02] p-10 relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-ai-primary/20 to-transparent opacity-40" />
          <div className="flex flex-col gap-4">
             <div className="flex gap-4 items-end">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Query the Strategic Command Center..."
                  className="min-h-[56px] max-h-[200px] flex-1 resize-none border-none bg-white/[0.03] rounded-[24px] px-6 py-4 text-sm font-medium text-neutral-100 placeholder:text-neutral-700 focus-visible:ring-1 focus-visible:ring-ai-primary/30 custom-scrollbar transition-all"
                  rows={1}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}
                  className="h-14 w-14 rounded-full bg-ai-primary text-[#0a0e14] hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-xl shadow-ai-primary/10 disabled:opacity-20 disabled:scale-100">
                  <Send className="h-6 w-6" />
                </Button>
             </div>
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="h-1 w-1 rounded-full bg-ai-tertiary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                       <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase">SYS_ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase">{messages.length}/{40} MEM_BLOCKS</span>
                    </div>
                </div>
                <p className="text-[9px] font-bold tracking-widest text-neutral-700 uppercase italic">Awaiting Direct Execution Order</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
