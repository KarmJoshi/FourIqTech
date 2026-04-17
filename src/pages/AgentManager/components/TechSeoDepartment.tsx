import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wrench, ShieldCheck, AlertTriangle, ShieldAlert,
  CheckCircle2, XCircle, Clock, Activity, Brain
} from "lucide-react";

interface TechSeoProps {
  intelligence: any;
  activityFeed: any[];
  runningTasks: Record<string, any>;
  directorStatus: any;
}

export function TechSeoDepartment({ intelligence, activityFeed, runningTasks, directorStatus }: TechSeoProps) {
  const risk = intelligence?.opportunities?.risk_report || {
    safe_auto: [], review_required: [], blocked: []
  };
  const duplicateGuard = intelligence?.opportunities?.duplicate_guard || [];
  const collisions = intelligence?.registry?.collisions || [];

  const techFixes = directorStatus?.tech_fixes || 0;
  const isRunning = Boolean(runningTasks["technical"]);

  const recentTechActivity = activityFeed
    .filter((item) => String(item.source || "").toLowerCase().includes("technical"))
    .slice(0, 8);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Safe Auto"
          value={risk.safe_auto?.length || 0}
          icon={<ShieldCheck className="h-4 w-4" />}
          color="text-ai-tertiary"
          bgColor="border-ai-tertiary/20 bg-ai-tertiary/[0.03]"
        />
        <StatCard
          label="Review Required"
          value={risk.review_required?.length || 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="text-amber-400"
          bgColor="border-amber-400/20 bg-amber-400/[0.03]"
        />
        <StatCard
          label="Blocked"
          value={risk.blocked?.length || 0}
          icon={<ShieldAlert className="h-4 w-4" />}
          color="text-red-400"
          bgColor="border-red-400/20 bg-red-400/[0.03]"
        />
        <StatCard
          label="Fixes Applied"
          value={techFixes}
          icon={<Wrench className="h-4 w-4" />}
          color="text-ai-primary"
          bgColor="border-ai-primary/20 bg-ai-primary/[0.03]"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main Risk Report */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase flex items-center gap-3">
              <Wrench className="h-4 w-4 text-ai-tertiary" /> RISK ASSESSMENT
            </h2>
            {isRunning && (
              <Badge className="bg-ai-tertiary/10 text-ai-tertiary border-ai-tertiary/20 text-[9px] uppercase tracking-widest animate-pulse">
                Scanning...
              </Badge>
            )}
          </div>

          {/* Safe Auto */}
          <RiskSection
            title="Safe for Auto-Execution"
            items={risk.safe_auto || []}
            icon={<CheckCircle2 className="h-4 w-4 text-ai-tertiary" />}
            borderColor="border-ai-tertiary/10"
            bgColor="bg-ai-tertiary/[0.02]"
            tagColor="text-ai-tertiary"
          />

          {/* Review Required */}
          <RiskSection
            title="Needs Manager Review"
            items={risk.review_required || []}
            icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
            borderColor="border-amber-400/10"
            bgColor="bg-amber-500/[0.02]"
            tagColor="text-amber-400"
          />

          {/* Blocked */}
          <RiskSection
            title="Blocked — Do Not Execute"
            items={risk.blocked || []}
            icon={<XCircle className="h-4 w-4 text-red-400" />}
            borderColor="border-red-500/10"
            bgColor="bg-red-500/[0.02]"
            tagColor="text-red-400"
          />

          {/* Collisions */}
          {collisions.length > 0 && (
            <Card className="aether-card bg-amber-500/[0.02] border-amber-500/10 rounded-[24px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-amber-400" /> Keyword Collisions ({collisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collisions.slice(0, 4).map((item: any, i: number) => (
                  <div key={`col-${i}`} className="rounded-xl border border-amber-500/10 bg-slate-950/50 p-3 space-y-1">
                    <p className="text-xs text-amber-200">{item.target}</p>
                    <p className="text-[10px] text-amber-400">vs {item.existing_slug}</p>
                    <p className="text-[10px] text-slate-500">
                      Overlap {Math.round((item.score || 0) * 100)}% • {item.severity}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Duplicate Guard */}
          {duplicateGuard.length > 0 && (
            <Card className="aether-card bg-slate-900/40 border-slate-800/60 rounded-[24px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-red-400" /> Intent Guard ({duplicateGuard.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {duplicateGuard.slice(0, 4).map((item: any, i: number) => (
                  <div key={`dup-${i}`} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-1">
                    <p className="text-xs text-white">{item.target}</p>
                    <p className="text-[10px] text-red-400 uppercase tracking-widest">{item.verdict}</p>
                    <p className="text-[10px] text-slate-500">
                      Matches: {item.matches?.map((m: any) => `${m.slug} (${m.score})`).join(", ") || "none"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Activity */}
        <div className="space-y-6">
          <Card className="aether-card bg-slate-900/40 border-slate-800/60 rounded-[24px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-ai-tertiary" /> Tech Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {recentTechActivity.length === 0 ? (
                    <p className="text-xs text-slate-600">No technical activity yet. Run a Tech cycle.</p>
                  ) : recentTechActivity.map((entry: any) => (
                    <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/30 border border-slate-800/30">
                      <span className="text-sm shrink-0">{entry.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-300 leading-snug">{entry.message}</p>
                        <p className="text-[9px] text-slate-600 mt-1 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bgColor }: {
  label: string; value: number; icon: React.ReactNode; color: string; bgColor: string;
}) {
  return (
    <Card className={`aether-card ${bgColor} rounded-[20px] overflow-hidden`}>
      <CardContent className="p-5 flex flex-col gap-2">
        <div className={`flex items-center gap-2 ${color}`}>
          {icon}
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
        </div>
        <span className="text-3xl font-display font-extrabold text-white">{value}</span>
      </CardContent>
    </Card>
  );
}

function RiskSection({ title, items, icon, borderColor, bgColor, tagColor }: {
  title: string; items: any[]; icon: React.ReactNode; borderColor: string; bgColor: string; tagColor: string;
}) {
  if (items.length === 0) return null;

  return (
    <Card className={`aether-card ${bgColor} ${borderColor} rounded-[24px]`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          {icon} {title} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 5).map((item: any, i: number) => (
          <div key={`risk-${i}`} className={`rounded-xl border ${borderColor} bg-slate-950/50 p-3 space-y-1`}>
            <p className="text-xs text-white">{item.target || item.id}</p>
            <p className={`text-[10px] ${tagColor}`}>{item.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
