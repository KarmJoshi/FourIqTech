import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  BarChart3, Bot, Building, CheckCircle2, Download, Globe, Mail, MapPinned,
  MessageSquareReply, Search, Send, ShieldAlert, Sparkles, Target, FileText,
  Link2, PenTool, MessageCircle, X, ChevronRight, Loader2, Key, Zap,
  TrendingUp, Shield, Layout, Code2, BookOpen, Edit2, Copy, Crown,
  Wrench, Layers, Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// ═══════════════════════════════════════════════════════════════════════
// 🔑 GEMINI API KEY ROTATION ENGINE
// ═══════════════════════════════════════════════════════════════════════
const API_KEYS = (import.meta.env.VITE_GEMINI_API_KEYS || "")
  .split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 0);

let currentKeyIndex = 0;

function getNextApiKey(): string {
  if (API_KEYS.length === 0) return "";
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

function getCurrentKeyLabel(): string {
  if (API_KEYS.length === 0) return "No keys";
  return `Key ${currentKeyIndex + 1}/${API_KEYS.length}`;
}

// Chat uses FREE Flash models only — Pro is reserved for the Director script
const AGENCY_API_URL = "http://localhost:3848";

// ═══════════════════════════════════════════════════════════════════════
// 🧠 CHAT MEMORY + AI CALL ENGINE (COST-OPTIMIZED)
// ═══════════════════════════════════════════════════════════════════════
const CHAT_STORAGE_KEY = "fouriq_seo_chat_history";
const MAX_MEMORY_MESSAGES = 10; // Reduced from 40 → saves ~75% tokens

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveChatHistory(messages: ChatMessage[]) {
  const trimmed = messages.slice(-MAX_MEMORY_MESSAGES);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
}

// ── Action Command Detection ──
// Detects when the user wants the Manager to DO something, not just talk.
type ActionCommand = { action: "dispatch"; department: string; orders: string } | { action: "audit" } | { action: "cycle" } | null;

function detectActionCommand(msg: string): ActionCommand {
  const lower = msg.toLowerCase();
  // Content team triggers
  if (lower.match(/\b(post|write|create|publish|generate)\b.*\b(blog|article|post|content)\b/) ||
      lower.match(/\b(blog|article|content)\b.*\b(post|write|create|publish|generate)\b/)) {
    return { action: "dispatch", department: "content", orders: msg };
  }
  // Structural team triggers
  if (lower.match(/\b(build|create|generate|make|deploy)\b.*\b(page|landing|service)\b/) ||
      lower.match(/\b(landing|service)\s*page\b/)) {
    return { action: "dispatch", department: "structural", orders: msg };
  }
  // Technical team triggers
  if (lower.match(/\b(check|audit|fix|scan|run)\b.*\b(technical|health|speed|seo|site)\b/) ||
      lower.match(/\b(technical|site)\s*(health|audit|check|scan)\b/)) {
    return { action: "dispatch", department: "technical", orders: msg };
  }
  // Full Director cycle
  if (lower.match(/\b(run|start|execute)\b.*\b(director|agency|full)\s*(cycle)?\b/)) {
    return { action: "cycle" };
  }
  // Audit
  if (lower.match(/\b(quality|surprise)\s*(audit|inspection|check)\b/)) {
    return { action: "audit" };
  }
  return null;
}

async function executeAction(command: ActionCommand): Promise<string> {
  try {
    if (command?.action === "dispatch") {
      const res = await fetch(`${AGENCY_API_URL}/api/dispatch/${command.department}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: command.orders }),
      });
      const data = await res.json();
      if (data.success) {
        return `✅ **${command.department.toUpperCase()} TEAM dispatched successfully.**\n\nI've given them their orders and they've completed the task. Here's the summary:\n\n\`\`\`\n${data.output?.substring(0, 400) || "Execution complete."}\n\`\`\``;
      } else {
        return `⚠️ The ${command.department} team encountered an issue:\n\n${data.error || "Unknown error"}.\n\nI'll look into this and retry if needed.`;
      }
    }
    if (command?.action === "cycle") {
      const res = await fetch(`${AGENCY_API_URL}/api/director/cycle`, { method: "POST" });
      const data = await res.json();
      return data.success
        ? `✅ **Full Director Cycle Complete.**\n\n${data.output?.substring(0, 400) || "All departments reviewed."}`
        : `⚠️ Cycle encountered an issue: ${data.error}`;
    }
    return "";
  } catch {
    return "⚠️ **Backend API not running.** Please start the Agency API first:\n\n```\nnode --env-file=.env .github/scripts/agency-api.mjs\n```\n\nThen try again.";
  }
}

const SEO_SYSTEM_PROMPT = `You are the Managing Director of FourIqTech. You are a highly sophisticated, elite human strategist with 20+ years of enterprise tech and SEO experience. You are speaking directly to the agency owner.

CRITICAL RULES & TONE:
1. SPEAK LIKE AN EXECUTIVE: You are a peer, not a servant. Be incredibly sharp, perceptive, and highly sophisticated. Treat this like a high-level boardroom conversation. Do not use typical AI phrasing like "As an AI..." or "How can I help you?".
2. CONVERSATIONAL COMPETENCE: When the owner explains a vision, immediately grasp the core business mechanics. Validate their approach and reply with high-level feedback, structural ideas, and a concrete execution strategy.
3. REAL AUTHORITY: When the owner asks you to execute (post a blog, build a page, run an audit), you say "Consider it done" and you ACTUALLY DO IT. The system handles execution automatically behind testing.
4. ABSOLUTELY NO MARKDOWN: NEVER use asterisks (* or **) for formatting or bolding anywhere in your response. The chat UI does NOT render markdown. Use standard unicode characters like '•' or '■' for bullet points. Use ALL CAPS for emphasis instead of bolding. Be clean and professional.
5. METRICS & REALITY: Speak in terms of ROI, topical authority cascades, and enterprise conversion loops.

COMPANY PROFILE: FourIqTech (fouriqtech.com) — Custom SaaS, Legacy modernization, Enterprise React Frameworks. You manage the Content, Structural, and Technical engineering teams.`;

async function callGeminiAPI(messages: ChatMessage[]): Promise<string> {
  const apiKey = getNextApiKey();
  if (!apiKey) return "❌ No API keys configured. Please add VITE_GEMINI_API_KEYS to your .env file.";

  // Only send last 10 messages to save tokens
  const recentMessages = messages.slice(-MAX_MEMORY_MESSAGES);
  const conversationHistory = recentMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const payload = {
    system_instruction: { parts: [{ text: SEO_SYSTEM_PROMPT }] },
    contents: conversationHistory,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.6 }
  };

  // Flash models ONLY — free tier, zero cost
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        console.log(`⏳ Rate limit on ${model}, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Model ${model} error: ${errorText.substring(0, 100)}`);
        continue;
      }

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";
    } catch (err) {
      console.log(`❌ Network error with ${model}:`, err);
      continue;
    }
  }

  // Try with next key as last resort
  const nextKey = getNextApiKey();
  if (nextKey && nextKey !== apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${nextKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Please try again.";
      }
    } catch { /* fall through */ }
  }

  return "⚠️ All API keys exhausted. Please wait a moment and try again.";
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 OUTREACH TYPES & DATA (preserved from original)
// ═══════════════════════════════════════════════════════════════════════
const STORAGE_KEYS = { leads: "fouriq_agent_leads", emails: "fouriq_agent_emails", replies: "fouriq_agent_replies" };
type LeadStatus = "new" | "researched" | "drafted" | "sent" | "replied";
type LeadSource = "Google Maps" | "Google Maps / SEO Audit" | "Google Maps / No Website" | "Website Crawl" | "Directory" | "Manual";

interface LighthouseScores {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  fcp: string;
  lcp: string;
  tbt: string;
  cls: string;
}

interface LeadRecord {
  id: string; businessName: string; niche: string; location: string; source: LeadSource;
  website: string; personalEmail: string; companyEmail: string; competitorName: string; competitorWebsite: string;
  reviewsSnapshot: string; problemTitle: string; problemDetail: string; businessImpact: string;
  likelyFix: string; confidence: "high" | "medium" | "low"; status: LeadStatus;
  collectedAt: string; lastTouchedAt: string;
  phone?: string; address?: string; rating?: string; reviewCount?: string;
  lighthouseScores?: LighthouseScores | null;
  seoIssues?: string[];
}

interface EmailRecord {
  id: string; leadId: string; subject: string; body: string; angle: string;
  sentFrom: string; sentAt: string; deliveryStatus: "draft" | "ready" | "sent" | "reply_received";
}

interface ReplyRecord {
  id: string; leadId: string; emailId: string; receivedAt: string; summary: string; nextStep: string;
}

