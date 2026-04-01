import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, PenTool, Layers, Wrench, Mail, MessageCircle, 
  Activity, Shield, Layout, Link2, Search, Zap, 
  TrendingUp, Code2, BarChart3, Globe, CheckCircle2,
  Sparkles, FileText, BookOpen, Clock, ShieldAlert
} from "lucide-react";

// Modular Components
import { StatsBar } from "./components/StatsBar";
import { ControlHub } from "./components/ControlHub";
import { ActivityFeed } from "./components/ActivityFeed";
import { StagingQueue } from "./components/StagingQueue";
import { OutreachDepartment } from "./components/OutreachDepartment";
import { ChatPanel } from "./components/ChatPanel";
import { IntelligencePanel } from "./components/IntelligencePanel";
import { DepartmentView } from "./components/DepartmentView";

// Constants & Types
const STORAGE_KEYS = {
  leads: "fouriq_leads_v2",
  emails: "fouriq_emails_v2",
  replies: "fouriq_replies_v2",
  chat: "fouriq_chat_history_v2",
};

const API_KEYS = (
  import.meta.env.VITE_GEMINI_API_KEYS || 
  import.meta.env.VITE_GEMINI_PRO_API_KEY || 
  import.meta.env.VITE_GEMINI_API_KEY || 
  ""
).split(",").filter(Boolean);

