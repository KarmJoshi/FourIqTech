import { Loader2, Crown, PenTool, Layers, Wrench } from "lucide-react";

interface ControlHubProps {
  dispatchDepartment: (dept: string) => Promise<void>;
  dispatchDirectorCycle: () => Promise<void>;
  isDispatching: string | null;
  runningTasks: Record<string, any>;
}

export function ControlHub({ dispatchDepartment, dispatchDirectorCycle, isDispatching, runningTasks }: ControlHubProps) {
  const departments = [
    { dept: "content", label: "Content", icon: PenTool },
    { dept: "structural", label: "Pages", icon: Layers },
    { dept: "technical", label: "Technical", icon: Wrench },
  ];

  return (
    <div className="rounded-lg border border-[#1c1c1f] bg-[#111113] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-white/40 font-medium">Dispatch</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Director Cycle */}
        <button
          onClick={dispatchDirectorCycle}
          disabled={isDispatching === "director" || !!runningTasks["director"]}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white text-black text-[12px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {(isDispatching === "director" || runningTasks["director"]) ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crown className="h-3.5 w-3.5" />
          )}
          Full Cycle
        </button>

        {/* Department buttons */}
        {departments.map(d => (
          <button
            key={d.dept}
            onClick={() => dispatchDepartment(d.dept)}
            disabled={isDispatching === d.dept || !!runningTasks[d.dept]}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/[0.06] border border-[#1c1c1f] text-white/70 text-[12px] font-medium hover:bg-white/[0.1] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {(isDispatching === d.dept || runningTasks[d.dept]) ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <d.icon className="h-3.5 w-3.5" />
            )}
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
