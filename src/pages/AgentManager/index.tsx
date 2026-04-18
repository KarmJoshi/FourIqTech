import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Crown, PenTool, Wrench, MessageCircle,
  Activity, Layers, Zap, Clock, Globe,
  CheckCircle2, FileText, Layout, Mail, Shield, Link2, TrendingUp, Code2, BarChart3, Sparkles, ShieldAlert
} from "lucide-react";

// Modular Components
import { StatsBar } from "./components/StatsBar";
import { ControlHub } from "./components/ControlHub";
import { ActivityFeed } from "./components/ActivityFeed";
import { StagingQueue } from "./components/StagingQueue";
import { ChatPanel } from "./components/ChatPanel";
import { ModelSelectionMatrix } from "./components/ModelSelectionMatrix";
import { OutreachDepartment } from "./components/OutreachDepartment";

// Department Views
import { ContentHubDepartment } from "./components/ContentHubDepartment";
import { TechSeoDepartment } from "./components/TechSeoDepartment";
import { LandingPagesDepartment } from "./components/LandingPagesDepartment";

// Constants & Types
const STORAGE_KEYS = {
  chat: "fouriq_chat_history_v2",
  leads: "fouriq_leads_v2",
  emails: "fouriq_emails_v2",
  replies: "fouriq_replies_v2",
};

const API_KEYS = (
  import.meta.env.VITE_GEMINI_API_KEYS ||
  import.meta.env.VITE_GEMINI_PRO_API_KEY ||
  import.meta.env.VITE_GEMINI_API_KEY ||
  ""
).split(",").filter(Boolean);

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "http://localhost:3848");

type DeptId = "director" | "content" | "techseo" | "landing" | "outreach";

