import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DepartmentViewProps {
  department: "content" | "structural" | "technical";
  intelligence: any;
  activityFeed: any[];
  runningTasks: Record<string, any>;
}

export function DepartmentView({ department, intelligence, activityFeed, runningTasks }: DepartmentViewProps) {
  const opportunities = intelligence?.opportunities || {};
  const contentStrategy = opportunities.content_strategy || { briefs: [], refresh_queue: [], prune_candidates: [] };
  const linkPlan = opportunities.internal_link_plan || [];
  const riskReport = opportunities.risk_report || { safe_auto: [], review_required: [], blocked: [] };

  const titleMap = {
    content: "Content Hub",
    structural: "Layout Engine",
    technical: "Tech Lab",
  };

  const subtitleMap = {
    content: "briefs, refreshes, and pruning decisions",
    structural: "internal links, support pages, and site architecture",
    technical: "safe execution gates and review-required work",
  };

  const isRunning = Boolean(runningTasks[department]);
  const recentFeed = activityFeed.filter((item) => String(item.source || '').toLowerCase().includes(department)).slice(0, 6);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card className="aether-card bg-slate-900/40 border-slate-800/50 rounded-[28px]">
          <CardHeader>
            <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">DEPARTMENT_STATUS</CardDescription>
            <CardTitle className="text-white flex items-center gap-3">
              {titleMap[department]}
              <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{isRunning ? 'running' : 'ready'}</Badge>
            </CardTitle>
            <p className="text-xs text-slate-400">{subtitleMap[department]}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {department === "content" && (
              <div className="grid gap-4 md:grid-cols-3">
                <SectionCard label="Briefs" items={contentStrategy.briefs.map((item: any) => ({ title: item.target_slug, body: item.objective }))} />
                <SectionCard label="Refresh" items={contentStrategy.refresh_queue.map((item: any) => ({ title: item.slug, body: item.reason }))} />
                <SectionCard label="Prune" items={contentStrategy.prune_candidates.map((item: any) => ({ title: item.slug, body: item.reason }))} />
              </div>
            )}

            {department === "structural" && (
              <div className="grid gap-4 md:grid-cols-2">
                {linkPlan.slice(0, 6).map((item: any) => (
                  <div key={item.target} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
                    <p className="text-xs text-white">{item.target}</p>
                    <p className="text-[10px] text-slate-400">Position {item.target_position} • Impressions {item.target_impressions}</p>
                    <p className="text-[10px] text-ai-blue uppercase tracking-widest">{item.anchor_direction}</p>
                    <p className="text-[10px] text-slate-500">Sources: {item.suggested_sources.map((source: any) => source.source).join(', ')}</p>
                  </div>
                ))}
              </div>
            )}

            {department === "technical" && (
              <div className="grid gap-4 md:grid-cols-3">
                <SectionCard label="Safe Auto" items={riskReport.safe_auto.map((item: any) => ({ title: item.target || item.id, body: item.reason }))} />
                <SectionCard label="Review" items={riskReport.review_required.map((item: any) => ({ title: item.target || item.id, body: item.reason }))} />
                <SectionCard label="Blocked" items={riskReport.blocked.map((item: any) => ({ title: item.target || item.id, body: item.reason }))} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="aether-card bg-slate-900/40 border-slate-800/50 rounded-[28px]">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">RECENT_ACTIVITY</CardDescription>
          <CardTitle className="text-white">{titleMap[department]} Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentFeed.length === 0 ? (
            <p className="text-xs text-slate-500">No department-specific activity logged yet.</p>
          ) : recentFeed.map((item: any) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs text-white">{item.message}</p>
              <p className="text-[10px] text-slate-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SectionCard({ label, items }: { label: string; items: Array<{ title: string; body: string }> }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">No items available.</p>
      ) : items.slice(0, 4).map((item, index) => (
        <div key={`${item.title}-${index}`} className="space-y-1">
          <p className="text-xs text-white">{item.title}</p>
          <p className="text-[10px] text-slate-500">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
