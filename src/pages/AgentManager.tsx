import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bot,
  Building,
  CheckCircle2,
  Download,
  Globe,
  Mail,
  MapPinned,
  MessageSquareReply,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const STORAGE_KEYS = {
  leads: "fouriq_agent_leads",
  emails: "fouriq_agent_emails",
  replies: "fouriq_agent_replies",
};

type LeadStatus = "new" | "researched" | "drafted" | "sent" | "replied";
type LeadSource = "Google Maps" | "Website Crawl" | "Directory" | "Manual";

interface LeadRecord {
  id: string;
  businessName: string;
  niche: string;
  location: string;
  source: LeadSource;
  website: string;
  contactEmail: string;
  competitorName: string;
  competitorWebsite: string;
  reviewsSnapshot: string;
  problemTitle: string;
  problemDetail: string;
  businessImpact: string;
  likelyFix: string;
  confidence: "high" | "medium" | "low";
  status: LeadStatus;
  collectedAt: string;
  lastTouchedAt: string;
}

interface EmailRecord {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  angle: string;
  sentFrom: string;
  sentAt: string;
  deliveryStatus: "draft" | "ready" | "sent" | "reply_received";
}

interface ReplyRecord {
  id: string;
  leadId: string;
  emailId: string;
  receivedAt: string;
  summary: string;
  nextStep: string;
}

const seedLeads: LeadRecord[] = [
  {
    id: "lead-1",
    businessName: "Gielly Green",
    niche: "Luxury Hair Salon",
    location: "London",
    source: "Google Maps",
    website: "https://www.giellygreen.co.uk",
    contactEmail: "hello@example.com",
    competitorName: "Haug London Haus",
    competitorWebsite: "https://www.hauglondonhaus.com",
    reviewsSnapshot: "Strong brand perception, high-end positioning, mobile-first discovery matters.",
    problemTitle: "First impression settles too late on mobile",
    problemDetail: "The site appears JavaScript-heavy, so the first viewport feels assembled after initial load instead of looking complete immediately.",
    businessImpact: "For premium service brands, that delay weakens perceived polish during the first 2–3 seconds when trust is forming.",
    likelyFix: "Prioritize server-rendered above-the-fold content, reduce client-side boot cost, and tighten asset delivery for the opening viewport.",
    confidence: "high",
    status: "drafted",
    collectedAt: "2026-03-25 09:10",
    lastTouchedAt: "2026-03-25 09:40",
  },
  {
    id: "lead-2",
    businessName: "North Shore Dental Studio",
    niche: "Dental Clinic",
    location: "Sydney",
    source: "Website Crawl",
    website: "https://example-dental.com",
    contactEmail: "info@example-dental.com",
    competitorName: "Harbour Smile Care",
    competitorWebsite: "https://example-smile.com",
    reviewsSnapshot: "Strong patient reviews, but website trust and conversion path lag behind category leaders.",
    problemTitle: "Inquiry path has too much friction",
    problemDetail: "The page layout looks credible, but the path from service interest to booking feels split across too many sections and weak CTAs.",
    businessImpact: "High-intent visitors may postpone contacting the clinic even if the brand itself appears trustworthy.",
    likelyFix: "Tighten the first CTA sequence, reduce decision branches, and surface trust signals earlier in the page flow.",
    confidence: "medium",
    status: "researched",
    collectedAt: "2026-03-25 10:05",
    lastTouchedAt: "2026-03-25 10:18",
  },
];

const seedEmails: EmailRecord[] = [
  {
    id: "email-1",
    leadId: "lead-1",
    subject: "one thing hurting first impression",
    angle: "mobile trust",
    sentFrom: "hello@fouriqtech.com",
    sentAt: "2026-03-25 09:42",
    deliveryStatus: "ready",
    body: `Hi,

I spent a little time on your site and one thing stood out: the first screen feels like it settles a moment later than it should on mobile.

For a premium service brand, that matters because the first few seconds shape trust before a visitor reads anything.

From what I can see, this looks more like a rendering and delivery issue than a redesign problem. If helpful, I can send the 3 changes I would prioritize first based on the current setup.

Best,
Karm Joshi`,
  },
];

