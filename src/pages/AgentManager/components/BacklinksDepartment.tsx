import { useState, useEffect } from "react";
import { Link2, ExternalLink, Mail, Search, FileText, Loader2 } from "lucide-react";

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

  const stats = {
    total: opportunities.length,
    ready: opportunities.filter(o => o.status === 'content_ready').length,
    pitched: opportunities.filter(o => o.status === 'pitched').length,
    won: opportunities.filter(o => o.status === 'won').length,
  };

  const backlinkActivity = activityFeed
    .filter(item => String(item.source || "").toLowerCase().includes("backlink"))
    .slice(0, 5);

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

      {/* Dispatch Buttons */}
      <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4">
        <span className="text-[11px] text-white/40 block mb-3">Run Backlink Campaign</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dispatchDepartment("backlinks")}
            disabled={isRunning || isDispatching === "backlinks"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white text-black text-[12px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
            Find Guest Posts
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
            <div key={opp.id} className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4">
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
                  <p className="text-[11px] text-white/30 mt-1">{opp.pitchAngle || opp.notes}</p>
                  {opp.targetKeyword && (
                    <p className="text-[10px] text-white/20 mt-1">Topic: {opp.targetKeyword}</p>
                  )}
                </div>
                <a href={opp.targetUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 rounded-md hover:bg-white/[0.04]">
                  <ExternalLink className="h-3.5 w-3.5 text-white/30" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Activity */}
      {backlinkActivity.length > 0 && (
        <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4">
          <span className="text-[11px] text-white/40 block mb-3">Recent Activity</span>
          {backlinkActivity.map((entry: any) => (
            <div key={entry.id} className="flex items-start gap-2 py-2">
              <span className="text-sm">{entry.emoji}</span>
              <p className="text-[11px] text-white/50">{entry.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
