import { useState, useEffect } from "react";
import { Link2, ExternalLink, Mail, Search, FileText, Loader2, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://fouriqtech.onrender.com"
    : "http://localhost:3848");

interface BacklinksProps {
  activityFeed: any[];
  runningTasks: Record<string, any>;
  dispatchDepartment: (dept: string) => Promise<void>;
  isDispatching: string | null;
}

export function BacklinksDepartment({ activityFeed, runningTasks, dispatchDepartment, isDispatching }: BacklinksProps) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [copied, setCopied] = useState("");

  const isRunning = Boolean(runningTasks["backlinks"]);

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/backlinks`);
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data.opportunities || []);
        }
      } catch {} finally { setLoading(false); }
    }
    loadOpportunities();
    const interval = setInterval(loadOpportunities, 15000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const stats = {
    total: opportunities.length,
    ready: opportunities.filter(o => o.status === 'content_ready').length,
    pitched: opportunities.filter(o => o.status === 'pitched').length,
    won: opportunities.filter(o => o.status === 'won').length,
  };

  // ═══════════════════════════════════════════════════════════════
  // DETAIL VIEW — Single opportunity
  // ═══════════════════════════════════════════════════════════════
  if (selectedOpp) {
    let emailData = { subject: '', body: '' };
    try { emailData = JSON.parse(selectedOpp.outreachEmail || '{}'); } catch {}

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Back button */}
        <button onClick={() => setSelectedOpp(null)} className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all opportunities
        </button>

        {/* Header */}
        <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                selectedOpp.status === 'content_ready' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-white/40'
              }`}>{selectedOpp.status?.replace(/_/g, ' ')}</span>
              <h2 className="text-lg font-semibold text-white mt-2">{selectedOpp.targetDomain}</h2>
              <p className="text-[12px] text-white/40 mt-1">{selectedOpp.pitchAngle}</p>
            </div>
            <a href={selectedOpp.targetUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md text-[11px] text-white/50 border border-[#1c1c1f] hover:bg-white/[0.04]">
              Visit Site ↗
            </a>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#1c1c1f]">
            <div><span className="text-[10px] text-white/30 block">Type</span><span className="text-[12px] text-white/70">{selectedOpp.type?.replace(/_/g, ' ')}</span></div>
            <div><span className="text-[10px] text-white/30 block">Contact</span><span className="text-[12px] text-white/70">{selectedOpp.contactEmail || 'Not found'}</span></div>
            <div><span className="text-[10px] text-white/30 block">Relevance</span><span className="text-[12px] text-white/70">{Math.round((selectedOpp.relevanceScore || 0) * 100)}%</span></div>
          </div>
        </div>

        {/* Steps to Submit */}
        <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-5">
          <h3 className="text-[13px] font-medium text-white mb-3">📋 Steps to Get This Backlink</h3>
          <ol className="space-y-2 text-[12px] text-white/60">
            <li className="flex gap-2"><span className="text-white/30 font-mono">1.</span> Review the drafted email below and edit if needed</li>
            <li className="flex gap-2"><span className="text-white/30 font-mono">2.</span> Copy the email and send from hello@fouriqtech.com to <span className="text-white/80">{selectedOpp.contactEmail || 'their editor'}</span></li>
            <li className="flex gap-2"><span className="text-white/30 font-mono">3.</span> Wait for their reply (usually 3-7 days)</li>
            <li className="flex gap-2"><span className="text-white/30 font-mono">4.</span> If accepted: send them the guest post article below</li>
            <li className="flex gap-2"><span className="text-white/30 font-mono">5.</span> They publish it → you get a backlink ✅</li>
          </ol>
          {selectedOpp.notes && (
            <p className="text-[11px] text-white/30 mt-3 pt-3 border-t border-[#1c1c1f]">💡 {selectedOpp.notes}</p>
          )}
        </div>

        {/* Outreach Email */}
        <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-medium text-white">📧 Outreach Email</h3>
            <button
              onClick={() => copyToClipboard(`Subject: ${emailData.subject}\n\n${emailData.body}`, 'email')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] bg-white/[0.06] text-white/50 hover:text-white/80 transition-colors"
            >
              {copied === 'email' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied === 'email' ? 'Copied!' : 'Copy Email'}
            </button>
          </div>
          <div className="bg-[#0c0c0e] rounded-md p-4 space-y-3">
            <div>
              <span className="text-[10px] text-white/30">Subject:</span>
              <p className="text-[13px] text-white/80 font-medium">{emailData.subject}</p>
            </div>
            <div>
              <span className="text-[10px] text-white/30">Body:</span>
              <p className="text-[12px] text-white/60 whitespace-pre-wrap leading-relaxed mt-1">{emailData.body}</p>
            </div>
          </div>
        </div>

        {/* Guest Post Article */}
        {selectedOpp.ourContent && (
          <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-medium text-white">📝 Guest Post Article</h3>
              <button
                onClick={() => copyToClipboard(selectedOpp.ourContent, 'article')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] bg-white/[0.06] text-white/50 hover:text-white/80 transition-colors"
              >
                {copied === 'article' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied === 'article' ? 'Copied!' : 'Copy Article'}
              </button>
            </div>
            <div className="bg-[#0c0c0e] rounded-md p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-[12px] text-white/50 whitespace-pre-wrap leading-relaxed font-sans">{selectedOpp.ourContent}</pre>
            </div>
            <p className="text-[10px] text-white/20 mt-2">{selectedOpp.ourContent?.length || 0} characters</p>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // LIST VIEW — All opportunities
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Opportunities", value: stats.total, icon: Search },
          { label: "Content Ready", value: stats.ready, icon: FileText },
          { label: "Pitched", value: stats.pitched, icon: Mail },
          { label: "Links Won", value: stats.won, icon: Link2, highlight: true },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/40">{s.label}</span>
              <s.icon className="h-3.5 w-3.5 text-white/20" />
            </div>
            <span className={`text-2xl font-semibold mt-2 block ${s.highlight ? "text-emerald-400" : "text-white/90"}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Dispatch */}
      <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4">
        <span className="text-[11px] text-white/40 block mb-3">Run Backlink Campaign</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dispatchDepartment("backlinks")}
            disabled={isRunning || isDispatching === "backlinks"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white text-black text-[12px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
            Find Opportunities
          </button>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-3">
        <span className="text-[11px] text-white/40">Link Opportunities ({opportunities.length})</span>
        
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 text-white/20 animate-spin mx-auto" /></div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-lg border border-[#1c1c1f] border-dashed bg-[#111113]/50 py-12 text-center">
            <Link2 className="h-8 w-8 text-white/10 mx-auto mb-3" />
            <p className="text-[12px] text-white/20">No opportunities yet. Run a campaign to find link targets.</p>
          </div>
        ) : (
          opportunities.map((opp: any) => (
            <button
              key={opp.id}
              onClick={() => setSelectedOpp(opp)}
              className="w-full text-left rounded-lg border border-[#1c1c1f] bg-[#111113] p-4 hover:border-white/[0.12] hover:bg-[#141416] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      opp.status === 'content_ready' ? 'bg-emerald-500/10 text-emerald-400' :
                      opp.status === 'pitched' ? 'bg-amber-500/10 text-amber-400' :
                      opp.status === 'won' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-white/[0.04] text-white/40'
                    }`}>
                      {opp.status?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-white/20">{opp.type?.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="text-[13px] font-medium text-white/80">{opp.targetDomain}</h3>
                  <p className="text-[11px] text-white/30 mt-1 truncate">{opp.pitchAngle || opp.notes}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-white/20 shrink-0 mt-1" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