export default function AgentManager() {
  // Navigation State
  const [activeDept, setActiveDept] = useState<DeptId>("director");
  const [chatOpen, setChatOpen] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // System State (from API)
  const [directorStatus, setDirectorStatus] = useState<any>(null);
  const [directorJournal, setDirectorJournal] = useState<any>(null);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [stagingQueue, setStagingQueue] = useState<any[]>([]);
  const [stagingStats, setStagingStats] = useState<any>(null);
  const [runningTasks, setRunningTasks] = useState<Record<string, any>>({});
  const [intelligence, setIntelligence] = useState<any>(null);
  const [isDispatching, setIsDispatching] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState({
    isAutoPilot: false,
    startTime: "10:00",
    cyclesPerDay: 1,
    lastRunAt: null
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [draftStartTime, setDraftStartTime] = useState<string | null>(null);
  const [draftFreq, setDraftFreq] = useState<number | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [apiKeyIndex, setApiKeyIndex] = useState(0);

  // Outreach State
  const [leads, setLeads] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [outreachTab, setOutreachTab] = useState("leads");
  const [leadFilter, setLeadFilter] = useState<"collected" | "sent">("collected");
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingNiche, setIsGeneratingNiche] = useState(false);
  const [aiNiche, setAiNiche] = useState("");
  const [manualNiche, setManualNiche] = useState("");
  const [leadCount, setLeadCount] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editForm, setEditForm] = useState<any>({ personalEmail: "", companyEmail: "", phone: "" });
  const [newReply, setNewReply] = useState({ summary: "", nextStep: "" });

  // Preview State
  const [previewContent, setPreviewContent] = useState<{ id: string; content: string } | null>(null);

  // Initial Data Load
  useEffect(() => {
    const savedChat = localStorage.getItem(STORAGE_KEYS.chat);
    const savedLeads = localStorage.getItem(STORAGE_KEYS.leads);
    const savedEmails = localStorage.getItem(STORAGE_KEYS.emails);
    const savedReplies = localStorage.getItem(STORAGE_KEYS.replies);

    if (savedChat) setChatHistory(JSON.parse(savedChat));
    if (savedLeads) setLeads(JSON.parse(savedLeads));
    if (savedEmails) setEmails(JSON.parse(savedEmails));
    if (savedReplies) setReplies(JSON.parse(savedReplies));
  }, []);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chatHistory)); }, [chatHistory]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.emails, JSON.stringify(emails)); }, [emails]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.replies, JSON.stringify(replies)); }, [replies]);

  // API Refresh Interval
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statRes, journalRes, feedRes, stagingRes, tasksRes, intelligenceRes, settingsRes, leadsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/status`).catch(() => null),
          fetch(`${API_BASE_URL}/api/journal`).catch(() => null),
          fetch(`${API_BASE_URL}/api/activity`).catch(() => null),
          fetch(`${API_BASE_URL}/api/staging`).catch(() => null),
          fetch(`${API_BASE_URL}/api/tasks`).catch(() => null),
          fetch(`${API_BASE_URL}/api/intelligence`).catch(() => null),
          fetch(`${API_BASE_URL}/api/settings`).catch(() => null),
          fetch(`${API_BASE_URL}/api/leads`).catch(() => null)
        ]);

        if (statRes?.ok) setDirectorStatus(await statRes.json());
        setApiOnline(Boolean(statRes?.ok));
        if (journalRes?.ok) setDirectorJournal(await journalRes.json());
        
        if (leadsRes?.ok) {
           const leadData = await leadsRes.json();
           const fetchedLeads = leadData.leads || [];
           setLeads(fetchedLeads);
           
           // Extract draft emails from leads
           const extractedEmails = fetchedLeads
             .filter((l: any) => l.draftEmail)
             .map((l: any) => l.draftEmail);
           setEmails(extractedEmails);
        }

        if (feedRes?.ok) {
          const data = await feedRes.json();
          setActivityFeed(data.entries || []);
        }

        if (stagingRes?.ok) {
          const data = await stagingRes.json();
          setStagingQueue(data.queue || []);
          setStagingStats(data.stats || {});
        }

        if (tasksRes?.ok) setRunningTasks(await tasksRes.json());
        if (intelligenceRes?.ok) setIntelligence(await intelligenceRes.json());
        if (settingsRes?.ok) setScheduleSettings(await settingsRes.json());
      } catch (e) {
        setApiOnline(false);
        console.error("API Sync Error", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const dispatchDirectorCycle = async () => {
    setIsDispatching("director");
    try {
      await fetch(`${API_BASE_URL}/api/director/cycle`, { method: "POST" });
    } catch (e) {
      console.error("Dispatch Error", e);
    } finally {
      setIsDispatching(null);
    }
  };

  const dispatchDepartment = async (dept: string) => {
    setIsDispatching(dept);
    try {
      await fetch(`${API_BASE_URL}/api/dispatch/${dept}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: `Manager dispatched ${dept} team via command center` })
      });
    } catch (e) {
      console.error("Dispatch Error", e);
    } finally {
      setIsDispatching(null);
    }
  };

  const updateScheduleSettings = async (updates: any) => {
    setIsUpdatingSettings(true);
    const newSettings = { ...scheduleSettings, ...updates };
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setScheduleSettings(data.settings);
      }
    } catch (e) {
      console.error("Settings Update Error", e);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const reviewItem = async (id: string, verdict: "approved" | "rejected", feedback: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/staging/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, feedback })
      });
    } catch (e) {
      console.error("Review Error", e);
    }
  };

  const previewItem = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/staging/${id}/content`);
      if (res.ok) {
        const data = await res.json();
        setPreviewContent({ id, content: data.content || "No content available." });
      }
    } catch (e) {
      console.error("Preview Error", e);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const currentInput = chatInput;
    const userMsg = { role: "user", content: currentInput, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const key = API_KEYS[apiKeyIndex];
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: currentInput }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        })
      });
      const data = await res.json();
      const aiMsg = {
        role: "assistant",
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || "Communication timeout.",
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, aiMsg]);
      setApiKeyIndex((prev) => (prev + 1) % API_KEYS.length);
    } catch (e) {
      console.error("Chat Error", e);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Outreach Helpers (logic migrated)
  const autoDecideNicheAndHunt = async (override?: string) => {
    setIsGeneratingNiche(true);
    const chosen = override || manualNiche;
    setAiNiche(chosen ? `${chosen} (Hunting...)` : "Analyzing market signals...");
    
    try {
      let finalNiche = chosen;
      if (!finalNiche) {
        // AI Logic for Picking Niche (Simplified for brevity)
        finalNiche = "Roofers in Miami"; 
      }
      
      const res = await fetch(`${API_BASE_URL}/api/run-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "lead_hunter", args: [finalNiche, String(leadCount)] })
      });
      if ((await res.json()).success) {
        setAiNiche(`${finalNiche} (Campaign Finished)`);
        alert("Hunt protocol completed. Sync leads to review.");
      }
    } catch (e) {
      setAiNiche("Signal interference error.");
    } finally {
      setIsGeneratingNiche(false);
    }
  };

  const handleSendEmail = async () => {
    const lead = leads.find(l => l.id === selectedLeadId);
    const email = emails.find(e => e.leadId === selectedLeadId);
    if (!lead || !email) return;

    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: editForm?.id === selectedLeadId ? editForm.contactEmail : lead.contactEmail,
          subject: email.subject,
          body: email.body,
          fromName: "Karm Joshi (FourIqTech)",
          leadId: lead.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmails(c => c.map(e => e.id === email.id ? { ...e, deliveryStatus: "sent", sentAt: new Date().toLocaleString() } : e));
        setLeads(c => c.map(l => l.id === lead.id ? { ...l, status: "sent" } : l));
        setLeadFilter("sent");
        setOutreachTab("replies");
      }
    } catch (e) {
      alert("Mail dispatch failed.");
    } finally {
      setIsSending(false);
    }
  };

  const exportLeads = () => {
    if (leads.length === 0) return;
    const headers = Object.keys(leads[0]);
    const escapeCell = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...leads.map(row => headers.map(h => escapeCell(row[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `fouriq_leads_${new Date().toISOString().slice(0,10)}.csv`; link.click();
  };

  const exportOutreach = () => {
    if (emails.length === 0) return;
    const headers = Object.keys(emails[0]);
    const escapeCell = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...emails.map(row => headers.map(h => escapeCell(row[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `fouriq_outreach_${new Date().toISOString().slice(0,10)}.csv`; link.click();
  };

  const syncLeads = async () => {
    setIsImporting(true);
    console.log("[Sync Hub] Synchronizing intelligence with backend database...");
    try {
      // 1. Trigger migration from JSON scraper output to PostgreSQL
      await fetch(`${API_BASE_URL}/api/leads/sync-scraper`, { method: 'POST' });

      // 2. Fetch all leads (now updated with intelligence and emails)
      const res = await fetch(`${API_BASE_URL}/api/leads`);
      if (res.ok) {
        const data = await res.json();
        if (data.leads && data.leads.length > 0) {
          // Overwrite local state with fresh server data to fix stale cache issues
          const freshLeads = data.leads.map((l: any) => ({
            ...l,
            collectedAt: l.collectedAt ? new Date(l.collectedAt).toLocaleDateString() : 'N/A'
          }));
          
          setLeads(freshLeads);

          // Deep sync of all outreach emails
          const freshEmails = data.leads
            .filter((l: any) => l.draftEmail)
            .map((l: any) => ({ ...l.draftEmail, leadId: l.id }));
          
          setEmails(freshEmails);

          setTimeout(() => alert(`Successfully synchronized ${freshLeads.length} leads with full intelligence and outreach drafts.`), 100);
        } else {
          alert("No leads found in the hunter database. Start a new hunt first.");
        }
      } else {
        throw new Error(`API Status: ${res.status}`);
      }
    } catch (err) {
      console.error("[Sync Hub] Sync failed:", err);
      alert("Failed to sync leads. Verify the Agency API is running on port 3848.");
    } finally {
      setIsImporting(false);
    }
  };

  const departments: { id: DeptId; label: string; icon: any; color: string; desc: string }[] = [
    { id: "director", label: "Agency Director", icon: Crown, color: "text-ai-primary", desc: "Strategic Command" },
    { id: "content", label: "Content Hub", icon: PenTool, color: "text-ai-purple", desc: "Blog & Articles" },
    { id: "techseo", label: "Tech SEO", icon: Wrench, color: "text-ai-tertiary", desc: "Site Integrity" },
    { id: "landing", label: "Landing Pages", icon: Globe, color: "text-ai-blue", desc: "Service Pages" },
    { id: "outreach", label: "Outreach Agent", icon: Mail, color: "text-amber-400", desc: "Market Acquisition" },
  ];

  const outreachStats = useMemo(() => {
    return {
      totalLeads: leads.length,
      researched: leads.filter(l => ["researched", "drafted", "sent"].includes(l.status)).length,
      sent: emails.filter(e => e.deliveryStatus === "sent").length,
      replied: replies.length
    };
  }, [leads, emails, replies]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId === "FouriqTech" && loginPassword === "#Fouriqtech04") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid ID or Password");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-aether-base flex items-center justify-center text-slate-50 font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-ai-primary/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-ai-secondary/[0.02] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />

        <Card className="w-[420px] max-w-[90vw] border-ai-primary/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative z-10">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <Crown className="h-10 w-10 text-ai-primary opacity-80" />
            </div>
            <CardTitle className="text-center text-2xl font-bold font-display text-white tracking-wide">Agency Command</CardTitle>
            <CardDescription className="text-center text-slate-400">Secure Access Required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator ID</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-ai-primary transition-colors text-sm"
                  placeholder="Enter ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authentication Code</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-ai-primary transition-colors text-sm font-mono"
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-red-400 text-xs text-center font-bold">{loginError}</p>}
              <Button type="submit" className="w-full bg-ai-primary text-slate-950 hover:bg-ai-primary/90 font-bold h-12 rounded-xl mt-2">
                INITIALIZE LINK
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aether-base text-slate-50 font-sans selection:bg-ai-primary/30 selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-ai-primary/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-ai-secondary/[0.02] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="border-ai-primary/20 bg-ai-primary/5 text-ai-primary px-3 py-1 font-bold tracking-[0.15em] uppercase text-[9px] rounded-full shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                <Crown className="mr-2 h-3 w-3" /> STRATEGIC COMMAND
              </Badge>
              <span className={`h-2 w-2 rounded-full ${apiOnline ? "bg-ai-tertiary" : "bg-red-400"}`} />
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-500">
                {apiOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              Agency <span className="ai-gradient-text uppercase">Manager</span>
            </h1>
          </div>
          <Button
            onClick={() => setChatOpen(true)}
            className="relative h-12 sm:h-14 px-6 sm:px-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ai-primary/40 text-white font-bold transition-all shadow-2xl group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-ai-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-ai-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm">AI CHAT</span>
          </Button>
        </div>

        {/* Department Tabs — Scrollable on mobile */}
        <div className="mb-8 sm:mb-10">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {departments.map((dept) => {
              const isActive = activeDept === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setActiveDept(dept.id)}
                  className={`group relative flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-left transition-all duration-300 shrink-0 min-w-[160px] sm:min-w-0 ${isActive
                    ? "border-ai-primary/40 bg-ai-primary/[0.06] shadow-[0_0_25px_rgba(56,189,248,0.06)]"
                    : "border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/50 border border-slate-800 transition-all duration-300 ${isActive ? "border-ai-primary/50 " + dept.color : "text-slate-500 group-hover:text-slate-300"
                  }`}>
                    <dept.icon className={`h-5 w-5 transition-all duration-500 ${isActive ? "scale-110" : ""}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-400"}`}>{dept.label}</div>
                    <div className={`text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5 ${isActive ? dept.color + "/70" : "text-slate-600"}`}>
                      {dept.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Offline Warning */}
        {!apiOnline && (
          <Card className="mb-8 aether-card bg-red-500/5 border-red-500/20 rounded-[20px]">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-bold text-red-300 uppercase tracking-[0.15em]">Agency API Offline</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Cannot reach {API_BASE_URL}. {API_BASE_URL.includes('localhost')
                  ? "Run the local API on port 3848."
                  : "Verify Render service is active."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* MAIN CONTENT */}
        <main>
          {/* ── DIRECTOR ── */}
          {activeDept === "director" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Stats */}
              <StatsBar
                directorStatus={directorStatus}
                stagingStats={stagingStats}
                pendingCount={stagingQueue.filter(s => s.status === "pending_review").length}
                runningTasks={runningTasks}
                intelligence={intelligence}
              />

              {/* Auto-Pilot */}
              <Card className="aether-card border-ai-primary/20 bg-ai-primary/[0.02] rounded-[24px] sm:rounded-[32px] overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${scheduleSettings.isAutoPilot ? "text-ai-tertiary animate-pulse" : "text-slate-600"}`} />
                        <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">AUTONOMOUS MODE</span>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-display font-bold">Strategic Auto-Pilot</CardTitle>
                    </div>
                    <div className="flex items-center gap-6 bg-slate-950/40 p-2 rounded-2xl border border-white/5 self-start">
                      <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${scheduleSettings.isAutoPilot ? "text-ai-tertiary" : "text-slate-500"}`}>
                          {scheduleSettings.isAutoPilot ? "AUTO-PILOT ACTIVE" : "AUTO-PILOT STANDBY"}
                        </span>
                        <button
                          onClick={() => updateScheduleSettings({ isAutoPilot: !scheduleSettings.isAutoPilot })}
                          disabled={isUpdatingSettings}
                          className={`h-7 w-12 rounded-full transition-all relative ${scheduleSettings.isAutoPilot ? "bg-ai-tertiary" : "bg-slate-800"}`}
                        >
                          <div className={`absolute top-1 bottom-1 w-5 rounded-full bg-white transition-all ${scheduleSettings.isAutoPilot ? "right-1" : "left-1"}`} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${(scheduleSettings as any).isAutoCommit ? "text-ai-primary" : "text-slate-500"}`}>
                          {(scheduleSettings as any).isAutoCommit ? "GIT PUSH ENABLED" : "GIT PUSH DISABLED"}
                        </span>
                        <button
                          onClick={() => updateScheduleSettings({ isAutoCommit: !(scheduleSettings as any).isAutoCommit })}
                          disabled={isUpdatingSettings}
                          className={`h-7 w-12 rounded-full transition-all relative ${(scheduleSettings as any).isAutoCommit ? "bg-ai-primary shadow-[0_0_15px_rgba(56,189,248,0.3)]" : "bg-slate-800"}`}
                        >
                          <div className={`absolute top-1 bottom-1 w-5 rounded-full bg-white transition-all ${(scheduleSettings as any).isAutoCommit ? "right-1" : "left-1"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Start Time
                      </label>
                      <input
                        type="time"
                        value={draftStartTime !== null ? draftStartTime : scheduleSettings.startTime}
                        onChange={(e) => setDraftStartTime(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold text-ai-primary focus:border-ai-primary/50 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Frequency
                      </label>
                      <select
                        value={draftFreq !== null ? draftFreq : scheduleSettings.cyclesPerDay}
                        onChange={(e) => setDraftFreq(parseInt(e.target.value))}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-ai-primary/50 transition-all outline-none appearance-none"
                      >
                        <option value={1}>1 Cycle / Day</option>
                        <option value={2}>2 Cycles / Day</option>
                        <option value={4}>Every 6 Hours</option>
                        <option value={12}>Every 2 Hours</option>
                        <option value={24}>Hourly</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end">
                      {(draftStartTime !== null || draftFreq !== null) ? (
                        <button
                          onClick={() => {
                            updateScheduleSettings({
                              startTime: draftStartTime !== null ? draftStartTime : scheduleSettings.startTime,
                              cyclesPerDay: draftFreq !== null ? draftFreq : scheduleSettings.cyclesPerDay
                            });
                            setDraftStartTime(null);
                            setDraftFreq(null);
                          }}
                          disabled={isUpdatingSettings}
                          className="h-[42px] px-4 rounded-xl bg-ai-primary text-slate-950 font-bold hover:bg-ai-primary/90 transition-all border border-transparent disabled:opacity-50"
                        >
                          Save Settings
                        </button>
                      ) : (
                        <div className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 h-[42px]">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Last Pulse</p>
                          <p className="text-[11px] font-mono text-ai-primary/70">
                            {scheduleSettings.lastRunAt ? new Date(scheduleSettings.lastRunAt).toLocaleTimeString() : "Never"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model Selection Matrix */}
              <ModelSelectionMatrix 
                currentModels={scheduleSettings.agentModels || {}}
                onUpdate={(models) => updateScheduleSettings({ agentModels: models })}
                isUpdating={isUpdatingSettings}
              />

              {/* Dispatch + Queue + Feed */}
              <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                <div className="space-y-8">
                  <ControlHub
                    dispatchDepartment={dispatchDepartment}
                    dispatchDirectorCycle={dispatchDirectorCycle}
                    isDispatching={isDispatching}
                    runningTasks={runningTasks}
                  />
                  <div className="space-y-4">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
                      <Layers className="h-4 w-4 text-ai-primary" /> STAGING QUEUE
                    </h2>
                    <StagingQueue
                      stagingQueue={stagingQueue}
                      reviewItem={reviewItem}
                      previewItem={previewItem}
                      previewContent={previewContent}
                      setPreviewContent={setPreviewContent}
                    />
                  </div>
                </div>
                <aside>
                  <div className="space-y-4 sticky top-6">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
                      <Activity className="h-4 w-4 text-ai-tertiary" /> LIVE ACTIVITY
                    </h2>
                    <ActivityFeed activityFeed={activityFeed} />
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* ── CONTENT HUB ── */}
          {activeDept === "content" && (
            <ContentHubDepartment
              intelligence={intelligence}
              activityFeed={activityFeed}
              runningTasks={runningTasks}
            />
          )}

          {/* ── TECH SEO ── */}
          {activeDept === "techseo" && (
            <TechSeoDepartment
              intelligence={intelligence}
              activityFeed={activityFeed}
              runningTasks={runningTasks}
              directorStatus={directorStatus}
            />
          )}

          {/* ── LANDING PAGES ── */}
          {activeDept === "landing" && (
            <LandingPagesDepartment
              intelligence={intelligence}
              activityFeed={activityFeed}
              stagingQueue={stagingQueue}
            />
          )}

          {/* ── OUTREACH ── */}
          {activeDept === "outreach" && (
            <OutreachDepartment 
              leads={leads}
              emails={emails}
              replies={replies}
              stats={outreachStats}
              outreachTab={outreachTab}
              setOutreachTab={setOutreachTab}
              autoDecideNicheAndHunt={autoDecideNicheAndHunt}
              isGeneratingNiche={isGeneratingNiche}
              aiNiche={aiNiche}
              manualNiche={manualNiche}
              setManualNiche={setManualNiche}
              leadCount={leadCount}
              setLeadCount={setLeadCount}
              exportLeads={exportLeads}
              exportOutreach={exportOutreach}
              syncLeads={async () => {
                try {
                  await fetch(`${API_BASE_URL}/api/leads/sync-scraper`, { method: 'POST' });
                  await syncLeads();
                } catch (err) {
                  console.error("Sync failed", err);
                }
              }}
              isImporting={isImporting}
              selectedLeadId={selectedLeadId}
              setSelectedLeadId={setSelectedLeadId}
              leadFilter={leadFilter}
              setLeadFilter={setLeadFilter}
              search={search}
              setSearch={setSearch}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              editForm={editForm}
              setEditForm={setEditForm}
              saveEdit={async () => { 
                try {
                  const res = await fetch(`${API_BASE_URL}/api/leads/${selectedLeadId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      businessName: editForm.businessName,
                      contactEmail: editForm.contactEmail,
                      website: editForm.website,
                      niche: editForm.niche,
                      status: editForm.status,
                      location: editForm.location,
                      problemTitle: editForm.problemTitle,
                      problemDetail: editForm.problemDetail
                    })
                  });

                  if (res.ok) {
                    setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, ...editForm } : l)); 
                    setIsEditing(false); 
                  } else {
                    const errorData = await res.json();
                    alert(`Failed to save changes: ${errorData.error || 'Unknown error'}`);
                  }

                } catch (err) {
                  console.error("Save failed", err);
                  alert("Network error while saving.");
                }
              }}
              startEditing={(l: any) => { setSelectedLeadId(l.id); setEditForm(l); setIsEditing(true); }}
              handleSendEmail={handleSendEmail}
              isSending={isSending}
              addReply={async () => { setReplies(prev => [...prev, { ...newReply, id: `reply-${Date.now()}`, leadId: selectedLeadId }]); setNewReply({ summary: "", nextStep: "" }); }}
              newReply={newReply}
              setNewReply={setNewReply}
            />
          )}
        </main>
      </div>

      {/* Chat Overlay */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatHistory}
        input={chatInput}
        setInput={setChatInput}
        isLoading={isChatLoading}
        handleSend={handleChatSend}
        clearHistory={() => setChatHistory([])}
        keyLabel={`Gemini 2.0 Flash`}
        totalKeys={API_KEYS.length}
      />
    </div>
  );
}