const seedLeads: LeadRecord[] = [
  {
    id: "lead-1", businessName: "Gielly Green", niche: "Luxury Hair Salon", location: "London",
    source: "Google Maps", website: "https://www.giellygreen.co.uk", 
    personalEmail: "karm@example.com", companyEmail: "hello@example.com",
    competitorName: "Haug London Haus", competitorWebsite: "https://www.hauglondonhaus.com",
    reviewsSnapshot: "Strong brand perception, high-end positioning, mobile-first discovery matters.",
    problemTitle: "First impression settles too late on mobile",
    problemDetail: "The site appears JavaScript-heavy, so the first viewport feels assembled after initial load instead of looking complete immediately.",
    businessImpact: "For premium service brands, that delay weakens perceived polish during the first 2–3 seconds when trust is forming.",
    likelyFix: "Prioritize server-rendered above-the-fold content, reduce client-side boot cost, and tighten asset delivery for the opening viewport.",
    confidence: "high", status: "drafted", collectedAt: "2026-03-25 09:10", lastTouchedAt: "2026-03-25 09:40",
  },
  {
    id: "lead-2", businessName: "North Shore Dental Studio", niche: "Dental Clinic", location: "Sydney",
    source: "Website Crawl", website: "https://example-dental.com", 
    personalEmail: "dr.smith@example-dental.com", companyEmail: "info@example-dental.com",
    competitorName: "Harbour Smile Care", competitorWebsite: "https://example-smile.com",
    reviewsSnapshot: "Strong patient reviews, but website trust and conversion path lag behind category leaders.",
    problemTitle: "Inquiry path has too much friction",
    problemDetail: "The page layout looks credible, but the path from service interest to booking feels split across too many sections and weak CTAs.",
    businessImpact: "High-intent visitors may postpone contacting the clinic even if the brand itself appears trustworthy.",
    likelyFix: "Tighten the first CTA sequence, reduce decision branches, and surface trust signals earlier in the page flow.",
    confidence: "medium", status: "researched", collectedAt: "2026-03-25 10:05", lastTouchedAt: "2026-03-25 10:18",
  },
];

const seedEmails: EmailRecord[] = [{
  id: "email-1", leadId: "lead-1", subject: "one thing hurting first impression", angle: "mobile trust",
  sentFrom: "hello@fouriqtech.com", sentAt: "2026-03-25 09:42", deliveryStatus: "ready",
  body: `Hi,\n\nI spent a little time on your site and one thing stood out: the first screen feels like it settles a moment later than it should on mobile.\n\nFor a premium service brand, that matters because the first few seconds shape trust before a visitor reads anything.\n\nFrom what I can see, this looks more like a rendering and delivery issue than a redesign problem. If helpful, I can send the 3 changes I would prioritize first based on the current setup.\n\nBest,\nKarm Joshi`,
}];

const seedReplies: ReplyRecord[] = [{
  id: "reply-1", leadId: "lead-1", emailId: "email-1", receivedAt: "2026-03-25 12:05",
  summary: "Prospect asked for the three recommended changes and whether the work can be staged without a redesign.",
  nextStep: "Reply with concise 3-point audit and offer a short Loom or written plan.",
}];

function readStorage<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}

function toCsv(rows: Array<Record<string, string>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCell(row[header] ?? "")).join(","))].join("\n");
}

function downloadCsv(filename: string, rows: Array<Record<string, string>>) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

