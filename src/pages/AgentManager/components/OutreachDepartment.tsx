import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Target, Download, MapPinned, Search, Send, 
  MessageSquareReply, Edit2, ShieldAlert, Zap, Copy, 
  Loader2, Globe, Building, Mail, CheckCircle2, X, BookOpen 
} from "lucide-react";

interface OutreachDepartmentProps {
  leads: any[];
  emails: any[];
  replies: any[];
  stats: any;
  outreachTab: string;
  setOutreachTab: (tab: string) => void;
  autoDecideNicheAndHunt: (manual?: string) => Promise<void>;
  isGeneratingNiche: boolean;
  aiNiche: string;
  manualNiche: string;
  setManualNiche: (n: string) => void;
  leadCount: number;
  setLeadCount: (c: number) => void;
  exportLeads: () => void;
  exportOutreach: () => void;
  syncLeads: () => void;
  isImporting: boolean;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  leadFilter: "collected" | "sent";
  setLeadFilter: (f: "collected" | "sent") => void;
  search: string;
  setSearch: (s: string) => void;
  isEditing: boolean;
  setIsEditing: (b: boolean) => void;
  editForm: any;
  setEditForm: (f: any) => void;
  saveEdit: () => Promise<void>;
  startEditing: (lead: any) => void;
  handleSendEmail: () => Promise<void>;
  isSending: boolean;
  addReply: (r: any) => Promise<void>;
  newReply: { summary: string; nextStep: string };
  setNewReply: (r: any) => void;
}

