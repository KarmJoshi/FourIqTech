import { Activity, Bell, Play, Loader2 } from "lucide-react";

type DeptId = "director" | "content" | "techseo" | "landing" | "outreach" | "instagram";

interface TopBarProps {
  activeDept: DeptId;
  pendingCount: number;
  runningTasks: Record<string, any>;
  onDispatchDirector: () => void;
  isDispatching: string | null;
}

const DEPT_META: Record<DeptId, { title: string; subtitle: string }> = {
  director: { title: "Command Center", subtitle: "Strategic oversight and autonomous operations" },
  content: { title: "Content Studio", subtitle: "AI-powered blog generation and publishing" },
  techseo: { title: "Technical SEO", subtitle: "Site health, Core Web Vitals, and performance" },
  landing: { title: "Landing Pages", subtitle: "High-conversion service page generation" },
  instagram: { title: "Social Media", subtitle: "Content brainstorming and visual generation" },
  outreach: { title: "Outreach", subtitle: "Lead acquisition and email campaigns" },
};

export function TopBar({ activeDept, pendingCount, runningTasks, onDispatchDirector, isDispatching }: TopBarProps) {
  const meta = DEPT_META[activeDept];
  const activeTaskCount = Object.keys(runningTasks).length;

  return (
    <header className="h-[60px] border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[15px] font-semibold text-white leading-tight">{meta.title}</h1>
          <p className="text-[11px] text-slate-500 leading-tight hidden sm:block">{meta.subtitle}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Running indicator */}
        {activeTaskCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/[0.1] border border-cyan-500/[0.15]">
            <Loader2 className="h-3 w-3 text-cyan-400 animate-spin" />
            <span className="text-[11px] font-medium text-cyan-400">{activeTaskCount} active</span>
          </div>
        )}

        {/* Pending reviews */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/[0.1] border border-amber-500/[0.15]">
            <Bell className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] font-medium text-amber-400">{pendingCount} review</span>
          </div>
        )}

        {/* Quick dispatch */}
        <button
          onClick={onDispatchDirector}
          disabled={!!isDispatching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDispatching === "director" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          Run Cycle
        </button>
      </div>
    </header>
  );
}