function statusColor(status: LeadStatus) {
  switch (status) {
    case "new": return "text-sky-300 border-sky-500/30 bg-sky-500/10";
    case "researched": return "text-violet-300 border-violet-500/30 bg-violet-500/10";
    case "drafted": return "text-amber-300 border-amber-500/30 bg-amber-500/10";
    case "sent": return "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
    case "replied": return "text-green-300 border-green-500/30 bg-green-500/10";
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 💬 SEO CHAT PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function SEOChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMessages(loadChatHistory()); }, []);
  
  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Check if the user is giving an order
      const actionCmd = detectActionCommand(trimmed);
      let aiResponse = "";

      if (actionCmd) {
        aiResponse = await executeAction(actionCmd);
      } else {
        // 2. Otherwise, normal conversation via Flash model
        aiResponse = await callGeminiAPI(updatedMessages);
      }

      const assistantMsg: ChatMessage = { role: "assistant", content: aiResponse, timestamp: new Date().toISOString() };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch {
      const errMsg: ChatMessage = { role: "assistant", content: "⚠️ Something went wrong. Please try again.", timestamp: new Date().toISOString() };
      const finalMessages = [...updatedMessages, errMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const clearHistory = () => { setMessages([]); localStorage.removeItem(CHAT_STORAGE_KEY); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-700/50 bg-neutral-950 shadow-2xl shadow-blue-500/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-gradient-to-r from-blue-950/40 to-neutral-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-100">SEO Manager AI</h3>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Online · {getCurrentKeyLabel()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-neutral-400 hover:text-neutral-200">
              Clear
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-neutral-400 hover:text-neutral-200">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                <MessageCircle className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-neutral-200">SEO Manager Chat</h4>
                <p className="mt-1 max-w-sm text-sm text-neutral-500">Ask me anything about SEO strategy, keyword research, on-page optimization, content planning, or your site's GSC performance.</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["What's our current SEO performance?", "Explain on-page SEO strategy", "How does the SEO team handles backlinks?", "What keywords should we target next?"].map((q) => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-left text-xs text-neutral-400 transition hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-neutral-300">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                  : "border border-neutral-800 bg-neutral-900 text-neutral-200"
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`mt-1 text-[10px] ${msg.role === "user" ? "text-blue-200/60" : "text-neutral-600"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask the SEO Manager..."
              className="min-h-[44px] max-h-[120px] resize-none border-neutral-800 bg-neutral-900 text-neutral-100 placeholder:text-neutral-600"
              rows={1}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}
              className="h-auto bg-gradient-to-r from-blue-600 to-cyan-600 px-4 text-white hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-600">
            <span className="flex items-center gap-1"><Key className="h-3 w-3" /> {API_KEYS.length} keys loaded · Auto-rotation active</span>
            <span>{messages.length}/{MAX_MEMORY_MESSAGES} messages in memory</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 👔 DIRECTOR COMMAND CENTER — The Manager Dashboard
// ═══════════════════════════════════════════════════════════════════════
interface ActivityEntry {
  id: string;
  emoji: string;
  source: string;
  message: string;
  type: string;
  timestamp: string;
}

interface StagingItem {
  id: string;
  type: string;
  department: string;
  status: string;
  created_at: string;
  title: string;
  summary: any;
  manager_review: { verdict: string; feedback: string; reviewed_at: string } | null;
  published_at?: string;
  revision_count?: number;
}

function DirectorCommandCenter({ directorStatus, directorJournal }: { directorStatus: any; directorJournal: any }) {
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([]);
  const [stagingQueue, setStagingQueue] = useState<StagingItem[]>([]);
  const [stagingStats, setStagingStats] = useState<any>({});
  const [runningTasks, setRunningTasks] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<"feed" | "staging" | "journal">("feed");
  const [isDispatching, setIsDispatching] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState<{ id: string; content: string } | null>(null);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actRes, stgRes, taskRes, statusRes] = await Promise.all([
          fetch(`${AGENCY_API_URL}/api/activity?limit=50`).catch(() => null),
          fetch(`${AGENCY_API_URL}/api/staging`).catch(() => null),
          fetch(`${AGENCY_API_URL}/api/tasks`).catch(() => null),
          fetch(`${AGENCY_API_URL}/api/status`).catch(() => null),
        ]);
        if (actRes?.ok) {
          const data = await actRes.json();
          setActivityFeed(data.entries || []);
        }
        if (stgRes?.ok) {
          const data = await stgRes.json();
          setStagingQueue(data.queue || []);
          setStagingStats(data.stats || {});
        }
        if (taskRes?.ok) setRunningTasks(await taskRes.json());
      } catch { /* silently fail */ }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const dispatchDepartment = async (dept: string) => {
    setIsDispatching(dept);
    try {
      const res = await fetch(`${AGENCY_API_URL}/api/dispatch/${dept}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: `Manager dispatched ${dept} team via dashboard` }),
      });
      const data = await res.json();
      if (!data.success && data.status === "busy") {
        alert(`${dept} team is already running. Please wait.`);
      }
    } catch {
      alert("Failed to reach Agency API. Ensure it is running.");
    } finally {
      setTimeout(() => setIsDispatching(null), 1000);
    }
  };

  const dispatchDirectorCycle = async () => {
    setIsDispatching("director");
    try {
      const res = await fetch(`${AGENCY_API_URL}/api/director/cycle`, { method: "POST" });
      const data = await res.json();
      if (!data.success && data.status === "busy") {
        alert("Director cycle is already running.");
      }
    } catch {
      alert("Failed to reach Agency API.");
    } finally {
      setTimeout(() => setIsDispatching(null), 1000);
    }
  };

  const reviewItem = async (id: string, verdict: "approved" | "rejected") => {
    const feedback = reviewFeedback[id] || (verdict === "approved" ? "Approved by Manager." : "Needs revision.");
    try {
      await fetch(`${AGENCY_API_URL}/api/staging/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, feedback }),
      });
      setReviewFeedback(prev => ({ ...prev, [id]: "" }));
    } catch {
      alert("Failed to submit review.");
    }
  };

  const previewItem = async (id: string) => {
    try {
      const res = await fetch(`${AGENCY_API_URL}/api/staging/${id}/content`);
      const data = await res.json();
      setPreviewContent({ id, content: data.content || "No content available." });
    } catch {
      setPreviewContent({ id, content: "Failed to load content." });
    }
  };

  const pendingCount = stagingQueue.filter(i => i.status === "pending_review").length;

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending_review": return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "approved": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
      case "rejected": return "border-rose-500/30 bg-rose-500/10 text-rose-300";
      default: return "border-neutral-700 text-neutral-400";
    }
  };

  const typeBadge = (type: string) => {
    switch (type) {
      case "blog_post": return { text: "Blog", color: "border-violet-500/30 bg-violet-500/10 text-violet-300" };
      case "landing_page": return { text: "Page", color: "border-blue-500/30 bg-blue-500/10 text-blue-300" };
      case "technical_patch": return { text: "Patch", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" };
      default: return { text: type, color: "border-neutral-700 text-neutral-400" };
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* ── Top Stats Row ── */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-neutral-900/70">
          <CardHeader className="pb-2"><CardDescription className="text-amber-300/70">Manager</CardDescription><CardTitle className="text-lg text-amber-100">Gemini 3.1 Pro</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Crown className="h-4 w-4 text-amber-400" /> THE BOSS</CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900/70">
          <CardHeader className="pb-2"><CardDescription>Staging Queue</CardDescription><CardTitle className="text-2xl">{pendingCount} <span className="text-sm font-normal text-amber-400">pending</span></CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><FileText className="h-4 w-4 text-amber-300" /> {stagingStats.total_submitted || 0} total submitted</CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900/70">
          <CardHeader className="pb-2"><CardDescription>Approved</CardDescription><CardTitle className="text-2xl text-emerald-300">{stagingStats.approved || 0}</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {stagingStats.approval_rate || "0%"} approval rate</CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900/70">
          <CardHeader className="pb-2"><CardDescription>Director Cycles</CardDescription><CardTitle className="text-2xl">{directorStatus?.director_cycles || 0}</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><TrendingUp className="h-4 w-4 text-blue-300" /> Strategic decisions</CardContent>
        </Card>
        <Card className="border-neutral-800 bg-neutral-900/70">
          <CardHeader className="pb-2"><CardDescription>Running Now</CardDescription><CardTitle className="text-2xl">{Object.keys(runningTasks).length}</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-neutral-400">
            {Object.keys(runningTasks).length > 0 ? (
              <><Loader2 className="h-4 w-4 text-amber-400 animate-spin" /> {Object.keys(runningTasks).join(", ")}</>
            ) : (
              <><Activity className="h-4 w-4 text-neutral-600" /> All idle</>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Dispatch Controls ── */}
      <Card className="border-neutral-800 bg-neutral-900/70">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs uppercase tracking-wide text-neutral-500 font-semibold mr-2">Dispatch</div>
            <Button
              size="sm" onClick={dispatchDirectorCycle} disabled={isDispatching === "director" || !!runningTasks["director"]}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-500 hover:to-yellow-500 shadow-lg shadow-amber-500/10"
            >
              {(isDispatching === "director" || runningTasks["director"]) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
              Full Director Cycle
            </Button>
            {[
              { dept: "content", label: "Content Team", icon: PenTool, colors: "from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-500/10" },
              { dept: "structural", label: "Structural Team", icon: Layers, colors: "from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/10" },
              { dept: "technical", label: "Technical Team", icon: Wrench, colors: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/10" },
            ].map(d => (
              <Button
                key={d.dept} size="sm" onClick={() => dispatchDepartment(d.dept)}
                disabled={isDispatching === d.dept || !!runningTasks[d.dept]}
                className={`bg-gradient-to-r ${d.colors} text-white shadow-lg`}
              >
                {(isDispatching === d.dept || runningTasks[d.dept]) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <d.icon className="mr-2 h-4 w-4" />}
                {d.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Tab Switcher ── */}
      <div className="flex rounded-lg border border-neutral-800 bg-neutral-900 p-1 w-fit">
        {[
          { key: "feed" as const, label: "Live Activity Feed", icon: Activity },
          { key: "staging" as const, label: `Staging Queue${pendingCount > 0 ? ` (${pendingCount})` : ""}`, icon: FileText },
          { key: "journal" as const, label: "Manager Journal", icon: BookOpen },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
              activeTab === tab.key
                ? "bg-neutral-800 text-neutral-100 shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Live Activity Feed ── */}
      {activeTab === "feed" && (
        <Card className="border-neutral-800 bg-neutral-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-emerald-400" />
              Live Activity Feed
              <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Auto-refreshing
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {activityFeed.length === 0 ? (
                  <div className="text-sm text-neutral-500 italic text-center py-10">No activity yet. Dispatch a department or run a Director cycle to see events here.</div>
                ) : activityFeed.map((entry) => (
                  <div key={entry.id} className={`flex items-start gap-3 rounded-lg px-3 py-2 ${
                    entry.type === "error" ? "bg-rose-950/20 border border-rose-900/30" :
                    entry.type === "review" ? "bg-amber-950/10 border border-amber-900/20" :
                    entry.type === "publish" ? "bg-emerald-950/10 border border-emerald-900/20" :
                    "hover:bg-neutral-900/50"
                  }`}>
                    <span className="text-base leading-none mt-0.5">{entry.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-neutral-200 leading-snug">{entry.message}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-neutral-600">{new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-neutral-800 text-neutral-500">{entry.source}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* ── Staging Queue ── */}
      {activeTab === "staging" && (
        <div className="space-y-4">
          {/* Preview Modal */}
          {previewContent && (
            <Card className="border-blue-500/30 bg-blue-950/10">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-blue-300">Preview: {previewContent.id}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setPreviewContent(null)} className="h-6 w-6 text-neutral-400"><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap text-xs text-neutral-300 bg-black/50 rounded p-3 border border-neutral-800">{previewContent.content}</pre>
              </CardContent>
            </Card>
          )}

          {stagingQueue.length === 0 ? (
            <Card className="border-dashed border-neutral-800 bg-neutral-900/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-10 w-10 text-neutral-700 mb-3" />
                <div className="text-sm text-neutral-500">Staging queue is empty.</div>
                <div className="text-xs text-neutral-600 mt-1">Dispatch a department — their output will appear here for Manager review.</div>
              </CardContent>
            </Card>
          ) : stagingQueue.map((item) => {
            const tb = typeBadge(item.type);
            return (
              <Card key={item.id} className={`border-neutral-800 bg-neutral-900/70 ${item.status === "pending_review" ? "border-l-4 border-l-amber-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={tb.color}>{tb.text}</Badge>
                        <Badge variant="outline" className={statusBadge(item.status)}>{item.status.replace("_", " ")}</Badge>
                        <span className="text-[10px] text-neutral-600">{item.id}</span>
                      </div>
                      <div className="text-base font-medium text-neutral-100 mt-1">{item.title}</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {item.department} · {new Date(item.created_at).toLocaleString()}
                        {item.summary?.word_count && ` · ${item.summary.word_count} words`}
                        {item.summary?.qa_score && ` · QA: ${item.summary.qa_score}/100`}
                        {item.summary?.lead_score && ` · Lead: ${item.summary.lead_score}/10`}
                      </div>
                      {item.manager_review && (
                        <div className={`mt-2 rounded p-2 text-xs ${
                          item.manager_review.verdict === "approved" ? "bg-emerald-950/20 text-emerald-300 border border-emerald-900/30" : "bg-rose-950/20 text-rose-300 border border-rose-900/30"
                        }`}>
                          👔 Manager: "{item.manager_review.feedback}"
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => previewItem(item.id)} className="text-xs text-neutral-400 hover:text-neutral-200">
                        <BookOpen className="mr-1 h-3 w-3" /> Preview
                      </Button>
                      {item.status === "pending_review" && (
                        <>
                          <Input
                            value={reviewFeedback[item.id] || ""}
                            onChange={(e) => setReviewFeedback(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Manager feedback..."
                            className="h-8 w-52 text-xs bg-black border-neutral-800"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => reviewItem(item.id, "approved")}
                              className="h-7 bg-emerald-600 text-white hover:bg-emerald-500 text-xs">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                            </Button>
                            <Button size="sm" onClick={() => reviewItem(item.id, "rejected")}
                              variant="outline" className="h-7 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs">
                              <X className="mr-1 h-3 w-3" /> Reject
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Manager Journal ── */}
      {activeTab === "journal" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Bot className="h-4 w-4 text-violet-300" /> Manager's Strategic Reasoning</CardTitle>
              <CardDescription>From the latest Director cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {directorJournal?.entries?.slice(-1)[0] ? (
                <>
                  <div className="rounded-lg border border-neutral-800 bg-black/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Strategic Reasoning</div>
                      <Badge variant="outline" className="border-neutral-800 bg-neutral-900 text-neutral-400">Cycle #{directorJournal.entries.slice(-1)[0].cycle}</Badge>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed italic">"{directorJournal.entries.slice(-1)[0].reasoning}"</p>
                  </div>
                  <div className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-4">
                    <div className="text-xs uppercase tracking-wide text-amber-500/70 mb-2">Cross-Department Orders</div>
                    <p className="text-sm font-medium text-amber-200 leading-relaxed">{directorJournal.entries.slice(-1)[0].cross_dept_orders}</p>
                  </div>
                </>
              ) : (
                <div className="text-sm text-neutral-500 italic">No journal entries yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-4 w-4 text-emerald-400" /> Quality Audit</CardTitle>
              <CardDescription>Random inspections by the Manager</CardDescription>
            </CardHeader>
            <CardContent>
              {directorJournal?.entries?.slice(-1)[0]?.quality_audit ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-neutral-800 bg-black/40 p-4">
                    <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Audited</div>
                    <div className="text-sm font-medium text-neutral-200">{directorJournal.entries.slice(-1)[0].quality_audit.article}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-neutral-800 bg-black/40 p-4 text-center">
                      <div className={`text-3xl font-bold ${directorJournal.entries.slice(-1)[0].quality_audit.score >= 8 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {directorJournal.entries.slice(-1)[0].quality_audit.score} <span className="text-sm text-neutral-500 font-normal">/ 10</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-2 uppercase">Score</div>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-black/40 p-4 flex flex-col items-center justify-center">
                      <Badge variant="outline" className={`px-4 py-1.5 text-sm font-bold ${
                        directorJournal.entries.slice(-1)[0].quality_audit.verdict === 'PUBLISH'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                      }`}>{directorJournal.entries.slice(-1)[0].quality_audit.verdict}</Badge>
                      <div className="text-xs text-neutral-500 mt-3 uppercase">Verdict</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 text-center">
                  <Shield className="h-8 w-8 text-neutral-700 mb-2" />
                  <div className="text-sm text-neutral-500">No audits in last cycle.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🏠 MAIN AGENT MANAGER COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function AgentManagerLegacy() {
  const [activeDept, setActiveDept] = useState<"director" | "content" | "structural" | "technical" | "outreach">("director");
  const [chatOpen, setChatOpen] = useState(false);

  // Outreach state
  const [directorStatus, setDirectorStatus] = useState<any>(null);
  const [directorJournal, setDirectorJournal] = useState<any>(null);

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [replies, setReplies] = useState<ReplyRecord[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(seedLeads[0].id);
  const [search, setSearch] = useState("");
  const [newReply, setNewReply] = useState({ summary: "", nextStep: "" });
  const [leadFilter, setLeadFilter] = useState<"collected" | "sent">("collected");
  const [outreachTab, setOutreachTab] = useState("leads");
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingNiche, setIsGeneratingNiche] = useState(false);
  const [aiNiche, setAiNiche] = useState("");
  const [manualNiche, setManualNiche] = useState("");
  const [leadCount, setLeadCount] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editForm, setEditForm] = useState({ personalEmail: "", companyEmail: "", phone: "" });

  const startEditing = (lead: LeadRecord) => {
    setEditForm({ personalEmail: lead.personalEmail, companyEmail: lead.companyEmail, phone: lead.phone || "" });
    setIsEditing(true);
  };

  const saveEdit = () => {
    setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, ...editForm, lastTouchedAt: new Date().toLocaleString() } : l));
    setIsEditing(false);
  };

  useEffect(() => {
    setLeads(readStorage(STORAGE_KEYS.leads, seedLeads));
    setEmails(readStorage(STORAGE_KEYS.emails, seedEmails));
    setReplies(readStorage(STORAGE_KEYS.replies, seedReplies));
  }, []);

  useEffect(() => {
    const fetchDirectorData = async () => {
      try {
        const sRes = await fetch("http://localhost:3848/api/status").catch(() => null);
        if (sRes && sRes.ok) setDirectorStatus(await sRes.json());

        const jRes = await fetch("http://localhost:3848/api/journal").catch(() => null);
        if (jRes && jRes.ok) setDirectorJournal(await jRes.json());
      } catch (e) {
        console.error("API Fetch Error", e);
      }
    };
    fetchDirectorData();
    
    let interval: number | undefined;
    if (activeDept === "director") {
      interval = window.setInterval(fetchDirectorData, 5000);
    }
    return () => clearInterval(interval);
  }, [activeDept]);

  const autoDecideNicheAndHunt = async (overrideNiche?: string) => {
    setIsGeneratingNiche(true);
    const useNiche = overrideNiche || manualNiche;
    
    if (!overrideNiche) {
      setAiNiche("Analyzing market signals...");
    } else {
      setAiNiche(`${overrideNiche} (Hunting ${leadCount} leads...)`);
    }

    try {
      let chosenNiche = overrideNiche;

      if (!chosenNiche) {
        const key = getNextApiKey();
        if (!key) throw new Error("No Gemini API key found in .env (VITE_GEMINI_API_KEYS)");
        
        const prompt = `You are a strategic local SEO outreach manager. Your goal is to pick exactly ONE highly profitable, somewhat underserved local business niche in a major US city for a web design and SEO agency to target. Return ONLY the string in this exact format: "[Niche] in [City]". Do not include any other text, no quotes, no explanation. Example output: "Roofers in Austin"`;

        const models = ["gemini-3.1-flash-lite", "gemini-3.1-flash-lite-preview", "gemini-3.0-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        let gData: any = null;
        let lastError = "";

        for (const model of models) {
          try {
            const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 20 } })
            });
            gData = await gRes.json();
            if (gData.error) {
              lastError = gData.error.message;
              continue; 
            }
            if (gData.candidates && gData.candidates.length > 0) break;
          } catch (e: any) {
            lastError = e.message;
          }
        }
        
        if (!gData || !gData.candidates || gData.candidates.length === 0) {
          throw new Error(lastError || "The AI returned an empty response. Try again or use 'Manual Hunt' below.");
        }
        
        const rawText = gData.candidates[0].content?.parts?.[0]?.text || "";
        console.log("Raw AI Niche Response:", rawText);

        // Emergency Fallback: If AI is restricted or returns "...", pick a high-value niche manually
        const fallbacks = ["Roofers in Miami", "Dentists in Austin", "Plumbers in New York", "HVAC in Chicago", "Moving Companies in Dallas"];
        
        if (rawText.trim() === "..." || rawText.length < 5) {
          console.warn("AI returned placeholder, using emergency fallback niche.");
          chosenNiche = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        } else {
          const nicheMatch = rawText.match(/["']?([^"'\n]+ in [^"'\n]+)["']?/i);
          chosenNiche = nicheMatch ? nicheMatch[1].trim() : rawText.trim().replace(/['"]/g, '');
        }

        if (!chosenNiche || chosenNiche.length < 5) {
           chosenNiche = fallbacks[0]; // Final fallback
        }
        
        setAiNiche(chosenNiche + " (Hunting...)");
      }

      const response = await fetch("http://localhost:3001/run-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "lead_hunter", args: [chosenNiche, String(leadCount)] })
      });
      const result = await response.json();
      
      if (result.success) {
         setAiNiche(`${chosenNiche} (Campaign Finished)`);
         alert(`✅ Success: Hunted leads for ${chosenNiche}.\nClick "Sync Scraper" to see them.`);
      } else {
         throw new Error(result.error || "Bridge execution failed");
      }
    } catch (e: any) {
      console.error("Hunt Error:", e);
      setAiNiche(`Error: ${e.message}`);
    } finally {
      setIsGeneratingNiche(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedLead || !selectedEmail) return;
    
    // Choose best email to send to
    const recipient = selectedLead.personalEmail && selectedLead.personalEmail !== "Manual outreach needed" 
      ? selectedLead.personalEmail 
      : selectedLead.companyEmail;

    if (!recipient) {
      alert("❌ Error: No valid recipient email found for this lead.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("http://localhost:3001/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject: selectedEmail.subject,
          body: selectedEmail.body,
          fromName: "Karm Joshi (FourIqTech)"
        })
      });

      const result = await response.json();

      if (result.success) {
        setEmails((c) => c.map((e) => (e.id === selectedEmail.id ? { ...e, deliveryStatus: "sent", sentAt: new Date().toLocaleString() } : e)));
        setLeads((c) => c.map((l) => (l.id === selectedLead.id ? { ...l, status: "sent", lastTouchedAt: new Date().toLocaleString() } : l)));
        
        // Auto-switch to Sent filter and Replies tab for immediate tracking
        setLeadFilter("sent");
        setOutreachTab("replies");
        
        alert(`✅ Success: Email sent to ${recipient}!\n\nI've moved this lead to your "Sent Mail" view and opened the "Reply Tracking" tab for you.`);
      } else {
        throw new Error(result.error || "Unknown server error");
      }
    } catch (error: any) {
      console.error("Email Sending Error:", error);
      alert(`❌ Failed to send email: ${error.message}\n\nMake sure the Agency Bridge is running (node agency-bridge.mjs) and SMTP credentials are in .env`);
    } finally {
      setIsSending(false);
    }
  };
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.emails, JSON.stringify(emails)); }, [emails]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.replies, JSON.stringify(replies)); }, [replies]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) =>
      [lead.businessName, lead.niche, lead.location, lead.problemTitle, lead.personalEmail, lead.companyEmail].some((value) => (value || "").toLowerCase().includes(query)),
    );
  }, [leads, search]);

  const selectedLead = filteredLeads.find((lead) => lead.id === selectedLeadId) ?? leads[0];
  const selectedEmail = emails.find((email) => email.leadId === selectedLead?.id);
  const selectedReplies = replies.filter((reply) => reply.leadId === selectedLead?.id);

  const displayLeads = useMemo(() => {
    return filteredLeads.filter(lead => 
      leadFilter === "collected" 
        ? ["new", "researched", "drafted"].includes(lead.status) 
        : ["sent", "replied"].includes(lead.status)
    );
  }, [filteredLeads, leadFilter]);

  const stats = useMemo(() => {
    const sent = emails.filter((email) => email.deliveryStatus === "sent" || email.deliveryStatus === "reply_received").length;
    return { totalLeads: leads.length, researched: leads.filter((lead) => ["researched", "drafted", "sent", "replied"].includes(lead.status)).length, sent, replied: replies.length };
  }, [leads, emails, replies]);


  const addReply = () => {
    if (!selectedLead || !selectedEmail || !newReply.summary.trim() || !newReply.nextStep.trim()) return;
    const reply: ReplyRecord = { id: `reply-${Date.now()}`, leadId: selectedLead.id, emailId: selectedEmail.id, receivedAt: new Date().toLocaleString(), summary: newReply.summary.trim(), nextStep: newReply.nextStep.trim() };
    setReplies((c) => [reply, ...c]);
    setEmails((c) => c.map((e) => (e.id === selectedEmail.id ? { ...e, deliveryStatus: "reply_received" } : e)));
    setLeads((c) => c.map((l) => (l.id === selectedLead.id ? { ...l, status: "replied", lastTouchedAt: new Date().toLocaleString() } : l)));
    setNewReply({ summary: "", nextStep: "" });
  };

  const importLeads = async () => {
    setIsImporting(true);
    try {
      // Prevent stale cache by appending a timestamp
      const res = await fetch("/collected_leads.json?t=" + Date.now());
      if (!res.ok) throw new Error("Scraper data file not found");
      const data = await res.json();
      
      const newLeads: LeadRecord[] = [];
      const newEmails: EmailRecord[] = [];
      
      data.forEach((item: any) => {
         // Create a shallow copy and remove the nested email draft
         const importedLead = { ...item };
         const draft = importedLead.draftEmail;
         delete importedLead.draftEmail;
         
         // Basic duplicate detection based on website and business name
         const isDuplicate = leads.some(l => 
           l.businessName === importedLead.businessName || 
           (l.website !== "None" && l.website === importedLead.website)
         );

         if (!isDuplicate) {
             newLeads.push(importedLead as LeadRecord);
             if (draft) newEmails.push(draft as EmailRecord);
         }
      });
      
      if (newLeads.length > 0) {
         setLeads(prev => [...newLeads, ...prev]);
         setEmails(prev => [...newEmails, ...prev]);
         alert(`✅ Success: Imported ${newLeads.length} new leads from the local scraper!`);
      } else {
         alert("⚠️ No new leads found. Try running the lead-hunter.mjs script again.");
      }
    } catch (e) {
      console.error("Import Error:", e);
      alert("⚠️ Could not import leads. Make sure you have run the lead-hunter.mjs script successfully.");
    } finally {
      setIsImporting(false);
    }
  };

  const exportLeads = () => downloadCsv("fouriq-leads.csv", leads.map((l) => ({ id: l.id, business_name: l.businessName, niche: l.niche, location: l.location, source: l.source, website: l.website, personal_email: l.personalEmail, company_email: l.companyEmail, competitor_name: l.competitorName, problem_title: l.problemTitle, status: l.status })));
  const exportOutreach = () => downloadCsv("fouriq-outreach-log.csv", emails.map((e) => { const l = leads.find((i) => i.id === e.leadId); return { email_id: e.id, business_name: l?.businessName ?? "", subject: e.subject, angle: e.angle, sent_from: e.sentFrom, sent_at: e.sentAt, delivery_status: e.deliveryStatus }; }));

  const departments = [
    { id: "director" as const, label: "Agency Director", icon: Crown, color: "from-amber-500 to-yellow-500", desc: "Strategic Brain · Gemini 3.1 Pro", glow: "shadow-amber-500/20" },
    { id: "content" as const, label: "Content Team", icon: PenTool, color: "from-violet-500 to-purple-500", desc: "Blog Writing & Authority", glow: "shadow-violet-500/10" },
    { id: "structural" as const, label: "Structural Team", icon: Layers, color: "from-blue-500 to-cyan-500", desc: "Landing Page Builder", glow: "shadow-blue-500/10" },
    { id: "technical" as const, label: "Technical Team", icon: Wrench, color: "from-emerald-500 to-teal-500", desc: "Site Health & Speed", glow: "shadow-emerald-500/10" },
    { id: "outreach" as const, label: "Outreach", icon: Mail, color: "from-orange-500 to-red-500", desc: "Lead Hunting & Cold Email", glow: "shadow-orange-500/10" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Crown className="mr-2 h-3.5 w-3.5" /> Agency HQ
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Autonomous Agency Command Center</h1>
            <p className="max-w-3xl text-sm text-neutral-400">
              AI-powered SEO agency with a Director, 3 departments, and outreach — all autonomous.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Key className="mr-1 h-3 w-3" /> {API_KEYS.length} API Keys
            </Badge>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
              <Activity className="mr-1 h-3 w-3" /> 5 Agents Live
            </Badge>
            <Button onClick={() => setChatOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20">
              <MessageCircle className="mr-2 h-4 w-4" /> Chat with SEO Manager
            </Button>
          </div>
        </div>

        {/* DEPARTMENT SELECTOR — Premium 5-column grid */}
        <div className="mt-6 grid grid-cols-5 gap-3">
          {departments.map((dept) => {
            const isActive = activeDept === dept.id;
            const isDirector = dept.id === "director";
            return (
              <button key={dept.id} onClick={() => setActiveDept(dept.id)}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                  isActive
                    ? `border-amber-500/40 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-lg ${dept.glow}`
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900"
                }`}>
                {isDirector && isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                )}
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${dept.color} ${
                    isActive ? "opacity-100 scale-110" : "opacity-50"
                  } transition-all duration-300`}>
                    <dept.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isActive ? "text-neutral-100" : "text-neutral-400"} transition`}>{dept.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{dept.desc}</div>
                  </div>
                </div>
                {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}
              </button>
            );
          })}
        </div>

        {/* ═══ DIRECTOR DEPARTMENT — COMMAND CENTER ═══ */}
        {activeDept === "director" && (
          <DirectorCommandCenter
            directorStatus={directorStatus}
            directorJournal={directorJournal}
          />
        )}

        {/* ═══ CONTENT TEAM DEPARTMENT ═══ */}
        {activeDept === "content" && (
          <div className="mt-8">
            {/* SEO Stats */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Avg Position</CardDescription><CardTitle className="text-2xl">3.4</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><TrendingUp className="h-4 w-4 text-emerald-300" /> Google Search Console</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Click-Through Rate</CardDescription><CardTitle className="text-2xl">20%</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Zap className="h-4 w-4 text-amber-300" /> 22 clicks / 110 impressions</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Pages on Page 1</CardDescription><CardTitle className="text-2xl">3</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Shield className="h-4 w-4 text-blue-300" /> Tracked via GSC</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Articles Published</CardDescription><CardTitle className="text-2xl">7</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><PenTool className="h-4 w-4 text-violet-300" /> Automated via AI Engine</CardContent></Card>
            </div>

            {/* SEO Sub-Tabs */}
            <Tabs defaultValue="onpage" className="mt-8">
              <TabsList className="grid w-full grid-cols-3 bg-neutral-900">
                <TabsTrigger value="onpage"><Layout className="mr-2 h-4 w-4" /> On-Page SEO</TabsTrigger>
                <TabsTrigger value="offpage"><Link2 className="mr-2 h-4 w-4" /> Off-Page SEO</TabsTrigger>
                <TabsTrigger value="writer"><PenTool className="mr-2 h-4 w-4" /> Blog Writer</TabsTrigger>
              </TabsList>

              {/* ON-PAGE SEO */}
              <TabsContent value="onpage" className="mt-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="border-neutral-800 bg-neutral-900/70">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Code2 className="h-4 w-4 text-blue-300" /> Technical SEO Status</CardTitle>
                      <CardDescription>Automated fixes applied by the Technical SEO Agent</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { issue: "Viewport meta tag", status: "Fixed", detail: "Added to SEO.tsx for mobile rendering" },
                        { issue: "Canonical URLs", status: "Fixed", detail: "Dynamic canonical generation per route" },
                        { issue: "Organization Schema", status: "Fixed", detail: "JSON-LD injected into every page" },
                        { issue: "FAQ Schema", status: "Auto", detail: "Blog posts auto-generate FAQ markup" },
                        { issue: "Sitemap.xml", status: "Auto", detail: "Regenerated on every new publish" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                          <div><div className="text-sm text-neutral-200">{item.issue}</div><div className="text-xs text-neutral-500">{item.detail}</div></div>
                          <Badge variant="outline" className={item.status === "Fixed" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-blue-500/30 bg-blue-500/10 text-blue-300"}>
                            <CheckCircle2 className="mr-1 h-3 w-3" /> {item.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-neutral-800 bg-neutral-900/70">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Layout className="h-4 w-4 text-violet-300" /> Meta Tag Management</CardTitle>
                      <CardDescription>Dynamic meta handled by SEO.tsx component</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { tag: "Title Tags", scope: "Every page", method: "React Helmet Async" },
                        { tag: "Meta Description", scope: "Every page", method: "Dynamic from props" },
                        { tag: "Open Graph", scope: "All pages", method: "og:title, og:description, og:image" },
                        { tag: "Twitter Cards", scope: "All pages", method: "summary_large_image" },
                        { tag: "Core Web Vitals", scope: "Site-wide", method: "LCP < 2.5s, CLS < 0.1" },
                      ].map((item, i) => (
                        <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                          <div className="flex items-center justify-between"><div className="text-sm font-medium text-neutral-200">{item.tag}</div><Badge variant="outline" className="border-neutral-700 text-neutral-400">{item.scope}</Badge></div>
                          <div className="mt-1 text-xs text-neutral-500">{item.method}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* OFF-PAGE SEO */}
              <TabsContent value="offpage" className="mt-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="border-neutral-800 bg-neutral-900/70">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-emerald-300" /> GSC Performance</CardTitle>
                      <CardDescription>Data from Google Search Console (last 30 days)</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-center">
                          <div className="text-2xl font-bold text-emerald-300">3.4</div>
                          <div className="text-xs text-neutral-500">Avg Position</div>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-center">
                          <div className="text-2xl font-bold text-amber-300">20%</div>
                          <div className="text-xs text-neutral-500">CTR</div>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-center">
                          <div className="text-2xl font-bold text-blue-300">22</div>
                          <div className="text-xs text-neutral-500">Clicks</div>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-center">
                          <div className="text-2xl font-bold text-violet-300">110</div>
                          <div className="text-xs text-neutral-500">Impressions</div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                        <div className="text-xs font-medium text-amber-300">🎯 Opportunity Keyword</div>
                        <div className="mt-1 text-sm text-neutral-200">"fouriq" — Position 8 → Push to Top 3 with backlinks</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-neutral-800 bg-neutral-900/70">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Link2 className="h-4 w-4 text-amber-300" /> Backlink Strategy</CardTitle>
                      <CardDescription>Quality over quantity — natural link building</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { strategy: "Content Marketing", method: "Create linkable assets (reports, calculators)", target: "2-3/month" },
                        { strategy: "Guest Posting", method: "AI writes, you review & pitch", target: "2-3/month" },
                        { strategy: "Broken Link Building", method: "AI finds broken links, offers replacement", target: "2-3/month" },
                        { strategy: "Resource Pages", method: "Get listed on 'best agencies' lists", target: "1-2/month" },
                      ].map((item, i) => (
                        <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                          <div className="flex items-center justify-between"><div className="text-sm font-medium text-neutral-200">{item.strategy}</div><Badge variant="outline" className="border-neutral-700 text-neutral-400">{item.target}</Badge></div>
                          <div className="mt-1 text-xs text-neutral-500">{item.method}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* BLOG WRITER */}
              <TabsContent value="writer" className="mt-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="border-neutral-800 bg-neutral-900/70">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-violet-300" /> AI Writer Pipeline</CardTitle>
                      <CardDescription>Autonomous content engine with QA validation</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { step: "1. Researcher", desc: "Scans SERP, finds keyword gaps, builds semantic clusters", icon: Search, color: "text-blue-300" },
                        { step: "2. AI Manager", desc: "Reads GSC + RAG memory → creates strategy brief", icon: Bot, color: "text-violet-300" },
                        { step: "3. Writer", desc: "Writes 1000-word engineering case study", icon: PenTool, color: "text-amber-300" },
                        { step: "4. QA Inspector", desc: "3-check: human tone, brief compliance, completeness", icon: CheckCircle2, color: "text-emerald-300" },
                        { step: "5. Publisher", desc: "Schema injection, sitemap update, internal linking", icon: Sparkles, color: "text-cyan-300" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                          <item.icon className={`mt-0.5 h-5 w-5 ${item.color}`} />
                          <div><div className="text-sm font-medium text-neutral-200">{item.step}</div><div className="text-xs text-neutral-500">{item.desc}</div></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-neutral-800 bg-neutral-900/70">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-emerald-300" /> Recent Publications</CardTitle>
                      <CardDescription>Content published by the autonomous engine</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                        <div className="text-sm font-medium text-neutral-200">React Dashboard Performance Audit</div>
                        <div className="mt-1 text-xs text-neutral-500">Published Mar 18 · 1,965 words · QA Score: 90/100</div>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Human Tone: 9/10</Badge>
                          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">Pending Review</Badge>
                        </div>
                      </div>
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">Publish Frequency</div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                          <div><div className="text-lg font-bold text-neutral-200">1</div><div className="text-[10px] text-neutral-500">Mar 20</div></div>
                          <div><div className="text-lg font-bold text-neutral-200">1</div><div className="text-[10px] text-neutral-500">Mar 22</div></div>
                          <div><div className="text-lg font-bold text-amber-300">5</div><div className="text-[10px] text-neutral-500">Mar 23</div></div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">RAG Memory Status</div>
                        <div className="mt-2 text-sm text-neutral-300">1 article tracked · Day-28 classification: <span className="text-amber-300">Pending</span></div>
                        <div className="mt-1 text-xs text-neutral-500">Next check: Apr 1 (Day 14)</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ═══ STRUCTURAL TEAM DEPARTMENT ═══ */}
        {activeDept === "structural" && (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Deployed Pages</CardDescription><CardTitle className="text-2xl">4</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Layers className="h-4 w-4 text-blue-300" /> Service landing pages live</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Builder Engine</CardDescription><CardTitle className="text-xl">Gemini 3 Flash</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Code2 className="h-4 w-4 text-cyan-300" /> Autonomous React generator</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Status</CardDescription><CardTitle className="text-xl text-emerald-300">Active</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Auto-deploys pages on Director command</CardContent></Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <Card className="border-neutral-800 bg-neutral-900/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Code2 className="h-4 w-4 text-blue-300" /> Autonomous Builder Pipeline</CardTitle>
                  <CardDescription>How landing pages are created end-to-end</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { step: "1. Market Scanner", desc: "Analyzes config for high-value service niches", icon: Search, color: "text-blue-300" },
                    { step: "2. Page Architect", desc: "Designs page structure, sections, and conversion flow", icon: Layout, color: "text-violet-300" },
                    { step: "3. Page Builder", desc: "Writes production-ready React TSX component", icon: Code2, color: "text-cyan-300" },
                    { step: "4. Route Injector", desc: "Auto-injects route into App.tsx for deployment", icon: Layers, color: "text-emerald-300" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                      <item.icon className={`mt-0.5 h-5 w-5 ${item.color}`} />
                      <div><div className="text-sm font-medium text-neutral-200">{item.step}</div><div className="text-xs text-neutral-500">{item.desc}</div></div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4 text-emerald-300" /> Deployed Service Pages</CardTitle>
                  <CardDescription>Live landing pages built by the autonomous agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { page: "Enterprise Revenue Acceleration", route: "/services/enterprise-revenue-acceleration" },
                    { page: "Custom SaaS Platform Development", route: "/services/custom-saas-platform-development" },
                    { page: "Legacy Web Application Modernization", route: "/services/legacy-web-application-modernization" },
                    { page: "Enterprise Headless Commerce", route: "/services/enterprise-headless-commerce-development" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                      <div>
                        <div className="text-sm text-neutral-200">{item.page}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{item.route}</div>
                      </div>
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Live
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ═══ TECHNICAL TEAM DEPARTMENT ═══ */}
        {activeDept === "technical" && (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Site Health</CardDescription><CardTitle className="text-2xl text-emerald-300">Good</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Shield className="h-4 w-4 text-emerald-300" /> All checks passing</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>LCP</CardDescription><CardTitle className="text-2xl">&lt; 2.5s</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Zap className="h-4 w-4 text-amber-300" /> Largest Contentful Paint</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>CLS</CardDescription><CardTitle className="text-2xl">&lt; 0.1</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Layout className="h-4 w-4 text-blue-300" /> Cumulative Layout Shift</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Fixes Applied</CardDescription><CardTitle className="text-2xl">5</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Wrench className="h-4 w-4 text-violet-300" /> Auto-patched by agent</CardContent></Card>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <Card className="border-neutral-800 bg-neutral-900/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Wrench className="h-4 w-4 text-emerald-300" /> Technical SEO Fixes</CardTitle>
                  <CardDescription>Issues detected and patched by the Technical Agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { issue: "Viewport meta tag", status: "Fixed", detail: "Added to SEO.tsx for mobile rendering" },
                    { issue: "Canonical URLs", status: "Fixed", detail: "Dynamic canonical generation per route" },
                    { issue: "Organization Schema", status: "Fixed", detail: "JSON-LD injected into every page" },
                    { issue: "FAQ Schema", status: "Auto", detail: "Blog posts auto-generate FAQ markup" },
                    { issue: "Sitemap.xml", status: "Auto", detail: "Regenerated on every new publish" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                      <div><div className="text-sm text-neutral-200">{item.issue}</div><div className="text-xs text-neutral-500">{item.detail}</div></div>
                      <Badge variant="outline" className={item.status === "Fixed" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-blue-500/30 bg-blue-500/10 text-blue-300"}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> {item.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-blue-300" /> Meta Tag Management</CardTitle>
                  <CardDescription>Dynamic meta handled by SEO.tsx component</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { tag: "Title Tags", scope: "Every page", method: "React Helmet Async" },
                    { tag: "Meta Description", scope: "Every page", method: "Dynamic from props" },
                    { tag: "Open Graph", scope: "All pages", method: "og:title, og:description, og:image" },
                    { tag: "Twitter Cards", scope: "All pages", method: "summary_large_image" },
                    { tag: "Core Web Vitals", scope: "Site-wide", method: "LCP < 2.5s, CLS < 0.1" },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                      <div className="flex items-center justify-between"><div className="text-sm font-medium text-neutral-200">{item.tag}</div><Badge variant="outline" className="border-neutral-700 text-neutral-400">{item.scope}</Badge></div>
                      <div className="mt-1 text-xs text-neutral-500">{item.method}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ═══ OUTREACH DEPARTMENT ═══ */}
        {activeDept === "outreach" && (
          <div className="mt-8">
            {/* AI OUTREACH MANAGER BLOCK */}
            <Card className="mb-8 border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-neutral-900/50 shadow-lg shadow-emerald-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-400">
                  <Sparkles className="h-5 w-5" /> Autonomous AI Outreach Manager
                </CardTitle>
                <CardDescription className="text-neutral-400 max-w-2xl">
                  Let the AI automatically decide which high-value market to target today. It will analyze underserved niches, select a city, and immediately dispatch the scraper to build your campaign.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-emerald-500/20 bg-black/40">
                    <Button 
                      onClick={() => autoDecideNicheAndHunt()} 
                      disabled={isGeneratingNiche}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 px-6 py-6 text-base font-semibold">
                      {isGeneratingNiche && !manualNiche ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="mr-2 h-5 w-5" /> AI Pick & Hunt</>
                      )}
                    </Button>
                    <div className="flex-1 w-full bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">AI Status / Current Niche</div>
                        <div className={`mt-1 font-medium ${isGeneratingNiche ? 'text-emerald-400 animate-pulse' : aiNiche.startsWith('Error') ? 'text-red-400' : 'text-neutral-200'}`}>
                          {aiNiche || "Waiting for command..."}
                        </div>
                      </div>
                      {aiNiche.includes("Finished") && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-none">Analysis Complete</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 px-1">
                    <div className="relative flex-1 group">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                      <Input 
                        value={manualNiche}
                        onChange={(e) => setManualNiche(e.target.value)}
                        placeholder="Or manually type: e.g. Dentists in Miami"
                        className="pl-10 border-neutral-800 bg-neutral-900/50 text-neutral-200 focus:border-emerald-500/50"
                      />
                    </div>
                    <Button 
                      onClick={() => manualNiche && autoDecideNicheAndHunt(manualNiche)}
                      disabled={isGeneratingNiche || !manualNiche.trim()}
                      variant="outline"
                      className="border-neutral-700 bg-neutral-900 text-neutral-100 hover:bg-neutral-800 font-medium">
                      {isGeneratingNiche && manualNiche ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manual Hunt"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mt-1 px-1 py-3 border-t border-neutral-800/50">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-neutral-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400" /> Lead Quantity (Max 10)
                      </div>
                      <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-neutral-400 hover:text-white"
                          onClick={() => setLeadCount(Math.max(1, leadCount - 1))}
                        > - </Button>
                        <span className="w-8 text-center text-sm font-bold text-emerald-400">{leadCount}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-neutral-400 hover:text-white"
                          onClick={() => setLeadCount(Math.min(10, leadCount + 1))}
                        > + </Button>
                      </div>
                    </div>
                    <div className="text-[10px] text-neutral-600 italic">
                      More leads take longer to audit/draft.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button variant="outline" className="border-neutral-700 bg-neutral-900 text-neutral-100" onClick={exportLeads}><Download className="mr-2 h-4 w-4" /> Export leads CSV</Button>
              <Button variant="outline" className="border-neutral-700 bg-neutral-900 text-neutral-100" onClick={exportOutreach}><Download className="mr-2 h-4 w-4" /> Export outreach CSV</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Total leads</CardDescription><CardTitle className="text-2xl">{stats.totalLeads}</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><MapPinned className="h-4 w-4 text-blue-300" /> Maps, websites, directories</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Researched</CardDescription><CardTitle className="text-2xl">{stats.researched}</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Search className="h-4 w-4 text-violet-300" /> Problem & fix recorded</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Sent emails</CardDescription><CardTitle className="text-2xl">{stats.sent}</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Send className="h-4 w-4 text-amber-300" /> Exact body preserved</CardContent></Card>
              <Card className="border-neutral-800 bg-neutral-900/70"><CardHeader className="pb-2"><CardDescription>Replies tracked</CardDescription><CardTitle className="text-2xl">{stats.replied}</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-xs text-neutral-400"><MessageSquareReply className="h-4 w-4 text-emerald-300" /> Summary logged</CardContent></Card>
            </div>

            <Tabs value={outreachTab} onValueChange={setOutreachTab} className="mt-8">
              <TabsList className="grid w-full grid-cols-4 bg-neutral-900">
                <TabsTrigger value="leads">Lead Overview</TabsTrigger>
                <TabsTrigger value="audit">Audit Detail</TabsTrigger>
                <TabsTrigger value="mail">Draft & Send Mail</TabsTrigger>
                <TabsTrigger value="replies">Reply Tracking</TabsTrigger>
              </TabsList>

              <TabsContent value="leads" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                  <Card className="border-neutral-800 bg-neutral-900/70 flex flex-col h-[650px]">
                    <CardHeader className="flex-none pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Leads Directory</span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={importLeads} disabled={isImporting} className="h-7 px-2 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                            {isImporting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />} Sync Scraper
                          </Button>
                          <Badge variant="outline" className="text-neutral-400 border-neutral-700">{displayLeads.length}</Badge>
                        </div>
                      </CardTitle>
                      <div className="flex rounded-md border border-neutral-800 bg-neutral-950 p-1 mt-3">
                        <button onClick={() => setLeadFilter("collected")} className={`flex-1 rounded text-xs py-1.5 transition ${leadFilter === "collected" ? "bg-neutral-800 text-neutral-100 shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}>Collected Leads</button>
                        <button onClick={() => setLeadFilter("sent")} className={`flex-1 rounded text-xs py-1.5 transition ${leadFilter === "sent" ? "bg-neutral-800 text-neutral-100 shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}>Sent Mail</button>
                      </div>
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search business, niche..." className="mt-3 border-neutral-700 bg-neutral-950 text-sm h-9" />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 relative">
                      <ScrollArea className="h-full absolute inset-0">
                        <div className="space-y-2 p-4">
                        {displayLeads.length === 0 ? (
                          <div className="text-center text-sm text-neutral-500 mt-10">No leads found in this section.</div>
                        ) : displayLeads.map((lead) => (
                          <button key={lead.id} onClick={() => setSelectedLeadId(lead.id)}
                            className={`w-full rounded-lg border p-4 text-left transition ${selectedLeadId === lead.id ? "border-blue-500/40 bg-blue-500/10 shadow-sm" : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-medium text-neutral-100 line-clamp-1">{lead.businessName}</div>
                                <div className="mt-1 text-[11px] text-neutral-400 truncate max-w-[180px]">
                                  {lead.personalEmail && lead.personalEmail !== "Manual outreach needed" ? lead.personalEmail : lead.companyEmail}
                                </div>
                              </div>
                              <Badge variant="outline" className={`whitespace-nowrap ${statusColor(lead.status)}`}>{lead.status}</Badge>
                            </div>
                            <div className="mt-3 text-xs text-neutral-300 line-clamp-1 italic">{lead.niche} · {lead.location}</div>
                          </button>
                        ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  {selectedLead && (
                    <Card className="border-neutral-800 bg-neutral-900/70">
                      <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div><CardTitle className="text-base">{selectedLead.businessName}</CardTitle><CardDescription>{selectedLead.niche} in {selectedLead.location}</CardDescription></div>
                          <div className="flex items-center gap-2">
                             {isEditing ? (
                               <>
                                 <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-7 border-neutral-700">Cancel</Button>
                                 <Button size="sm" onClick={saveEdit} className="h-7 bg-blue-600 hover:bg-blue-500">Save Changes</Button>
                               </>
                             ) : (
                               <Button size="sm" variant="outline" onClick={() => startEditing(selectedLead)} className="h-7 border-neutral-700 hover:bg-neutral-800">
                                 <Edit2 className="h-3 w-3 mr-1" /> Edit Info
                               </Button>
                             )}
                             <Badge variant="outline" className={statusColor(selectedLead.status)}>{selectedLead.status}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Lead source</div><div className="mt-2 flex items-center gap-2 text-sm text-neutral-200"><MapPinned className="h-4 w-4 text-blue-300" /> {selectedLead.source}</div></div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                          <div className="text-xs uppercase tracking-wide text-neutral-500">Personal Email</div>
                          <div className="mt-2 text-sm text-neutral-200">
                            {isEditing ? <Input value={editForm.personalEmail} onChange={e => setEditForm({...editForm, personalEmail: e.target.value})} className="h-8 bg-black border-neutral-800" /> : (selectedLead.personalEmail || '—')}
                          </div>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                          <div className="text-xs uppercase tracking-wide text-neutral-500">Company Email</div>
                          <div className="mt-2 text-sm text-neutral-200">
                            {isEditing ? <Input value={editForm.companyEmail} onChange={e => setEditForm({...editForm, companyEmail: e.target.value})} className="h-8 bg-black border-neutral-800" /> : (selectedLead.companyEmail || '—')}
                          </div>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                          <div className="text-xs uppercase tracking-wide text-neutral-500">Phone</div>
                          <div className="mt-2 text-sm text-neutral-200">
                            {isEditing ? <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="h-8 bg-black border-neutral-800" /> : (selectedLead.phone || '—')}
                          </div>
                        </div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Address</div><div className="mt-2 text-sm text-neutral-200 text-xs">{selectedLead.address || '—'}</div></div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Rating</div><div className="mt-2 text-sm text-neutral-200">⭐ {selectedLead.rating || 'N/A'} ({selectedLead.reviewCount || '0'} reviews)</div></div>
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Confidence</div><div className="mt-2 flex items-center gap-2 text-sm text-neutral-200"><ShieldAlert className="h-4 w-4 text-amber-300" /> {selectedLead.confidence}</div></div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                {selectedLead && (
                  <Card className="border-neutral-800 bg-neutral-900/70">
                    <CardHeader><CardTitle className="text-base">Audit: {selectedLead.businessName}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {selectedLead.lighthouseScores && (
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                           <div className="flex flex-col items-center justify-center p-4 border border-neutral-800 rounded-lg bg-neutral-950">
                             <div className={`flex h-16 w-16 items-center justify-center rounded-full border-[4px] ${selectedLead.lighthouseScores.performanceScore >= 90 ? "border-green-500 text-green-500" : selectedLead.lighthouseScores.performanceScore >= 50 ? "border-amber-500 text-amber-500" : "border-red-500 text-red-500"} text-xl font-bold bg-neutral-900`}>
                               {selectedLead.lighthouseScores.performanceScore}
                             </div>
                             <div className="mt-3 text-xs font-medium uppercase tracking-wide text-neutral-400">Performance</div>
                           </div>
                           <div className="flex flex-col items-center justify-center p-4 border border-neutral-800 rounded-lg bg-neutral-950">
                             <div className={`flex h-16 w-16 items-center justify-center rounded-full border-[4px] ${selectedLead.lighthouseScores.seoScore >= 90 ? "border-green-500 text-green-500" : selectedLead.lighthouseScores.seoScore >= 50 ? "border-amber-500 text-amber-500" : "border-red-500 text-red-500"} text-xl font-bold bg-neutral-900`}>
                               {selectedLead.lighthouseScores.seoScore}
                             </div>
                             <div className="mt-3 text-xs font-medium uppercase tracking-wide text-neutral-400">SEO</div>
                           </div>
                           <div className="flex flex-col items-center justify-center p-4 border border-neutral-800 rounded-lg bg-neutral-950">
                             <div className={`flex h-16 w-16 items-center justify-center rounded-full border-[4px] ${selectedLead.lighthouseScores.accessibilityScore >= 90 ? "border-green-500 text-green-500" : selectedLead.lighthouseScores.accessibilityScore >= 50 ? "border-amber-500 text-amber-500" : "border-red-500 text-red-500"} text-xl font-bold bg-neutral-900`}>
                               {selectedLead.lighthouseScores.accessibilityScore}
                             </div>
                             <div className="mt-3 text-xs font-medium uppercase tracking-wide text-neutral-400">Accessibility</div>
                           </div>
                        </div>
                      )}
                      
                      {selectedLead.seoIssues && selectedLead.seoIssues.length > 0 && (
                        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 mb-4">
                          <div className="text-xs font-bold uppercase tracking-wide text-red-400 mb-2">Detected Technical SEO Flaws</div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
                            {selectedLead.seoIssues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                          </ul>
                        </div>
                      )}

                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Problem Summary (AI Generated)</div><div className="mt-2 text-base text-neutral-100">{selectedLead.problemTitle}</div><p className="mt-2 text-sm text-neutral-300">{selectedLead.problemDetail}</p></div>
                      <div className="grid gap-4 md:grid-cols-2">
                         <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Business Impact</div><p className="mt-2 text-sm text-neutral-300">{selectedLead.businessImpact}</p></div>
                         <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Likely Fix</div><p className="mt-2 text-sm text-neutral-300">{selectedLead.likelyFix}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="mail" className="mt-6">
                {selectedLead && selectedEmail && (
                  <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-neutral-800 bg-neutral-900/70">
                      <CardHeader><CardTitle className="text-base">Email on record</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Subject</div><div className="mt-2 text-sm text-neutral-100">{selectedEmail.subject}</div></div>
                          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"><div className="text-xs uppercase tracking-wide text-neutral-500">Angle</div><div className="mt-2 text-sm text-neutral-100">{selectedEmail.angle}</div></div>
                        </div>
                        <Textarea readOnly value={selectedEmail.body} className="min-h-[280px] border-neutral-800 bg-neutral-950 text-neutral-100" />
                      </CardContent>
                    </Card>
                    <Card className="border-neutral-800 bg-neutral-900/70">
                      <CardHeader><CardTitle className="text-base">Mail Settings & Control</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                          <label className="text-xs uppercase tracking-wide text-neutral-500 font-medium pb-2 block">Sender Email Address</label>
                          <Input 
                            value={selectedEmail.sentFrom}
                            onChange={(e) => setEmails(c => c.map(em => em.id === selectedEmail.id ? { ...em, sentFrom: e.target.value } : em))}
                            className="bg-neutral-900 border-neutral-700 text-neutral-100 focus-visible:ring-blue-500"
                            placeholder="e.g. hello@fouriqtech.com"
                          />
                          <div className="mt-2 text-[10px] text-neutral-500">This email will be used when dispatching via SMTP proxy.</div>
                        </div>

                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-neutral-200">Delivery Status</div>
                            <div className="text-xs text-neutral-400 mt-1">Ready to be dispatched</div>
                          </div>
                          <Badge variant="outline" className="border-neutral-700 bg-neutral-900">{selectedEmail.deliveryStatus}</Badge>
                        </div>

                        <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-5 mt-4">
                           <div className="flex items-center gap-2 text-blue-400 mb-3">
                              <Zap className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">Test Deliverability</span>
                           </div>
                           <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                              Want to check if this email lands in spam? Run the command below to send a real test email through your SMTP server.
                           </p>
                           <div className="bg-black border border-neutral-800 rounded p-3 flex items-center justify-between group">
                              <code className="text-[11px] text-blue-300 font-mono">node scripts/email-tester.mjs {selectedLead.personalEmail !== "Manual outreach needed" ? selectedLead.personalEmail : selectedLead.companyEmail}</code>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-white" onClick={() => {
                                 const cmd = `node scripts/email-tester.mjs ${selectedLead.personalEmail !== "Manual outreach needed" ? selectedLead.personalEmail : selectedLead.companyEmail}`;
                                 navigator.clipboard.writeText(cmd);
                                 alert("Command copied!");
                              }}>
                                 <Copy className="h-3 w-3" />
                              </Button>
                           </div>
                           <div className="mt-3 text-[10px] text-neutral-500 italic">
                              * Requires your SMTP credentials in .env
                           </div>
                        </div>
                        
                        <Button 
                          onClick={handleSendEmail} 
                          disabled={isSending || selectedEmail.deliveryStatus === "sent" || selectedEmail.deliveryStatus === "reply_received"}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-50 hover:to-cyan-50 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                          {isSending ? (
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                             <Send className="mr-2 h-4 w-4" /> 
                          )}
                          {selectedEmail.deliveryStatus === "sent" || selectedEmail.deliveryStatus === "reply_received" 
                             ? "Mail Already Sent" 
                             : isSending ? "Sending outreach..." : "Send Real Outreach Mail Now"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="replies" className="mt-6">
                {selectedLead && selectedEmail && (
                  <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="border-neutral-800 bg-neutral-900/70">
                      <CardHeader><CardTitle className="text-base">Reply log</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {selectedReplies.length ? selectedReplies.map((reply) => (
                          <div key={reply.id} className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                            <div className="flex items-center justify-between gap-3"><div className="text-sm font-medium text-neutral-100">Reply received</div><div className="text-xs text-neutral-500">{reply.receivedAt}</div></div>
                            <p className="mt-3 text-sm text-neutral-300">{reply.summary}</p>
                            <div className="mt-3 rounded-md bg-neutral-900 p-3 text-sm text-neutral-200">Next step: {reply.nextStep}</div>
                          </div>
                        )) : (
                          <div className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-400">No reply recorded yet.</div>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="border-neutral-800 bg-neutral-900/70">
                      <CardHeader><CardTitle className="text-base">Add reply note</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea value={newReply.summary} onChange={(e) => setNewReply((c) => ({ ...c, summary: e.target.value }))} placeholder="What did the prospect say?" className="min-h-[120px] border-neutral-800 bg-neutral-950 text-neutral-100" />
                        <Textarea value={newReply.nextStep} onChange={(e) => setNewReply((c) => ({ ...c, nextStep: e.target.value }))} placeholder="What should happen next?" className="min-h-[120px] border-neutral-800 bg-neutral-950 text-neutral-100" />
                        <Button onClick={addReply} className="w-full bg-emerald-600 text-white hover:bg-emerald-500"><Sparkles className="mr-2 h-4 w-4" /> Save reply context</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* SEO CHAT PANEL */}
      <SEOChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