export default function AgentManager() {
  // Navigation State
  const [activeDept, setActiveDept] = useState<"director" | "content" | "structural" | "technical" | "outreach">("director");
  const [chatOpen, setChatOpen] = useState(false);

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
  const [editForm, setEditForm] = useState({ personalEmail: "", companyEmail: "", phone: "" });
  const [newReply, setNewReply] = useState({ summary: "", nextStep: "" });

  // Chat State
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [apiKeyIndex, setApiKeyIndex] = useState(0);

  // Initial Data Load
  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEYS.leads);
    const savedEmails = localStorage.getItem(STORAGE_KEYS.emails);
    const savedReplies = localStorage.getItem(STORAGE_KEYS.replies);
    const savedChat = localStorage.getItem(STORAGE_KEYS.chat);

    if (savedLeads) setLeads(JSON.parse(savedLeads));
    if (savedEmails) setEmails(JSON.parse(savedEmails));
    if (savedReplies) setReplies(JSON.parse(savedReplies));
    if (savedChat) setChatHistory(JSON.parse(savedChat));
  }, []);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.emails, JSON.stringify(emails)); }, [emails]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.replies, JSON.stringify(replies)); }, [replies]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chatHistory)); }, [chatHistory]);

  // API Refresh Interval
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statRes, journalRes, feedRes, stagingRes, tasksRes, intelligenceRes] = await Promise.all([
          fetch("http://localhost:3848/api/status").catch(() => null),
          fetch("http://localhost:3848/api/journal").catch(() => null),
          fetch("http://localhost:3848/api/activity").catch(() => null),
          fetch("http://localhost:3848/api/staging").catch(() => null),
          fetch("http://localhost:3848/api/tasks").catch(() => null),
          fetch("http://localhost:3848/api/intelligence").catch(() => null)
        ]);

        if (statRes?.ok) setDirectorStatus(await statRes.json());
        setApiOnline(Boolean(statRes?.ok));
        if (journalRes?.ok) setDirectorJournal(await journalRes.json());
        
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
      await fetch("http://localhost:3848/api/director/cycle", {
        method: "POST"
      });
    } catch (e) {
      console.error("Dispatch Error", e);
    } finally {
      setIsDispatching(null);
    }
  };

  const dispatchDepartment = async (dept: string) => {
    setIsDispatching(dept);
    try {
      await fetch(`http://localhost:3848/api/dispatch/${dept}`, {
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

  const reviewItem = async (id: string, verdict: "approved" | "rejected", feedback: string) => {
    try {
      await fetch(`http://localhost:3848/api/staging/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, feedback })
      });
      // Staging queue will refresh on next interval
    } catch (e) {
      console.error("Review Error", e);
    }
  };

  const [previewContent, setPreviewContent] = useState<{ id: string; content: string } | null>(null);
  const previewItem = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3848/api/staging/${id}/content`);
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
    
    const currentInput = chatInput; // Capture input before clearing
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
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || "Communication timeout. Please re-verify terminal link.",
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
      
      const res = await fetch("http://localhost:3001/run-task", {
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
      const res = await fetch("http://localhost:3001/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.personalEmail || lead.companyEmail,
          subject: email.subject,
          body: email.body,
          fromName: "Karm Joshi (FourIqTech)"
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

  const importLeads = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const [headerStr, ...rows] = text.split("\n").filter(Boolean);
        const headers = headerStr.split(",");
        const parsed = rows.map(row => {
          const values = row.match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"')) || [];
          return headers.reduce((acc, h, i) => ({ ...acc, [h]: values[i] }), {});
        });
        setLeads(prev => [...prev, ...parsed]);
        alert(`Successfully imported ${parsed.length} leads.`);
      } catch (err) { alert("Failed to parse CSV."); }
      finally { setIsImporting(false); }
    };
    reader.readAsText(file);
  };

  const departments = [
    { id: "director" as const, label: "Agency Director", icon: Crown, color: "bg-ai-primary", desc: "Strategic Command" },
    { id: "content" as const, label: "Content Hub", icon: PenTool, color: "bg-ai-purple", desc: "Authority Engine" },
    { id: "structural" as const, label: "Layout Lab", icon: Layers, color: "bg-ai-blue", desc: "Digital Architecture" },
    { id: "technical" as const, label: "Technical Lab", icon: Wrench, color: "bg-ai-tertiary", desc: "Site Integrity" },
    { id: "outreach" as const, label: "Outreach Ops", icon: Mail, color: "bg-amber-400", desc: "Market Acquisition" },
  ];

  const outreachStats = useMemo(() => {
    return {
      totalLeads: leads.length,
      researched: leads.filter(l => ["researched", "drafted", "sent"].includes(l.status)).length,
      sent: emails.filter(e => e.deliveryStatus === "sent").length,
      replied: replies.length
    };
  }, [leads, emails, replies]);

  return (
    <div className="min-h-screen bg-aether-base text-slate-50 font-sans selection:bg-ai-primary/30 selection:text-white">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-ai-primary/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-ai-secondary/[0.02] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        
        {/* HEADER */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-ai-primary/20 bg-ai-primary/5 text-ai-primary px-4 py-1.5 font-bold tracking-[0.2em] uppercase text-[10px] rounded-full shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                   <Crown className="mr-2.5 h-3.5 w-3.5" /> STRATEGIC COMMAND
                </Badge>
                <div className="h-px w-8 bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">ID: FOURIQ_COMMAND_V4</span>
             </div>
             <h1 className="text-5xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
               Agency <span className="ai-gradient-text uppercase">Executive</span> Center
             </h1>
             <div className="flex items-center gap-3">
               <span className={`h-2.5 w-2.5 rounded-full ${apiOnline ? "bg-ai-tertiary" : "bg-red-400"}`} />
               <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                 {apiOnline ? "Agency API Online" : "Agency API Offline — buttons may not work"}
               </span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <Button 
               onClick={() => setChatOpen(true)}
               className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ai-primary/40 text-white font-bold transition-all shadow-2xl group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-ai-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <MessageCircle className="mr-3 h-5 w-5 text-ai-primary group-hover:scale-110 transition-transform" /> 
               DIRECTOR COMMS
             </Button>
          </div>
        </div>

        {/* METRICS BAR */}
        <StatsBar 
          directorStatus={directorStatus} 
          stagingStats={stagingStats}
          pendingCount={stagingQueue.filter(s => s.status === "pending_review").length}
          runningTasks={runningTasks}
          intelligence={intelligence}
        />

        <div className="mt-8">
          <IntelligencePanel intelligence={intelligence} />
        </div>

        {/* DEPARTMENT SELECTOR */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-5">
          {departments.map((dept) => {
            const isActive = activeDept === dept.id;
            return (
              <button key={dept.id} onClick={() => setActiveDept(dept.id)}
                className={`group relative overflow-hidden rounded-[20px] border p-6 text-left transition-all duration-300 ${
                  isActive
                    ? `border-ai-primary/40 bg-ai-primary/[0.03] shadow-[0_0_30px_rgba(56,189,248,0.05)]`
                    : "border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700"
                }`}>
                <div className="flex flex-col items-start gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950/50 border border-slate-800 transition-all duration-300 shadow-xl ${
                    isActive ? "border-ai-primary/50 text-ai-primary" : "text-slate-500 group-hover:text-slate-300 group-hover:border-slate-700"
                  }`}>
                    <dept.icon className={`h-6 w-6 transition-all duration-500 ${isActive ? "scale-110" : ""}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold tracking-normal ${isActive ? "text-white" : "text-slate-400"}`}>{dept.label}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 transition-colors ${isActive ? "text-ai-primary/70" : "text-slate-600"}`}>
                      {dept.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="mt-8">
           {!apiOnline && (
             <Card className="mb-8 aether-card bg-red-500/5 border-red-500/20 rounded-[24px]">
               <CardContent className="p-6 flex items-center justify-between gap-6">
                 <div className="space-y-2">
                   <p className="text-sm font-bold text-red-300 uppercase tracking-[0.2em]">Agency Backend Required</p>
                   <p className="text-sm text-slate-300 max-w-3xl">
                     The `/agent-manager` page depends on the local SEO agency API at `http://localhost:3848`. If it is not running, the chat and dispatch buttons will feel broken and department data will be missing.
                   </p>
                 </div>
               </CardContent>
             </Card>
           )}

           {activeDept === "director" && (
             <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
               <div className="space-y-8">
                 <ControlHub 
                   dispatchDepartment={dispatchDepartment}
                   dispatchDirectorCycle={dispatchDirectorCycle}
                   isDispatching={isDispatching}
                   runningTasks={runningTasks}
                 />
                 <div className="space-y-4">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
                       <Layers className="h-4 w-4 text-ai-primary" /> OVERSIGHT QUEUE
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
               <aside className="space-y-8">
                  <div className="space-y-4 h-full">
                    <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
                       <Activity className="h-4 w-4 text-ai-tertiary" /> INTELLIGENCE HUB
                    </h2>
                    <ActivityFeed activityFeed={activityFeed} />
                  </div>
               </aside>
             </div>
           )}

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
               importLeads={importLeads}
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
               saveEdit={async () => { setLeads(prev => prev.map(l => l.id === selectedLeadId ? { ...l, ...editForm } : l)); setIsEditing(false); }}
               startEditing={(l: any) => { setSelectedLeadId(l.id); setEditForm(l); setIsEditing(true); }}
               handleSendEmail={handleSendEmail}
               isSending={isSending}
               addReply={async () => { setReplies(prev => [...prev, { ...newReply, id: `reply-${Date.now()}`, leadId: selectedLeadId }]); setNewReply({ summary: "", nextStep: "" }); }}
               newReply={newReply}
               setNewReply={setNewReply}
             />
           )}

           {["content", "structural", "technical"].includes(activeDept) && (
             <DepartmentView
               department={activeDept as "content" | "structural" | "technical"}
               intelligence={intelligence}
               activityFeed={activityFeed}
               runningTasks={runningTasks}
             />
           )}
        </main>
      </div>

      {/* OVERLAYS */}
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
