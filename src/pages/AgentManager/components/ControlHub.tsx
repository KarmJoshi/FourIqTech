import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Crown, PenTool, Layers, Wrench, Zap } from "lucide-react";

interface ControlHubProps {
  dispatchDepartment: (dept: string) => Promise<void>;
  dispatchDirectorCycle: () => Promise<void>;
  isDispatching: string | null;
  runningTasks: Record<string, any>;
}

export function ControlHub({ 
  dispatchDepartment, 
  dispatchDirectorCycle, 
  isDispatching, 
  runningTasks 
}: ControlHubProps) {
  const departments = [
    { 
      dept: "content", 
      label: "CONTENT STUDIO", 
      icon: PenTool, 
      colors: "bg-slate-900 border-slate-800 text-slate-400 hover:border-ai-purple/50 hover:text-ai-purple" 
    },
    { 
      dept: "structural", 
      label: "LAYOUT ENGINE", 
      icon: Layers, 
      colors: "bg-slate-900 border-slate-800 text-slate-400 hover:border-ai-blue/50 hover:text-ai-blue" 
    },
    { 
      dept: "technical", 
      label: "TECHNICAL LAB", 
      icon: Wrench, 
      colors: "bg-slate-900 border-slate-800 text-slate-400 hover:border-ai-tertiary/50 hover:text-ai-tertiary" 
    },
  ];

  return (
    <Card className="aether-card bg-slate-900/40 border-slate-800/60 shadow-xl rounded-[24px] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1.5 mr-6 pr-6 border-r border-slate-800/50">
            <span className="text-[9px] font-bold tracking-[0.3em] text-slate-500 uppercase">COMMAND_NEXUS</span>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-ai-primary" />
              <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">DISPATCH UNIT</span>
            </div>
          </div>

          <Button
            size="lg" 
            onClick={dispatchDirectorCycle} 
            disabled={isDispatching === "director" || !!runningTasks["director"]}
            className="h-14 px-8 rounded-xl bg-ai-primary/10 border border-ai-primary/30 hover:bg-ai-primary/20 hover:border-ai-primary text-ai-primary font-bold tracking-widest text-[11px] transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.1)] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {(isDispatching === "director" || runningTasks["director"]) ? (
              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
            ) : (
              <Crown className="mr-3 h-4 w-4" />
            )}
            FULL STRATEGIC CYCLE
          </Button>

          {departments.map(d => (
            <Button
              key={d.dept} 
              size="lg" 
              onClick={() => dispatchDepartment(d.dept)}
              disabled={isDispatching === d.dept || !!runningTasks[d.dept]}
              className={`h-14 px-6 rounded-xl border transition-all duration-300 group relative overflow-hidden font-bold tracking-widest text-[10px] ${d.colors}`}
            >
              {(isDispatching === d.dept || runningTasks[d.dept]) ? (
                <Loader2 className="mr-3 h-4 w-4 animate-spin text-ai-primary" />
              ) : (
                <d.icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
              )}
              {d.label}
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-white/20 transition-all group-hover:w-full" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
