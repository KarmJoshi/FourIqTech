import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
    <Card className="aether-card bg-slate-900 border-slate-800 h-full flex flex-col group overflow-hidden shadow-2xl">
      <CardHeader className="pb-4 border-b border-slate-800/50 bg-slate-950/50">
        <CardTitle className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-ai-tertiary animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-white uppercase">TACTICAL_INTEL_STREAM</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ai-tertiary shadow-[0_0_8px_rgba(5,206,250,0.5)]" />
            <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">LIVE_FEED</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-[520px]">
          <div className="p-4 space-y-3">
            {activityFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                <Activity className="h-10 w-10 mb-5 text-slate-800" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Waiting for system transmissions...</p>
              </div>
            ) : (
              activityFeed.map((entry) => (
                <div key={entry.id} className={`group/item flex items-start gap-4 p-4 rounded-xl transition-all duration-300 border ${
                  entry.type === "error" ? "bg-red-500/5 border-red-500/20 shadow-red-500/5" :
                  entry.type === "review" ? "bg-ai-primary/5 border-ai-primary/20" :
                  entry.type === "publish" ? "bg-ai-tertiary/5 border-ai-tertiary/20" :
                  "bg-slate-950/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700"
                }`}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 group-hover/item:border-slate-700 transition-colors shadow-lg">
                    <span className="text-xl leading-none grayscale-[0.3] group-hover/item:grayscale-0 transition-all">{entry.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className={`text-xs font-medium leading-relaxed tracking-wide ${
                      entry.type === "error" ? "text-red-300" :
                      entry.type === "review" ? "text-ai-primary" : 
                      "text-slate-300"
                    }`}>
                      {entry.message}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                      <Badge variant="outline" className="text-[9px] h-4.5 px-2 font-bold tracking-[0.2em] uppercase bg-slate-950 border-slate-800 text-slate-500 group-hover/item:border-slate-700 transition-colors">
                        {entry.source}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      </CardContent>
    </Card>
  );
}
