import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle2, TrendingUp, Loader2, Activity, FileText } from "lucide-react";

interface StatsBarProps {
  directorStatus: any;
  stagingStats: any;
  pendingCount: number;
  runningTasks: Record<string, any>;
  intelligence?: any;
}

export function StatsBar({ directorStatus, stagingStats, pendingCount, runningTasks, intelligence }: StatsBarProps) {
  const taskCount = Object.keys(runningTasks).length;
  const collisionCount = intelligence?.registry?.collisions?.length || 0;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5 animate-in fade-in slide-in-from-top-2 duration-1000">
      <Card className="aether-card bg-slate-900 shadow-xl relative overflow-hidden group border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-ai-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-1 px-5 pt-5">
          <CardDescription className="text-ai-primary/80 font-bold tracking-[0.2em] uppercase text-[9px]">EXECUTIVE DIRECTOR</CardDescription>
          <CardTitle className="text-lg font-bold tracking-tight text-white mt-1">Gemini 2.0 Flash</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-2 flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <div className="absolute h-full w-full bg-ai-primary rounded-full animate-ping opacity-40" />
            <div className="h-1.5 w-1.5 bg-ai-primary rounded-full relative z-10" />
          </div>
          ACTIVE_COMMAND
        </CardContent>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 hover:border-slate-700 transition-all group p-5 flex flex-col justify-between">
        <div className="space-y-1">
          <CardDescription className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]">STAGING_OVERSIGHT</CardDescription>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-display font-extrabold text-white">{pendingCount}</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5">Pending</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
          <FileText className="h-3.5 w-3.5 text-slate-600" /> 
          {stagingStats?.total_submitted || 0} TOTAL_UNITS
        </div>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 hover:border-slate-700 transition-all group p-5 flex flex-col justify-between">
        <div className="space-y-1">
          <CardDescription className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]">VERIFICATION_INDEX</CardDescription>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-display font-extrabold text-ai-tertiary">{stagingStats?.approval_rate || "0%"}</span>
            <span className="text-[10px] font-bold text-ai-tertiary/70 uppercase tracking-widest mb-1.5">Success</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
          <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" /> 
          {stagingStats?.approved || 0} AUTH_ASSETS
        </div>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 hover:border-slate-700 transition-all group p-5 flex flex-col justify-between">
        <div className="space-y-1">
          <CardDescription className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]">SEARCH_PENETRATION</CardDescription>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-display font-extrabold text-ai-primary">{intelligence?.gsc?.summary?.total_impressions || "0"}</span>
            <span className="text-[10px] font-bold text-ai-primary/70 uppercase tracking-widest mb-1.5">Impressions</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
          <Activity className="h-3.5 w-3.5 text-slate-700" /> 
          30_DAY_VISIBILITY
        </div>
      </Card>

      <Card className="aether-card bg-slate-950/20 border-slate-800/50 hover:border-slate-700 transition-all group p-5 flex flex-col justify-between">
        <div className="space-y-1">
          <CardDescription className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]">MARKET_CAPTURE</CardDescription>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-display font-extrabold text-ai-tertiary">{intelligence?.gsc?.summary?.total_clicks || "0"}</span>
            <span className="text-[10px] font-bold text-ai-tertiary/70 uppercase tracking-widest mb-1.5">Clicks</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
          <TrendingUp className="h-3.5 w-3.5 text-ai-tertiary/50" /> 
          DIRECT_TRAFFIC_WINS
        </div>
      </Card>
    </div>
  );
}
