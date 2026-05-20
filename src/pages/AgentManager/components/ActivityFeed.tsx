import { Activity, Clock } from "lucide-react";

interface ActivityEntry {
  id: string;
  emoji: string;
  source: string;
  message: string;
  type: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activityFeed: ActivityEntry[];
}

export function ActivityFeed({ activityFeed }: ActivityFeedProps) {
  return (
    <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] flex flex-col h-[500px]">
      <div className="px-4 py-3 border-b border-[#1c1c1f] flex items-center justify-between">
        <span className="text-[11px] text-white/40 font-medium">Activity</span>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/30">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {activityFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Activity className="h-6 w-6 text-white/10 mb-2" />
            <p className="text-[11px] text-white/20">No activity yet</p>
          </div>
        ) : (
          activityFeed.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-md transition-colors ${
                entry.type === "error" ? "bg-red-500/[0.05]" : "hover:bg-white/[0.02]"
              }`}
            >
              <span className="text-sm shrink-0 mt-0.5">{entry.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] leading-relaxed ${
                  entry.type === "error" ? "text-red-400/80" : "text-white/60"
                }`}>
                  {entry.message}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-white/20">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-[10px] text-white/15 font-medium">{entry.source}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
