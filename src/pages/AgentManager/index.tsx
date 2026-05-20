import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Crown, PenTool, Wrench, MessageCircle,
  Activity, Layers, Zap, Clock, Globe,
  CheckCircle2, FileText, Layout, Mail, Shield, Link2, TrendingUp, Code2, BarChart3, Sparkles, ShieldAlert,
  Instagram
} from "lucide-react";



// Modular Components
import { StatsBar } from "./components/StatsBar";
import { ControlHub } from "./components/ControlHub";
import { ActivityFeed } from "./components/ActivityFeed";
import { StagingQueue } from "./components/StagingQueue";
import { ChatPanel } from "./components/ChatPanel";
import { ModelSelectionMatrix } from "./components/ModelSelectionMatrix";
import { OutreachDepartment } from "./components/OutreachDepartment";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

// Department Views
import { ContentHubDepartment } from "./components/ContentHubDepartment";
import { TechSeoDepartment } from "./components/TechSeoDepartment";
import { LandingPagesDepartment } from "./components/LandingPagesDepartment";
import { InstagramDepartment } from "./components/InstagramDepartment";


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

type DeptId = "director" | "content" | "techseo" | "landing" | "outreach" | "instagram";


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
    // Optimistic Update: Set values immediately to prevent "flicker" during polling
    setScheduleSettings(prev => ({ ...prev, ...updates }));
    
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
      // Rollback on error
      const fetchSettings = async () => {
         const res = await fetch(`${API_BASE_URL}/api/settings`);
         if(res.ok) setScheduleSettings(await res.json());
      };
      fetchSettings();
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
        // 🤖 Real AI Niche Picker — Gemini picks the best high-ticket niche
        setAiNiche("AI scanning for best niche...");
        const HIGH_VALUE_NICHES = [
          "dental clinics", "law firms", "real estate agencies", "med spas",
          "private gyms", "auto repair shops", "wedding photographers",
          "accounting firms", "chiropractors", "interior designers",
          "plumbing companies", "HVAC companies", "landscaping companies",
          "cosmetic surgeons", "physical therapists"
        ];
        const existingLeadNiches = leads.map((l: any) => l.niche).filter(Boolean);
        
        const apiKey = API_KEYS[apiKeyIndex];
        if (apiKey) {
          const prompt = `You are a lead generation strategist picking the best niche to target for cold email outreach.

HIGH-VALUE NICHES TO CHOOSE FROM:
${HIGH_VALUE_NICHES.join(", ")}

NICHES ALREADY HUNTED (avoid these):
${existingLeadNiches.slice(-5).join(", ") || "None yet"}

Pick the SINGLE BEST niche right now based on:
1. High monthly revenue (so they can afford a website fix)
2. High probability of having an email address on their website
3. Good digital marketing gaps (outdated websites, slow loading)
4. Respond with ONLY the niche name + "in [major US city]". Example: "dental clinics in Houston"
No extra words. Just the niche string.`;

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,

            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 50, temperature: 0.8 }
              })
            }
          );
          const data = await res.json();
          const aiPick = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (aiPick && aiPick.length > 3 && aiPick.length < 80) {
            finalNiche = aiPick;
          }
        }

        // Safe fallback if Gemini fails
        if (!finalNiche) {
          const unused = HIGH_VALUE_NICHES.filter(n => 
            !existingLeadNiches.some((e: string) => e?.toLowerCase().includes(n.toLowerCase()))
          );
          const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Dallas", "Miami"];
          const randomNiche = unused[Math.floor(Math.random() * unused.length)] || HIGH_VALUE_NICHES[0];
          const randomCity = cities[Math.floor(Math.random() * cities.length)];
          finalNiche = `${randomNiche} in ${randomCity}`;
        }

        setAiNiche(`${finalNiche} (Hunting...)`);
        setApiKeyIndex((prev) => (prev + 1) % API_KEYS.length);
      }
      
      const res = await fetch(`${API_BASE_URL}/api/run-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "lead_hunter", args: [finalNiche, String(leadCount)] })
      });
      const data = await res.json();
      if (data.success) {
        setAiNiche(`${finalNiche} ✅ Campaign Finished`);
        const leadsRes = await fetch(`${API_BASE_URL}/api/leads`);
        if (leadsRes.ok) setLeads((await leadsRes.json()).leads || []);
        alert(`Hunt complete: "${finalNiche}". Directory updated.`);
      }
    } catch (e: any) {
      console.error("Hunt error:", e);
      setAiNiche(`Error: ${e.message || "Signal interference"}`);
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
          body: (editForm?.id === selectedLeadId && editForm.emailBody) ? editForm.emailBody : email.body,
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
        // Clear edit form
        setEditForm({ contactEmail: "", emailBody: "", id: null });
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
    { id: "instagram", label: "Social Hub", icon: Instagram, color: "text-pink-500", desc: "Insta Brand" },
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

  const pendingCount = stagingQueue.filter(s => s.status === "pending_review").length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validId = import.meta.env.VITE_ADMIN_ID || "FouriqTech";
    const validPass = import.meta.env.VITE_ADMIN_PASS || "#Fouriqtech04";
    if (loginId === validId && loginPassword === validPass) {
      setIsAuthenticated(true);
      setLoginError("");
      sessionStorage.setItem("fouriq_auth", "true");
    } else {
      setLoginError("Invalid credentials");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-[360px] max-w-[90vw]">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">SEO Agency</span>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-7">
            <h2 className="text-base font-semibold text-white mb-1">Sign in</h2>
            <p className="text-[13px] text-slate-500 mb-6">Access your autonomous SEO command center</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-slate-400 mb-1.5 block">Username</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-slate-600"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-400 mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2.5 text-[13px] text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-red-400 text-[12px]">{loginError}</p>}
              <button
                type="submit"
                className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-white/90 transition-colors text-[13px] mt-1"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeDept={activeDept}
        setActiveDept={setActiveDept}
        onChatOpen={() => setChatOpen(true)}
        onLogout={() => { sessionStorage.removeItem("fouriq_auth"); setIsAuthenticated(false); }}
        apiOnline={apiOnline}
        isAutoPilot={(scheduleSettings as any).isAutoPilot}
      />

      {/* Main Area */}
      <div className="ml-[260px] min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar
          activeDept={activeDept}
          pendingCount={pendingCount}
          runningTasks={runningTasks}
          onDispatchDirector={dispatchDirectorCycle}
          isDispatching={isDispatching}
        />

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Offline Banner */}
          {!apiOnline && (
            <div className="mb-6 flex items-center gap-3 p-3 rounded-lg bg-red-500/[0.08] border border-red-500/[0.15]">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <p className="text-[12px] text-red-300">
                API unreachable at {API_BASE_URL}. {API_BASE_URL.includes('localhost') ? "Run: npm start" : "Check Render."}
              </p>
            </div>
          )}

          {/* ── DIRECTOR ── */}
          {activeDept === "director" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <StatsBar
                directorStatus={directorStatus}
                stagingStats={stagingStats}
                pendingCount={pendingCount}
                runningTasks={runningTasks}
                intelligence={intelligence}
              />

              {/* Auto-Pilot Card */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                      <Zap className={`h-4 w-4 ${(scheduleSettings as any).isAutoPilot ? "text-emerald-400" : "text-slate-600"}`} />
                      Auto-Pilot
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Autonomous strategic cycles on schedule</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* API Mode Toggle */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                      <span className={`text-[10px] font-semibold ${(scheduleSettings as any).apiMode !== 'paid' ? 'text-emerald-400' : 'text-slate-600'}`}>FREE</span>
                      <button
                        onClick={() => updateScheduleSettings({ apiMode: (scheduleSettings as any).apiMode === 'paid' ? 'free' : 'paid' })}
                        disabled={isUpdatingSettings}
                        className={`h-5 w-9 rounded-full transition-all relative ${(scheduleSettings as any).apiMode === 'paid' ? "bg-amber-500" : "bg-emerald-500"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${(scheduleSettings as any).apiMode === 'paid' ? "right-0.5" : "left-0.5"}`} />
                      </button>
                      <span className={`text-[10px] font-semibold ${(scheduleSettings as any).apiMode === 'paid' ? 'text-amber-400' : 'text-slate-600'}`}>PAID</span>
                    </div>
                    <button
                      onClick={() => updateScheduleSettings({ isAutoPilot: !(scheduleSettings as any).isAutoPilot })}
                      disabled={isUpdatingSettings}
                      className={`h-6 w-11 rounded-full transition-all relative ${(scheduleSettings as any).isAutoPilot ? "bg-emerald-500" : "bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${(scheduleSettings as any).isAutoPilot ? "right-0.5" : "left-0.5"}`} />
                    </button>
                    <button
                      onClick={() => updateScheduleSettings({ isAutoCommit: !(scheduleSettings as any).isAutoCommit })}
                      disabled={isUpdatingSettings}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border transition-all ${(scheduleSettings as any).isAutoCommit ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/[0.03] border-white/[0.08] text-slate-500"}`}
                    >
                      Git Push {(scheduleSettings as any).isAutoCommit ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">Start Time</label>
                    <input
                      type="time"
                      value={draftStartTime ?? (scheduleSettings as any).startTime ?? "10:00"}
                      onChange={(e) => setDraftStartTime(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">Frequency</label>
                    <select
                      value={draftFreq ?? (scheduleSettings as any).cyclesPerDay ?? 1}
                      onChange={(e) => setDraftFreq(parseInt(e.target.value))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-cyan-500/40 appearance-none"
                    >
                      <option value={1}>1×/day</option>
                      <option value={2}>2×/day</option>
                      <option value={4}>Every 6h</option>
                      <option value={12}>Every 2h</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    {(draftStartTime !== null || draftFreq !== null) ? (
                      <button
                        onClick={() => { updateScheduleSettings({ startTime: draftStartTime ?? (scheduleSettings as any).startTime, cyclesPerDay: draftFreq ?? (scheduleSettings as any).cyclesPerDay }); setDraftStartTime(null); setDraftFreq(null); }}
                        className="w-full py-2 rounded-lg bg-white text-black text-[12px] font-medium hover:bg-white/90 transition-colors"
                      >
                        Save
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-[10px] text-slate-500">Last run</p>
                        <p className="text-[11px] text-slate-400 font-mono">{(scheduleSettings as any).lastRunAt ? new Date((scheduleSettings as any).lastRunAt).toLocaleTimeString() : "Never"}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Model Matrix */}
              <ModelSelectionMatrix
                currentModels={(scheduleSettings as any).agentModels || {}}
                onUpdate={(models: any) => updateScheduleSettings({ agentModels: models })}
                isUpdating={isUpdatingSettings}
              />

              {/* Dispatch + Queue + Feed */}
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  <ControlHub
                    dispatchDepartment={dispatchDepartment}
                    dispatchDirectorCycle={dispatchDirectorCycle}
                    isDispatching={isDispatching}
                    runningTasks={runningTasks}
                  />
                  <StagingQueue
                    stagingQueue={stagingQueue}
                    reviewItem={reviewItem}
                    previewItem={previewItem}
                    previewContent={previewContent}
                    setPreviewContent={setPreviewContent}
                  />
                </div>
                <aside className="sticky top-[76px] self-start">
                  <ActivityFeed activityFeed={activityFeed} />
                </aside>
              </div>
            </div>
          )}

          {/* ── CONTENT ── */}
          {activeDept === "content" && (
            <ContentHubDepartment intelligence={intelligence} activityFeed={activityFeed} runningTasks={runningTasks} />
          )}

          {/* ── TECH SEO ── */}
          {activeDept === "techseo" && (
            <TechSeoDepartment intelligence={intelligence} activityFeed={activityFeed} runningTasks={runningTasks} directorStatus={directorStatus} />
          )}

          {/* ── LANDING PAGES ── */}
          {activeDept === "landing" && (
            <LandingPagesDepartment intelligence={intelligence} activityFeed={activityFeed} stagingQueue={stagingQueue} />
          )}

          {/* ── INSTAGRAM ── */}
          {activeDept === "instagram" && <InstagramDepartment />}

          {/* ── OUTREACH ── */}
          {activeDept === "outreach" && (
            <OutreachDepartment
              leads={leads} emails={emails} replies={replies} stats={outreachStats}
              outreachTab={outreachTab} setOutreachTab={setOutreachTab}
              autoDecideNicheAndHunt={autoDecideNicheAndHunt}
              isGeneratingNiche={isGeneratingNiche} aiNiche={aiNiche}
              manualNiche={manualNiche} setManualNiche={setManualNiche}
              leadCount={leadCount} setLeadCount={setLeadCount}
              exportLeads={exportLeads} exportOutreach={exportOutreach}
              syncLeads={async () => { await fetch(`${API_BASE_URL}/api/leads/sync-scraper`, { method: 'POST' }); await syncLeads(); }}
              isImporting={isImporting}
              selectedLeadId={selectedLeadId} setSelectedLeadId={setSelectedLeadId}
              leadFilter={leadFilter} setLeadFilter={setLeadFilter}
              search={search} setSearch={setSearch}
              isEditing={isEditing} setIsEditing={setIsEditing}
              editForm={editForm} setEditForm={setEditForm}
              saveEdit={async () => {
                try {
                  const res = await fetch(`${API_BASE_URL}/api/leads/${selectedLeadId}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ businessName: editForm.businessName, contactEmail: editForm.contactEmail, website: editForm.website, niche: editForm.niche, status: editForm.status, location: editForm.location, problemTitle: editForm.problemTitle, problemDetail: editForm.problemDetail })
                  });
                  if (res.ok) { setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, ...editForm } : l)); setIsEditing(false); }
                  else { const err = await res.json(); alert(`Save failed: ${err.error}`); }
                } catch { alert("Network error."); }
              }}
              startEditing={(l: any) => { setSelectedLeadId(l.id); setEditForm(l); setIsEditing(true); }}
              handleSendEmail={handleSendEmail} isSending={isSending}
              addReply={async () => { setReplies(prev => [...prev, { ...newReply, id: `reply-${Date.now()}`, leadId: selectedLeadId }]); setNewReply({ summary: "", nextStep: "" }); }}
              newReply={newReply} setNewReply={setNewReply}
            />
          )}
        </main>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={chatOpen} onClose={() => setChatOpen(false)}
        messages={chatHistory} input={chatInput} setInput={setChatInput}
        isLoading={isChatLoading} handleSend={handleChatSend}
        clearHistory={() => setChatHistory([])}
        keyLabel="Gemini 2.0 Flash" totalKeys={API_KEYS.length}
      />
    </div>
  );
}