export function OutreachDepartment({ 
  leads, emails, replies, stats, outreachTab, setOutreachTab, 
  autoDecideNicheAndHunt, isGeneratingNiche, aiNiche, manualNiche, setManualNiche, 
  leadCount, setLeadCount, exportLeads, exportOutreach, syncLeads, isImporting,
  selectedLeadId, setSelectedLeadId, leadFilter, setLeadFilter, search, setSearch,
  isEditing, setIsEditing, editForm, setEditForm, saveEdit, startEditing,
  handleSendEmail, isSending, addReply, newReply, setNewReply
}: OutreachDepartmentProps) {

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);
  const selectedEmail = useMemo(() => emails.find(e => e.leadId === selectedLeadId), [emails, selectedLeadId]);
  const selectedReplies = useMemo(() => replies.filter(r => r.leadId === selectedLeadId), [replies, selectedLeadId]);

  const displayLeads = useMemo(() => {
    let filtered = leads;
    if (leadFilter === "sent") filtered = leads.filter(l => l.status === "sent" || l.status === "replied");
    else filtered = leads.filter(l => l.status !== "sent" && l.status !== "replied");
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l => l.businessName.toLowerCase().includes(s) || l.niche.toLowerCase().includes(s));
    }
    return filtered;
  }, [leads, leadFilter, search]);

  const statusColor = (status: string) => {
    switch (status) {
      case "new": return "text-sky-300 border-sky-500/30 bg-sky-500/10";
      case "researched": return "text-violet-300 border-violet-500/30 bg-violet-500/10";
      case "drafted": return "text-amber-300 border-amber-500/30 bg-amber-500/10";
      case "sent": return "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
      case "replied": return "text-green-300 border-green-500/30 bg-green-500/10";
      default: return "";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* AI HUNTER BLOCK */}
      <Card className="obsidian-glass border-ai-tertiary/20 relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-ai-tertiary/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-4 border-b border-white/5 relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg ai-gradient-text">
            <div className="p-2 rounded-xl bg-ai-tertiary/10 border border-ai-tertiary/20">
              <Sparkles className="h-5 w-5 text-ai-tertiary animate-pulse" />
            </div>
            Autonomous Market Hunter
          </CardTitle>
          <CardDescription className="text-neutral-500 max-w-2xl font-medium tracking-tight">
            Strategic AI agent analyzes market gaps, identifies underserved niches, and dispatches scraper intelligence to build conversion-heavy target lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 relative z-10">
          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
             <div className="space-y-4">
                <Button 
                  onClick={() => autoDecideNicheAndHunt()} 
                  disabled={isGeneratingNiche}
                  className="w-full h-16 rounded-2xl bg-gradient-to-br from-ai-tertiary to-emerald-600 text-white hover:from-ai-tertiary/90 hover:to-emerald-500 text-lg font-bold shadow-lg shadow-ai-tertiary/10 hover:shadow-ai-tertiary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {isGeneratingNiche && !manualNiche ? (
                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> STRATEGIZING...</>
                  ) : (
                    <><Zap className="mr-3 h-6 w-6" /> AI PICK & HUNT</>
                  )}
                </Button>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-ai-tertiary/20 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase flex items-center gap-2">
                       <Zap className="h-3 w-3 text-amber-500" /> Hunt Velocity
                    </span>
                    <span className="text-sm font-bold text-ai-tertiary font-display">{leadCount} TARGETS</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400" onClick={() => setLeadCount(Math.max(1, leadCount - 1))}> - </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400" onClick={() => setLeadCount(Math.min(10, leadCount + 1))}> + </Button>
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/5 min-h-[100px] flex flex-col justify-center">
                  <div className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase mb-2">Hunter Logic / Pulse</div>
                  <div className={`text-base font-medium leading-relaxed ${isGeneratingNiche ? 'text-ai-tertiary animate-pulse' : 'text-neutral-300'}`}>
                    {aiNiche || "Hunter unit idle. Awaiting tactical orders..."}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-ai-tertiary transition-colors" />
                    <Input 
                      value={manualNiche}
                      onChange={(e) => setManualNiche(e.target.value)}
                      placeholder="Input sector: e.g. Enterprise SEO in London..."
                      className="h-12 pl-12 rounded-xl bg-black/40 border-white/5 focus:border-ai-tertiary/40 focus:ring-ai-tertiary/5 text-sm"
                    />
                  </div>
                  <Button 
                    onClick={() => manualNiche && autoDecideNicheAndHunt(manualNiche)}
                    disabled={isGeneratingNiche || !manualNiche.trim()}
                    className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border-none transition-all">
                    {isGeneratingNiche && manualNiche ? <Loader2 className="h-5 w-5 animate-spin" /> : "DEPLOY UNIT"}
                  </Button>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* DEPARTMENTAL HUD */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="obsidian-glass border-white/5 text-neutral-400 hover:text-white" onClick={exportLeads}><Download className="mr-2 h-4 w-4" /> EXPORT TARGETS</Button>
            <Button variant="outline" size="sm" className="obsidian-glass border-white/5 text-neutral-400 hover:text-white" onClick={exportOutreach}><Download className="mr-2 h-4 w-4" /> EXPORT CAMPAIGN</Button>
          </div>
          <div className="grid grid-cols-4 gap-4 px-2">
            {[
              { val: stats.totalLeads, label: "GROSS LEADS", color: "text-ai-primary", icon: MapPinned },
              { val: stats.researched, label: "AUDITED", color: "text-ai-purple", icon: Search },
              { val: stats.sent, label: "DISPATCHED", color: "text-amber-400", icon: Send },
              { val: stats.replied, label: "ENGAGED", color: "text-ai-tertiary", icon: MessageSquareReply },
            ].map(s => (
              <div key={s.label} className="text-center group">
                <div className={`text-xl font-display ${s.color} hover:scale-110 transition-transform`}>{s.val}</div>
                <div className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <Tabs value={outreachTab} onValueChange={setOutreachTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 obsidian-glass p-1 h-12 rounded-2xl border-none">
            <TabsTrigger value="leads" className="rounded-xl data-[state=active]:bg-ai-primary/10 data-[state=active]:text-ai-primary text-xs font-bold tracking-tight">DIRECTORY</TabsTrigger>
            <TabsTrigger value="audit" className="rounded-xl data-[state=active]:bg-ai-purple/10 data-[state=active]:text-ai-purple text-xs font-bold tracking-tight">INTELLIGENCE</TabsTrigger>
            <TabsTrigger value="mail" className="rounded-xl data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400 text-xs font-bold tracking-tight">ENGAGEMENT</TabsTrigger>
            <TabsTrigger value="replies" className="rounded-xl data-[state=active]:bg-ai-tertiary/10 data-[state=active]:text-ai-tertiary text-xs font-bold tracking-tight">RETENTION</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              <Card className="obsidian-glass border-none flex flex-col h-[700px] overflow-hidden rounded-3xl">
                <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Lead Directory</CardTitle>

                  </div>
                  <div className="flex rounded-xl bg-black/40 p-1 border border-white/5 no-border-sections">
                    <button onClick={() => setLeadFilter("collected")} className={`flex-1 rounded-lg text-[10px] font-bold py-2 transition tracking-widest ${leadFilter === "collected" ? "bg-white/10 text-white shadow-sm" : "text-neutral-600 hover:text-neutral-400"}`}>COLLECTED</button>
                    <button onClick={() => setLeadFilter("sent")} className={`flex-1 rounded-lg text-[10px] font-bold py-2 transition tracking-widest ${leadFilter === "sent" ? "bg-white/10 text-white shadow-sm" : "text-neutral-600 hover:text-neutral-400"}`}>DISPATCHED</button>
                  </div>
                  <div className="relative mt-4 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-ai-primary transition-colors" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter intelligence..." className="h-10 pl-10 rounded-xl bg-black/40 border-white/5 text-xs font-medium" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 min-h-0">
                  <ScrollArea className="h-full w-full custom-scrollbar">
                    <div className="p-4 space-y-2">
                       {displayLeads.length === 0 ? (
                         <div className="py-20 text-center opacity-30 italic text-sm">Empty Sector</div>
                       ) : displayLeads.map((lead) => (
                         <button key={lead.id} onClick={() => setSelectedLeadId(lead.id)}
                           className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 relative group overflow-hidden ${
                             selectedLeadId === lead.id ? "bg-ai-primary/5 border-ai-primary/20 shadow-lg shadow-ai-primary/5 scale-[0.98]" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
                           }`}>
                           <div className="absolute top-0 left-0 w-full h-1 bg-ai-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="flex items-start justify-between gap-3 relative z-10">
                              <div className="min-w-0">
                                <div className="font-bold text-neutral-100 line-clamp-1 text-sm tracking-tight">{lead.businessName}</div>
                                <div className="mt-1 text-[10px] font-medium text-neutral-600 truncate flex items-center gap-1.5 uppercase">
                                  <Mail className="h-3 w-3" />
                                  {lead.contactEmail || 'NO CONTACT'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {lead.status === "sent" && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                                <Badge variant="outline" className={`h-5 px-2 text-[9px] font-bold uppercase tracking-widest leading-none shrink-0 ${statusColor(lead.status)}`}>{lead.status}</Badge>
                              </div>
                           </div>
                           <div className="mt-3 text-[10px] font-bold tracking-widest text-neutral-500 line-clamp-1 italic uppercase relative z-10 flex items-center gap-2">
                             <span className="text-ai-primary opacity-50">■</span> {lead.niche} · {lead.location}
                           </div>
                         </button>
                       ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* LEAD DETAIL VIEW */}
              {selectedLead && (
                <div className="space-y-6">
                  <Card className="obsidian-glass border-none shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                       <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-1">
                            <CardTitle className="text-xl font-display ai-gradient-text tracking-tight">{selectedLead.businessName}</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-neutral-600">{selectedLead.niche} in {selectedLead.location}</CardDescription>
                          </div>
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-9 px-4 text-xs font-bold text-neutral-500 hover:text-white rounded-xl">CANCEL</Button>
                                <Button size="sm" onClick={saveEdit} className="h-9 px-6 bg-ai-primary text-black font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-transform">SAVE UPDATES</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => startEditing(selectedLead)} className="h-9 px-4 border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition-all">
                                <Edit2 className="h-3.5 w-3.5 mr-2" /> EDIT INTEL
                              </Button>
                            )}
                            <Badge variant="outline" className={`h-7 px-3 text-[10px] font-bold uppercase tracking-widest ${statusColor(selectedLead.status)}`}>{selectedLead.status}</Badge>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                          { label: "Unit Status", icon: MapPinned, val: selectedLead.source, color: "text-ai-primary" },
                          { label: "Direct Contact", icon: Mail, val: isEditing ? <Input value={editForm.contactEmail} onChange={e => setEditForm({...editForm, contactEmail: e.target.value})} className="h-8 bg-black/40 border-white/5 text-[11px]" /> : selectedLead.contactEmail, color: "text-ai-purple" },
                          { label: "Signal Velocity", icon: Zap, val: selectedLead.rating ? `⭐ ${selectedLead.rating} (${selectedLead.reviewCount} signals)` : "NO DATA", color: "text-amber-400" },
                          { label: "Conversion Lock", icon: Target, val: selectedLead.confidence?.toUpperCase() || "PENDING", color: "text-ai-tertiary" },
                          { label: "Comm Frequency", icon: Send, val: `LATENCY: ${selectedLead.collectedAt}`, color: "text-neutral-500" },
                        ].map(f => (
                          <div key={typeof f.label === 'string' ? f.label : 'input'} className="rounded-2xl border border-white/5 bg-black/40 p-4 group hover:border-white/10 transition-colors">
                            <div className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold mb-3 flex items-center gap-1.5">
                              <f.icon className={`h-3 w-3 ${f.color}`} /> {f.label}
                            </div>
                            <div className="text-xs font-bold text-neutral-200 truncate">{f.val || 'NULL'}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold mb-2">Primary Access Terminal (Address)</div>
                        <div className="text-xs font-semibold text-neutral-400 leading-relaxed">{selectedLead.address || 'UNDEFINED'}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            {selectedLead ? (
              <Card className="obsidian-glass border-none shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-ai-purple flex items-center gap-2">
                    <Search className="h-4 w-4" /> Technical Intelligence: {selectedLead.businessName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                   {selectedLead.lighthouseScores && (
                     <div className="grid gap-6 md:grid-cols-3">
                        {[
                          { label: "Performance", score: selectedLead.lighthouseScores.performanceScore, color: "ai-primary" },
                          { label: "SEO Authority", score: selectedLead.lighthouseScores.seoScore, color: "ai-purple" },
                          { label: "Accessibility", score: selectedLead.lighthouseScores.accessibilityScore, color: "ai-tertiary" },
                        ].map(s => (
                          <div key={s.label} className="relative group text-center p-8 rounded-3xl border border-white/5 bg-black/40 hover:bg-black/60 hover:border-white/10 transition-all">
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <div className="relative z-10 flex flex-col items-center">
                                <div className={`flex h-20 w-20 items-center justify-center rounded-full border-[3px] shadow-lg shadow-${s.color}/10 ${
                                  s.score >= 90 ? "border-ai-tertiary text-ai-tertiary" : s.score >= 50 ? "border-amber-400 text-amber-400" : "border-red-500 text-red-500"
                                }`}>
                                   <span className="text-2xl font-bold font-display">{s.score}</span>
                                </div>
                                <div className="mt-4 text-[10px] font-bold tracking-widest uppercase text-neutral-500">{s.label}</div>
                             </div>
                          </div>
                        ))}
                     </div>
                   )}

                   {selectedLead.seoIssues && selectedLead.seoIssues.length > 0 && (
                     <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.02] p-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16" />
                       <div className="relative z-10">
                         <div className="flex items-center gap-2 mb-4">
                           <ShieldAlert className="h-5 w-5 text-red-400" />
                           <span className="text-xs font-bold uppercase tracking-widest text-red-400">Critical SEO Deficiencies Detected</span>
                         </div>
                         <div className="grid gap-3 sm:grid-cols-2">
                           {selectedLead.seoIssues.map((issue: string, idx: number) => (
                             <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-red-200/80 font-medium">
                               <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                               {issue}
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                   )}

                   <div className="grid gap-6 lg:grid-cols-2">
                       <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors group">
                         <div className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-4 flex items-center gap-2">
                           <Target className="h-3.5 w-3.5 text-ai-primary" /> Core Business Conflict
                         </div>
                         <div className="text-lg font-bold text-neutral-100 group-hover:text-ai-primary transition-colors">{selectedLead.problemTitle || "ANALYZING..."}</div>
                         <p className="mt-3 text-sm text-neutral-400 leading-relaxed font-medium">{selectedLead.problemDetail}</p>
                       </div>
                       
                       <div className="p-6 rounded-3xl border border-ai-purple/20 bg-ai-purple/[0.02] group">
                         <div className="text-[10px] uppercase tracking-widest text-ai-purple font-bold mb-4 flex items-center gap-2">
                           <Globe className="h-3.5 w-3.5" /> Competitive Authority Gap
                         </div>
                         <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold text-neutral-300">Vs. <span className="text-ai-purple">{selectedLead.competitorName || "Local Benchmark"}</span></div>
                            <Badge className="bg-ai-purple/10 text-ai-purple border-ai-purple/20">
                               {selectedLead.auditScore || 0} vs {selectedLead.competitorScore || 0}
                            </Badge>
                         </div>
                         <div className="space-y-2">
                            {(selectedLead.competitorGaps || []).slice(0, 3).map((gap: string, i: number) => (
                               <div key={i} className="text-[11px] text-neutral-400 flex items-start gap-2">
                                  <div className="h-1 w-1 rounded-full bg-ai-purple mt-1.5" />
                                  {gap}
                               </div>
                            ))}
                         </div>
                       </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                          <div className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-3 flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-amber-400" /> Economic Leakage (Impact)
                          </div>
                          <p className="text-sm text-neutral-400 leading-relaxed font-medium">{selectedLead.businessImpact}</p>
                        </div>
                        <div className="p-6 rounded-3xl border border-ai-tertiary/20 bg-ai-tertiary/[0.02]">
                          <div className="text-[10px] uppercase tracking-widest text-ai-tertiary font-bold mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5" /> High-Confidence Resolution (Likely Fix)
                          </div>
                          <p className="text-sm text-ai-tertiary/80 leading-relaxed font-bold italic">{selectedLead.likelyFix}</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            ) : <div className="py-20 text-center opacity-30 italic">Select intelligence unit...</div>}
          </TabsContent>

          <TabsContent value="mail" className="mt-6">
            {selectedLead && selectedEmail ? (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                 <Card className="obsidian-glass border-none shadow-2xl rounded-3xl overflow-hidden flex flex-col">
                    <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                      <CardTitle className="text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Strategic Outreach Draft
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 space-y-6">
                       <div className="grid gap-4 md:grid-cols-2">
                         <div className="p-4 rounded-2xl border border-white/5 bg-black/40">
                           <div className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold mb-2">Subject Sequence</div>
                           <div className="text-xs font-bold text-neutral-200">{selectedEmail.subject}</div>
                         </div>
                         <div className="p-4 rounded-2xl border border-white/5 bg-black/40">
                           <div className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold mb-2">Engle Angle</div>
                           <div className="text-xs font-bold text-neutral-200 uppercase tracking-tight">{selectedEmail.angle}</div>
                         </div>
                       </div>
                       <div className="relative group flex-1 flex flex-col min-h-[400px]">
                          <Textarea 
                            readOnly 
                            value={selectedEmail.body} 
                            className="flex-1 rounded-2xl border-white/5 bg-black/20 p-6 text-sm text-neutral-300 font-medium leading-relaxed custom-scrollbar selection:bg-amber-400/20" 
                          />
                          <div className="absolute top-4 right-4 animate-pulse">
                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="obsidian-glass border-none shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                      <CardTitle className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Dispatch Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                       <div className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">Target Recipient Node (To)</label>
                             <Input 
                               value={selectedLead.contactEmail}
                               onChange={(e) => {
                                 setEditForm({ ...selectedLead, contactEmail: e.target.value });
                               }}
                               className="h-10 bg-black/40 border-white/10 rounded-xl text-xs font-bold text-amber-400 focus:border-amber-400/40"
                               placeholder="e.g. hello@business.com"
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">Unit Sender Node</label>
                             <Input 
                               value={selectedEmail.sentFrom}
                               onChange={(e) => {}} 
                               className="h-10 bg-black/40 border-white/10 rounded-xl text-xs font-bold text-ai-primary focus:border-ai-primary/40"
                               placeholder="e.g. director@fouriq.ai"
                             />
                           </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">Global Latency</span>
                            <Badge variant="outline" className="h-5 px-2 border-white/10 bg-black/40 text-[9px] text-neutral-400 font-bold tracking-widest">{selectedEmail.deliveryStatus}</Badge>
                          </div>
                       </div>

                       <div className="p-6 rounded-3xl border border-ai-primary/20 bg-ai-primary/[0.02] relative group">
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Zap className="h-4 w-4 text-ai-primary animate-pulse" />
                          </div>
                          <div className="text-[10px] font-bold tracking-widest text-ai-primary uppercase mb-4">SMTP Deliverability Engine</div>
                          <p className="text-[11px] text-neutral-400 font-medium leading-relaxed mb-6">Verify terminal health before executing the outreach protocol. Test email signature, SPF, and DKIM alignment.</p>
                          <div className="bg-black/60 rounded-2xl border border-white/5 p-4 flex items-center justify-between group/code transition-all hover:border-white/10">
                             <code className="text-[10px] font-mono text-ai-primary/80 overflow-hidden text-ellipsis whitespace-nowrap mr-4">node scripts/tester.mjs --target={selectedLead.contactEmail}</code>
                             <Button variant="ghost" size="icon" onClick={() => {
                                const cmd = `node scripts/email-tester.mjs ${selectedLead.contactEmail}`;
                                navigator.clipboard.writeText(cmd);
                                alert("Terminal command copied.");
                             }} className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-white/5 shrink-0 rounded-lg">
                                <Copy className="h-3.5 w-3.5" />
                             </Button>
                          </div>
                       </div>

                       <Button 
                         onClick={handleSendEmail} 
                         disabled={isSending || selectedEmail.deliveryStatus === "sent"}
                         className="w-full h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40">
                         {isSending ? (
                            <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> DISPATCHING...</>
                         ) : selectedEmail.deliveryStatus === "sent" ? "PROTOCOL COMPLETED" : (
                            <><Send className="mr-3 h-5 w-5" /> EXECUTE OUTREACH</>
                         )}
                       </Button>
                    </CardContent>
                 </Card>
              </div>
            ) : <div className="py-20 text-center opacity-30 italic">Target unit not ready.</div>}
          </TabsContent>

          <TabsContent value="replies" className="mt-6">
            {selectedLead && selectedEmail ? (
              <div className="grid gap-6 lg:grid-cols-2">
                 <Card className="obsidian-glass border-none shadow-2xl rounded-3xl overflow-hidden flex flex-col">
                    <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                       <CardTitle className="text-xs font-bold tracking-widest text-ai-tertiary uppercase flex items-center gap-2">
                          <MessageSquareReply className="h-4 w-4" /> Signal Intelligence (Replies)
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 min-h-0">
                       <ScrollArea className="h-full w-full custom-scrollbar pr-4">
                          <div className="space-y-4">
                             {selectedReplies.length ? selectedReplies.map((reply) => (
                               <div key={reply.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] shadow-sm relative group overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-ai-tertiary opacity-40" />
                                  <div className="flex items-center justify-between gap-4 mb-3">
                                     <div className="text-[10px] font-bold text-ai-tertiary tracking-widest uppercase">Signal Received</div>
                                     <div className="text-[10px] font-bold text-neutral-600">{new Date(reply.receivedAt).toLocaleDateString()}</div>
                                  </div>
                                  <p className="text-sm text-neutral-300 font-medium leading-relaxed mb-4">{reply.summary}</p>
                                  <div className="p-3 rounded-xl bg-ai-tertiary/5 border border-ai-tertiary/10 text-[11px] font-bold text-ai-tertiary italic">NEXT STEP: {reply.nextStep}</div>
                               </div>
                             )) : <div className="text-center py-20 opacity-30 text-xs italic">Waiting for inbound signals...</div>}
                          </div>
                       </ScrollArea>
                    </CardContent>
                 </Card>

                 <Card className="obsidian-glass border-none shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                       <CardTitle className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Ingest Context</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">Intelligence Summary</label>
                         <Textarea 
                           value={newReply.summary} 
                           onChange={(e) => setNewReply((c: any) => ({ ...c, summary: e.target.value }))} 
                           placeholder="Ingest prospect response content..." 
                           className="min-h-[140px] rounded-2xl bg-black/40 border-white/5 text-sm font-medium" 
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">Strategic Next Step</label>
                         <Textarea 
                           value={newReply.nextStep} 
                           onChange={(e) => setNewReply((c: any) => ({ ...c, nextStep: e.target.value }))} 
                           placeholder="Recommended tactical maneuver..." 
                           className="min-h-[140px] rounded-2xl bg-black/40 border-white/5 text-sm font-medium" 
                         />
                       </div>
                       <Button onClick={addReply} className="w-full h-14 rounded-2xl bg-ai-tertiary text-black font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-ai-tertiary/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                          INGEST CONTEXT
                       </Button>
                    </CardContent>
                 </Card>
              </div>
            ) : <div className="py-20 text-center opacity-30 italic">No campaign record available.</div>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