const seedReplies: ReplyRecord[] = [
  {
    id: "reply-1",
    leadId: "lead-1",
    emailId: "email-1",
    receivedAt: "2026-03-25 12:05",
    summary: "Prospect asked for the three recommended changes and whether the work can be staged without a redesign.",
    nextStep: "Reply with concise 3-point audit and offer a short Loom or written plan.",
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
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
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function statusColor(status: LeadStatus) {
  switch (status) {
    case "new":
      return "text-sky-300 border-sky-500/30 bg-sky-500/10";
    case "researched":
      return "text-violet-300 border-violet-500/30 bg-violet-500/10";
    case "drafted":
      return "text-amber-300 border-amber-500/30 bg-amber-500/10";
    case "sent":
      return "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
    case "replied":
      return "text-green-300 border-green-500/30 bg-green-500/10";
  }
}

export default function AgentManager() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [replies, setReplies] = useState<ReplyRecord[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(seedLeads[0].id);
  const [search, setSearch] = useState("");
  const [newReply, setNewReply] = useState({ summary: "", nextStep: "" });

  useEffect(() => {
    setLeads(readStorage(STORAGE_KEYS.leads, seedLeads));
    setEmails(readStorage(STORAGE_KEYS.emails, seedEmails));
    setReplies(readStorage(STORAGE_KEYS.replies, seedReplies));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.emails, JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.replies, JSON.stringify(replies));
  }, [replies]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) =>
      [lead.businessName, lead.niche, lead.location, lead.problemTitle, lead.contactEmail].some((value) => value.toLowerCase().includes(query)),
    );
  }, [leads, search]);

  const selectedLead = filteredLeads.find((lead) => lead.id === selectedLeadId) ?? leads[0];
  const selectedEmail = emails.find((email) => email.leadId === selectedLead?.id);
  const selectedReplies = replies.filter((reply) => reply.leadId === selectedLead?.id);

  const stats = useMemo(() => {
    const sent = emails.filter((email) => email.deliveryStatus === "sent" || email.deliveryStatus === "reply_received").length;
    const replied = replies.length;
    return {
      totalLeads: leads.length,
      researched: leads.filter((lead) => ["researched", "drafted", "sent", "replied"].includes(lead.status)).length,
      sent,
      replied,
    };
  }, [leads, emails, replies]);

  const markSent = () => {
    if (!selectedLead || !selectedEmail) return;
    setEmails((current) => current.map((email) => (email.id === selectedEmail.id ? { ...email, deliveryStatus: "sent", sentAt: new Date().toLocaleString() } : email)));
    setLeads((current) => current.map((lead) => (lead.id === selectedLead.id ? { ...lead, status: "sent", lastTouchedAt: new Date().toLocaleString() } : lead)));
  };

  const addReply = () => {
    if (!selectedLead || !selectedEmail || !newReply.summary.trim() || !newReply.nextStep.trim()) return;
    const reply: ReplyRecord = {
      id: `reply-${Date.now()}`,
      leadId: selectedLead.id,
      emailId: selectedEmail.id,
      receivedAt: new Date().toLocaleString(),
      summary: newReply.summary.trim(),
      nextStep: newReply.nextStep.trim(),
    };
    setReplies((current) => [reply, ...current]);
    setEmails((current) => current.map((email) => (email.id === selectedEmail.id ? { ...email, deliveryStatus: "reply_received" } : email)));
    setLeads((current) => current.map((lead) => (lead.id === selectedLead.id ? { ...lead, status: "replied", lastTouchedAt: new Date().toLocaleString() } : lead)));
    setNewReply({ summary: "", nextStep: "" });
  };

  const exportLeads = () => {
    downloadCsv(
      "fouriq-leads.csv",
      leads.map((lead) => ({
        id: lead.id,
        business_name: lead.businessName,
        niche: lead.niche,
        location: lead.location,
        source: lead.source,
        website: lead.website,
        contact_email: lead.contactEmail,
        competitor_name: lead.competitorName,
        competitor_website: lead.competitorWebsite,
        problem_title: lead.problemTitle,
        problem_detail: lead.problemDetail,
        business_impact: lead.businessImpact,
        likely_fix: lead.likelyFix,
        confidence: lead.confidence,
        status: lead.status,
        collected_at: lead.collectedAt,
        last_touched_at: lead.lastTouchedAt,
      })),
    );
  };

  const exportOutreach = () => {
    downloadCsv(
      "fouriq-outreach-log.csv",
      emails.map((email) => {
        const lead = leads.find((item) => item.id === email.leadId);
        return {
          email_id: email.id,
          business_name: lead?.businessName ?? "",
          contact_email: lead?.contactEmail ?? "",
          subject: email.subject,
          angle: email.angle,
          sent_from: email.sentFrom,
          sent_at: email.sentAt,
          delivery_status: email.deliveryStatus,
          body: email.body,
          problem_title: lead?.problemTitle ?? "",
          likely_fix: lead?.likelyFix ?? "",
        };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-300">
              <Bot className="mr-2 h-3.5 w-3.5" /> Outreach Command Center
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Lead research, audit history, sent mail, and replies in one place</h1>
            <p className="max-w-3xl text-sm text-neutral-400">
              This dashboard is built for a review-first workflow: collect leads, keep the exact problem you found, store the email you sent, and save reply context so you always know what the prospect saw.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-neutral-700 bg-neutral-900 text-neutral-100" onClick={exportLeads}>
              <Download className="mr-2 h-4 w-4" /> Export leads CSV
            </Button>
            <Button variant="outline" className="border-neutral-700 bg-neutral-900 text-neutral-100" onClick={exportOutreach}>
              <Download className="mr-2 h-4 w-4" /> Export outreach CSV
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader className="pb-2">
              <CardDescription>Total leads</CardDescription>
              <CardTitle className="text-2xl">{stats.totalLeads}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><MapPinned className="h-4 w-4 text-blue-300" /> Maps, websites, directories, manual</CardContent>
          </Card>
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader className="pb-2">
              <CardDescription>Researched</CardDescription>
              <CardTitle className="text-2xl">{stats.researched}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Search className="h-4 w-4 text-violet-300" /> Problem, impact, likely fix recorded</CardContent>
          </Card>
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader className="pb-2">
              <CardDescription>Sent emails</CardDescription>
              <CardTitle className="text-2xl">{stats.sent}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><Send className="h-4 w-4 text-amber-300" /> Exact subject and body preserved</CardContent>
          </Card>
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader className="pb-2">
              <CardDescription>Replies tracked</CardDescription>
              <CardTitle className="text-2xl">{stats.replied}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-neutral-400"><MessageSquareReply className="h-4 w-4 text-emerald-300" /> Summary and next step logged</CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 bg-neutral-900">
            <TabsTrigger value="leads">Lead list</TabsTrigger>
            <TabsTrigger value="audit">Audit detail</TabsTrigger>
            <TabsTrigger value="mail">Email sent</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
              <Card className="border-neutral-800 bg-neutral-900/70">
                <CardHeader>
                  <CardTitle className="text-base">Collected leads</CardTitle>
                  <CardDescription>Each lead should show the source, contact, competitor, and the exact problem your agent found.</CardDescription>
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search business, niche, email, problem..."
                    className="border-neutral-700 bg-neutral-950"
                  />
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[560px]">
                    <div className="space-y-2 p-3">
                      {filteredLeads.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`w-full rounded-lg border p-4 text-left transition ${selectedLeadId === lead.id ? "border-blue-500/40 bg-blue-500/10" : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-neutral-100">{lead.businessName}</div>
                              <div className="mt-1 text-xs text-neutral-400">{lead.niche} · {lead.location}</div>
                            </div>
                            <Badge variant="outline" className={statusColor(lead.status)}>{lead.status}</Badge>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                            <Globe className="h-3.5 w-3.5" /> {lead.source}
                          </div>
                          <div className="mt-2 text-sm text-neutral-300">{lead.problemTitle}</div>
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
                      <div>
                        <CardTitle className="text-base">{selectedLead.businessName}</CardTitle>
                        <CardDescription>{selectedLead.niche} in {selectedLead.location}</CardDescription>
                      </div>
                      <Badge variant="outline" className={statusColor(selectedLead.status)}>{selectedLead.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Lead source</div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-neutral-200"><MapPinned className="h-4 w-4 text-blue-300" /> {selectedLead.source}</div>
                      <div className="mt-3 text-sm text-neutral-400">Collected at {selectedLead.collectedAt}</div>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Contact</div>
                      <div className="mt-2 text-sm text-neutral-200">{selectedLead.contactEmail}</div>
                      <div className="mt-3 text-sm text-neutral-400">{selectedLead.website}</div>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Competitor benchmark</div>
                      <div className="mt-2 text-sm text-neutral-200">{selectedLead.competitorName}</div>
                      <div className="mt-2 text-sm text-neutral-400">{selectedLead.competitorWebsite}</div>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Confidence</div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-neutral-200"><ShieldAlert className="h-4 w-4 text-amber-300" /> {selectedLead.confidence}</div>
                      <div className="mt-3 text-sm text-neutral-400">Last touched {selectedLead.lastTouchedAt}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            {selectedLead && (
              <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <Card className="border-neutral-800 bg-neutral-900/70">
                  <CardHeader>
                    <CardTitle className="text-base">What the agent found</CardTitle>
                    <CardDescription>Keep the exact problem and business framing so any future reply has full context.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Main problem</div>
                      <div className="mt-2 text-base text-neutral-100">{selectedLead.problemTitle}</div>
                      <p className="mt-3 text-sm leading-6 text-neutral-300">{selectedLead.problemDetail}</p>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Business impact</div>
                      <p className="mt-2 text-sm leading-6 text-neutral-300">{selectedLead.businessImpact}</p>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Likely fix direction</div>
                      <p className="mt-2 text-sm leading-6 text-neutral-300">{selectedLead.likelyFix}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-neutral-800 bg-neutral-900/70">
                  <CardHeader>
                    <CardTitle className="text-base">Research notes</CardTitle>
                    <CardDescription>Useful when the lead replies and you need to remember what triggered the email.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-neutral-300">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Why this lead mattered</div>
                      <p className="mt-2 leading-6">{selectedLead.reviewsSnapshot}</p>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                      <div className="text-xs uppercase tracking-wide text-neutral-500">Recommended agent workflow</div>
                      <ul className="mt-2 space-y-2 leading-6 text-neutral-300">
                        <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /> Collect source data from maps, site, and competitor pages.</li>
                        <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /> Reduce the audit to one strongest issue only.</li>
                        <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /> Send a consultant-style note, not an agency brochure.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mail" className="mt-6">
            {selectedLead && selectedEmail && (
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="border-neutral-800 bg-neutral-900/70">
                  <CardHeader>
                    <CardTitle className="text-base">Exact email on record</CardTitle>
                    <CardDescription>Save the exact email that was drafted or sent so every reply has full outreach context.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">Subject</div>
                        <div className="mt-2 text-sm text-neutral-100">{selectedEmail.subject}</div>
                      </div>
                      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-500">Angle</div>
                        <div className="mt-2 text-sm text-neutral-100">{selectedEmail.angle}</div>
                      </div>
                    </div>
                    <Textarea readOnly value={selectedEmail.body} className="min-h-[280px] border-neutral-800 bg-neutral-950 text-neutral-100" />
                  </CardContent>
                </Card>
                <Card className="border-neutral-800 bg-neutral-900/70">
                  <CardHeader>
                    <CardTitle className="text-base">Mail control</CardTitle>
                    <CardDescription>Update status manually after you send or when a reply arrives.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
                      <div className="flex items-center gap-2 text-neutral-100"><Mail className="h-4 w-4 text-blue-300" /> Sent from {selectedEmail.sentFrom}</div>
                      <div className="mt-2">Recorded at {selectedEmail.sentAt}</div>
                      <div className="mt-2">Status: <span className="text-neutral-100">{selectedEmail.deliveryStatus}</span></div>
                    </div>
                    <Button onClick={markSent} className="w-full bg-amber-600 text-white hover:bg-amber-500">
                      <Send className="mr-2 h-4 w-4" /> Mark as sent
                    </Button>
                    <div className="rounded-lg border border-dashed border-neutral-700 p-4 text-xs leading-6 text-neutral-400">
                      Store every sent email here before replying. When a prospect answers, you should be able to see the exact message, the exact problem, and your next recommended move.
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="replies" className="mt-6">
            {selectedLead && selectedEmail && (
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <Card className="border-neutral-800 bg-neutral-900/70">
                  <CardHeader>
                    <CardTitle className="text-base">Reply log</CardTitle>
                    <CardDescription>Keep every response summarized with the next action so you can continue the conversation fast.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedReplies.length ? selectedReplies.map((reply) => (
                      <div key={reply.id} className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-neutral-100">Reply received</div>
                          <div className="text-xs text-neutral-500">{reply.receivedAt}</div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-neutral-300">{reply.summary}</p>
                        <div className="mt-3 rounded-md bg-neutral-900 p-3 text-sm text-neutral-200">
                          Next step: {reply.nextStep}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-400">
                        No reply recorded yet for this lead.
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-neutral-800 bg-neutral-900/70">
                  <CardHeader>
                    <CardTitle className="text-base">Add reply note</CardTitle>
                    <CardDescription>Use this after a prospect responds so you always have context before replying back.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={newReply.summary}
                      onChange={(event) => setNewReply((current) => ({ ...current, summary: event.target.value }))}
                      placeholder="What did the prospect say?"
                      className="min-h-[120px] border-neutral-800 bg-neutral-950 text-neutral-100"
                    />
                    <Textarea
                      value={newReply.nextStep}
                      onChange={(event) => setNewReply((current) => ({ ...current, nextStep: event.target.value }))}
                      placeholder="What should happen next?"
                      className="min-h-[120px] border-neutral-800 bg-neutral-950 text-neutral-100"
                    />
                    <Button onClick={addReply} className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                      <Sparkles className="mr-2 h-4 w-4" /> Save reply context
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-amber-300" /> What the agent should do</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-neutral-300">
              Collect lead data, identify the one strongest issue, translate it into business impact, and preserve the final outreach email with the audit context.
            </CardContent>
          </Card>
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-blue-300" /> What to store</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-neutral-300">
              Lead source, site, competitor, problem found, likely fix, email subject/body, delivery status, and reply notes. That gives you the full history in Excel-compatible CSV exports.
            </CardContent>
          </Card>
          <Card className="border-neutral-800 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Building className="h-4 w-4 text-emerald-300" /> Safer workflow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-neutral-300">
              Review the audit and email before sending. That keeps quality high and reduces the risk of generic or misleading outreach from a fully autonomous sender.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
