import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, Target, LineChart } from "lucide-react";

interface IntelligencePanelProps {
  intelligence: any;
}

export function IntelligencePanel({ intelligence }: IntelligencePanelProps) {
  const opportunities = intelligence?.opportunities?.top_opportunities || [];
  const collisions = intelligence?.registry?.collisions || [];
  const playbooks = intelligence?.playbooks?.scores || [];
  const links = intelligence?.opportunities?.internal_link_plan || [];
  const risk = intelligence?.opportunities?.risk_report || { safe_auto: [], review_required: [], blocked: [] };
  const contentStrategy = intelligence?.opportunities?.content_strategy || { briefs: [], refresh_queue: [], prune_candidates: [] };
  const competitor = intelligence?.competitor || { queries: [] };
  const duplicateGuard = intelligence?.opportunities?.duplicate_guard || [];

  return (
    <div className="grid gap-5 xl:grid-cols-3 animate-in fade-in slide-in-from-top-2 duration-1000">
      <Card className="aether-card bg-slate-950/20 border-slate-800/50">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">TOP_OPPORTUNITIES</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><Target className="h-4 w-4 text-ai-primary" /> PRIORITY_QUEUE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {opportunities.slice(0, 4).map((item: any) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline" className="text-[9px] tracking-widest uppercase">{item.department}</Badge>
                <span className="text-[10px] font-bold text-ai-primary">Score {item.score}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              {item.risk_flag && <p className="text-[10px] text-amber-400 uppercase tracking-widest">{item.risk_flag}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">COLLISION_GUARD</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><AlertTriangle className="h-4 w-4 text-amber-400" /> CANNIBALIZATION</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {collisions.length === 0 ? (
            <p className="text-xs text-slate-500">No strong collisions detected.</p>
          ) : collisions.slice(0, 4).map((item: any, index: number) => (
            <div key={`${item.opportunity_id}-${index}`} className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 space-y-1">
              <p className="text-xs text-amber-200">{item.target}</p>
              <p className="text-[10px] uppercase tracking-widest text-amber-400">vs {item.existing_slug}</p>
              <p className="text-[10px] text-slate-400">Overlap {Math.round((item.score || 0) * 100)}% • {item.severity}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.blocked ? 'blocked' : item.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">PLAYBOOK_LEARNING</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><Brain className="h-4 w-4 text-ai-tertiary" /> LEARNING_LOOP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {playbooks.length === 0 ? (
            <p className="text-xs text-slate-500">Waiting for enough action history to score playbooks.</p>
          ) : playbooks.slice(0, 4).map((item: any) => (
            <div key={item.playbook} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white uppercase tracking-widest">{item.playbook}</p>
                <LineChart className="h-3.5 w-3.5 text-ai-tertiary" />
              </div>
              <p className="text-[10px] text-slate-400">Avg success {item.average_success} • Runs {item.runs}</p>
              <p className="text-[10px] text-slate-500">Positive rate {item.positive_rate}%</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 xl:col-span-2">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">STRUCTURAL_INTELLIGENCE</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><Target className="h-4 w-4 text-ai-blue" /> INTERNAL_LINK_PLAN</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {links.slice(0, 4).map((item: any) => (
            <div key={item.target} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
              <p className="text-xs text-white">{item.target}</p>
              <p className="text-[10px] text-slate-500">Position {item.target_position} • Impressions {item.target_impressions}</p>
              <p className="text-[10px] text-ai-blue uppercase tracking-widest">{item.anchor_direction}</p>
              <p className="text-[10px] text-slate-400">Sources: {item.suggested_sources.map((source: any) => source.source).join(', ')}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 xl:col-span-3">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">SAFE_EXECUTION</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><LineChart className="h-4 w-4 text-ai-primary" /> RISK_POLICY</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-ai-tertiary/10 bg-ai-tertiary/5 p-3">
            <p className="text-[10px] uppercase tracking-widest text-ai-tertiary">safe_auto</p>
            <p className="text-2xl font-bold text-white mt-1">{risk.safe_auto?.length || 0}</p>
          </div>
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-400">review_required</p>
            <p className="text-2xl font-bold text-white mt-1">{risk.review_required?.length || 0}</p>
          </div>
          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3">
            <p className="text-[10px] uppercase tracking-widest text-red-400">blocked</p>
            <p className="text-2xl font-bold text-white mt-1">{risk.blocked?.length || 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 xl:col-span-3">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">CONTENT_OPERATIONS</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><Brain className="h-4 w-4 text-ai-purple" /> BRIEFS_REFRESH_PRUNE</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-ai-purple">briefs</p>
            {contentStrategy.briefs?.slice(0, 3).map((item: any) => (
              <div key={item.target_slug} className="space-y-1">
                <p className="text-xs text-white">{item.target_slug}</p>
                <p className="text-[10px] text-slate-400">{item.primary_keyword}</p>
                <p className="text-[10px] text-slate-500">{item.objective}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-amber-400">refresh_queue</p>
            {contentStrategy.refresh_queue?.slice(0, 3).map((item: any) => (
              <div key={item.slug} className="space-y-1">
                <p className="text-xs text-white">{item.slug}</p>
                <p className="text-[10px] text-slate-400">Position {item.position} • Impressions {item.impressions}</p>
                <p className="text-[10px] text-slate-500">{item.reason}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-red-400">prune_candidates</p>
            {contentStrategy.prune_candidates?.length ? contentStrategy.prune_candidates.slice(0, 3).map((item: any) => (
              <div key={item.slug} className="space-y-1">
                <p className="text-xs text-white">{item.slug}</p>
                <p className="text-[10px] text-slate-500">{item.reason}</p>
              </div>
            )) : <p className="text-xs text-slate-500">No prune candidates right now.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 xl:col-span-3">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">SERP_INTELLIGENCE</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><Target className="h-4 w-4 text-ai-primary" /> COMPETITOR_GAPS</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {competitor.queries?.slice(0, 4).map((item: any) => (
            <div key={item.query} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
              <p className="text-xs text-white">{item.query}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{item.gap_signal}</p>
              <p className="text-[10px] text-slate-400">Our coverage: {item.our_coverage?.join(', ') || 'none'}</p>
              <p className="text-[10px] text-slate-500">Competitors: {item.competitor_results?.map((result: any) => result.hostname).join(', ') || 'none'}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 xl:col-span-3">
        <CardHeader>
          <CardDescription className="text-[9px] uppercase font-bold tracking-[0.2em] text-slate-500">DUPLICATE_BLOCKER</CardDescription>
          <CardTitle className="flex items-center gap-2 text-white"><Brain className="h-4 w-4 text-red-400" /> INTENT_GUARD</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {duplicateGuard.slice(0, 4).map((item: any, index: number) => (
            <div key={`${item.target}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
              <p className="text-xs text-white">{item.target}</p>
              <p className="text-[10px] uppercase tracking-widest text-red-400">{item.verdict}</p>
              <p className="text-[10px] text-slate-500">Matches: {item.matches?.map((match: any) => `${match.slug} (${match.score})`).join(', ') || 'none'}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
