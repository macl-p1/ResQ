"use client";
import { useState, useEffect } from "react";
import { Need, Volunteer } from "@/types/database";
import { Loader2, CheckCircle2, ChevronDown, ChevronUp, MapPin, Users, Sparkles, Phone, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface RankedVolunteer { volunteer_id: string; score: number; reasoning: string; volunteer: Volunteer & { distance_km?: number | null }; }
interface Props { need: Need; onClose: () => void; }

export default function VolunteerMatchModal({ need, onClose }: Props) {
  const [step, setStep] = useState<"loading"|"result"|"assigning"|"done">("loading");
  const [ranked, setRanked] = useState<RankedVolunteer[]>([]);
  const [topReasoning, setTopReasoning] = useState("");
  const [totalEvaluated, setTotalEvaluated] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (!need) return; setStep("loading"); setRanked([]); setShowAll(false); setError(null);
    fetch(`/api/match/${need.id}`, { method: "POST" }).then(r => r.json()).then(data => {
      if (data.error) { setError(data.error); setStep("result"); return; }
      setRanked(data.ranked||[]); setTopReasoning(data.top_reasoning||""); setTotalEvaluated(data.total_volunteers_evaluated||0); setStep("result");
    }).catch(err => { setError(err.message); setStep("result"); });
  }, [need]);

  const handleAssign = async (vid: string) => {
    setStep("assigning"); const m = ranked.find(m => m.volunteer_id === vid);
    try {
      const res = await fetch("/api/assign", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({needId:need.id, volunteerId:vid, aiReasoning:m?.reasoning}) });
      const data = await res.json();
      if (res.ok) { setStep("done"); toast.success("Assigned!"); if (data.mapsLink) toast.success("Maps link generated", {duration:4000}); setTimeout(onClose, 2000); }
      else { toast.error(data.error||"Failed"); setStep("result"); }
    } catch { toast.error("Failed"); setStep("result"); }
  };

  const top = ranked[0]; const topVol = top?.volunteer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-md3-4 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-glow-blue"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
            <div><h2 className="text-lg font-bold text-foreground font-display">AI Volunteer Matching</h2><p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{need.need_type} · {need.location_name}</p></div>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center transition-google"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="p-5">
          {step === "loading" && <div className="py-12 flex flex-col items-center gap-4">
            <div className="relative"><div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" /><Sparkles className="h-6 w-6 text-primary absolute inset-0 m-auto" /></div>
            <p className="text-foreground font-medium">Gemini 2.5 Flash evaluating…</p><p className="text-xs text-muted-foreground">Matching skills, proximity, workload</p>
          </div>}
          {step === "assigning" && <div className="py-12 flex flex-col items-center gap-4"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="text-foreground">Assigning & notifying…</p></div>}
          {step === "done" && <div className="py-12 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-emerald-950/50 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-green-600 dark:text-emerald-400" /></div>
            <p className="text-foreground font-bold text-lg">Assigned!</p><p className="text-xs text-muted-foreground">Notified via WhatsApp, Email & Push</p>
          </div>}
          {step === "result" && <div className="space-y-4">
            {error ? <div className="text-center py-8"><p className="text-muted-foreground text-sm">{error}</p></div>
            : !top ? <div className="text-center py-8"><p className="text-muted-foreground text-sm">No volunteers found.</p></div>
            : <>
              {totalEvaluated > 0 && <p className="text-[10px] text-muted-foreground text-center">Gemini evaluated <span className="font-bold text-primary">{totalEvaluated}</span> volunteers</p>}
              <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-1 text-[10px] text-primary font-semibold uppercase tracking-wide mb-3"><Sparkles className="h-3 w-3" /> Best Match</div>
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-bold text-foreground text-base">{topVol?.name||"Unknown"}</p>{topVol?.phone && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Phone className="h-3 w-3" />{topVol.phone}</p>}</div>
                  <div className="text-right"><div className="text-2xl font-bold text-primary">{top.score}</div><div className="text-[10px] text-muted-foreground">match score</div></div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">{topVol?.skills?.map(s => <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 text-[11px] text-primary font-medium border border-primary/20">{s}</span>)}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {topVol?.distance_km != null && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted"><MapPin className="h-3 w-3" />{topVol.distance_km.toFixed(1)} km</span>}
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{topVol?.active_task_count||0} active</span>
                </div>
                {topReasoning && <div className="border-l-[3px] border-primary/30 pl-3 py-2 mb-4 bg-muted rounded-r-lg"><div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1"><Sparkles className="h-3 w-3 text-primary" /> Gemini Analysis</div><p className="text-xs text-muted-foreground italic leading-relaxed">{topReasoning}</p></div>}
                <button onClick={() => handleAssign(top.volunteer_id)} className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-google flex items-center justify-center gap-2"><CheckCircle2 className="h-4 w-4" /> Assign {topVol?.name?.split(" ")[0]}</button>
              </div>
              {ranked.length > 1 && <div>
                <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-google font-medium">{showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} {showAll?"Hide":"See"} {ranked.length-1} others</button>
                {showAll && <div className="mt-3 space-y-2">{ranked.slice(1).map(m => {
                  const v = m.volunteer;
                  return <div key={m.volunteer_id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted transition-google">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">{v?.name}</p><div className="flex flex-wrap gap-1 mt-1">{v?.skills?.slice(0,3).map(s => <span key={s} className="px-1.5 py-0 rounded text-[10px] text-muted-foreground bg-muted">{s}</span>)}</div></div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="w-16"><span className="text-xs font-bold text-foreground">{m.score}</span><div className="h-1.5 bg-muted rounded-full overflow-hidden mt-0.5"><div className="h-full rounded-full transition-all" style={{width:`${m.score}%`,background:m.score>=70?'var(--brand-green)':m.score>=40?'var(--brand-amber)':'var(--brand-red)'}}/></div></div>
                      <button onClick={() => handleAssign(m.volunteer_id)} className="px-3 py-1.5 text-[11px] font-medium border border-border rounded-lg text-foreground hover:bg-muted transition-google">Assign</button>
                    </div>
                  </div>;
                })}</div>}
              </div>}
            </>}
          </div>}
        </div>
      </div>
    </div>
  );
}
