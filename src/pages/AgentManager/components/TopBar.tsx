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
  techseo: { title: "Technical SEO", subtitle: "Site health, performance, and Core Web Vitals" },
  landing: { title: "Landing Pages", subtitle: "High-conversion service page generation" },
  instagram: { title: "Social Media", subtitle: "Content brainstorming and visual generation" },
  outreach: { title: "Outreach", subtitle: "Lead acquisition and email campaigns" },
};

export function TopBar({ activeDept, pendingCount, runningTasks, onDispatchDirector, isDispatching }: TopBarProps) {
  const meta = DEPT_META[activeDept];
  const activeTaskCount = Object.keys(runningTasks).length;

  return (
    <header className="h-14 border-b border-[#1c1c1f] bg-[#0c0c0e]/90 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div>
        <h1 className="text-[14px] font-medium text-white/90">{meta.title}</h1>
        <p className="text-[11px] text-white/30 hidden sm:block">{meta.subtitle}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {activeTaskCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
            <Loader2 className="h-3 w-3 text-white/60 animate-spin" />
            <span className="text-[11px] font-medium text-white/60">{activeTaskCount} running</span>
          </div>
        )}

        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/[0.08] border border-amber-500/[0.12]">
            <Bell className="h-3 w-3 text-amber-400/80" />
            <span className="text-[11px] font-medium text-amber-400/80">{pendingCount}</span>
          </div>
        )}

        <button
          onClick={onDispatchDirector}
          disabled={!!isDispatching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-[11px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
