"use client";

import { Assignment } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, PlayCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface StatusTrackerProps {
  assignment: Assignment;
  onStatusUpdate?: () => void;
}

const steps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "in_progress", label: "In Progress", icon: PlayCircle },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

export default function StatusTracker({ assignment, onStatusUpdate }: StatusTrackerProps) {
  const [updating, setUpdating] = useState(false);
  const currentIdx = steps.findIndex((s) => s.key === assignment.status);

  const handleUpdate = async (newStatus: "in_progress" | "completed") => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onStatusUpdate?.();
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-lg bg-slate-800/50 border border-white/10 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignment Progress</span>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIdx;
          const StepIcon = step.icon;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-700/50 text-slate-500 border border-white/5"}`}>
                <StepIcon className="h-3 w-3" />
                {step.label}
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-6 rounded ${idx < currentIdx ? "bg-emerald-500" : "bg-slate-700"}`} />
              )}
            </div>
          );
        })}
      </div>

      {assignment.completed_at && (
        <p className="text-xs text-slate-500">Completed: {new Date(assignment.completed_at).toLocaleString()}</p>
      )}

      <div className="flex gap-2">
        {assignment.status === "pending" && (
          <Button size="sm" disabled={updating} onClick={() => handleUpdate("in_progress")} className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
            {updating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <PlayCircle className="h-3 w-3 mr-1" />}
            Mark In Progress
          </Button>
        )}
        {assignment.status === "in_progress" && (
          <Button size="sm" disabled={updating} onClick={() => handleUpdate("completed")} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
            {updating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
            Mark Completed
          </Button>
        )}
        {assignment.status === "completed" && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />Resolved
          </Badge>
        )}
      </div>
    </div>
  );
}
