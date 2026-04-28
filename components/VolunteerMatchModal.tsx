"use client";

import { useState, useEffect } from "react";
import { Need, Volunteer } from "@/types/database";
import { Loader2, CheckCircle2, ChevronDown, ChevronUp, MapPin, Clock, Users, Sparkles, Phone, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface RankedVolunteer {
  volunteer_id: string;
  score: number;
  reasoning: string;
  volunteer: Volunteer & { distance_km?: number | null };
}

interface VolunteerMatchModalProps {
  need: Need;
  onClose: () => void;
}

export default function VolunteerMatchModal({ need, onClose }: VolunteerMatchModalProps) {
  const [step, setStep] = useState<"loading" | "result" | "assigning" | "done">("loading");
  const [ranked, setRanked] = useState<RankedVolunteer[]>([]);
  const [topReasoning, setTopReasoning] = useState("");
  const [totalEvaluated, setTotalEvaluated] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!need) return;
    setStep("loading");
    setRanked([]);
    setShowAll(false);
    setError(null);

    console.log('Finding volunteer for need:', need.id);

    fetch(`/api/match/${need.id}`, { method: "POST" })
      .then((r) => {
        console.log('Match response status:', r.status);
        return r.json();
      })
      .then((data) => {
        console.log('Match data:', JSON.stringify(data).substring(0, 500));

        if (data.error) {
          setError(data.error);
          setStep("result");
          return;
        }

        setRanked(data.ranked || []);
        setTopReasoning(data.top_reasoning || "");
        setTotalEvaluated(data.total_volunteers_evaluated || 0);
        setStep("result");
      })
      .catch((err) => {
        console.error('Find volunteer error:', err.message);
        setError(err.message || 'Failed to find volunteers');
        setStep("result");
      });
  }, [need]);

  const handleAssign = async (volunteerId: string) => {
    setStep("assigning");
    const match = ranked.find((m) => m.volunteer_id === volunteerId);
    try {
      const res = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needId: need.id, volunteerId, aiReasoning: match?.reasoning }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("done");
        toast.success("Volunteer assigned successfully!");
        if (data.mapsLink) {
          toast.success("Maps link generated for volunteer navigation", { duration: 4000 });
        }
        setTimeout(() => onClose(), 2000);
      } else {
        toast.error(data.error || "Assignment failed. Please try again.");
        setStep("result");
      }
    } catch {
      toast.error("Assignment failed. Please try again.");
      setStep("result");
    }
  };

  const topMatch = ranked[0];
  const topVolunteer = topMatch?.volunteer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-md3-4 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-google-grey-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-google-blue flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-google-grey-900 font-display">AI Volunteer Matching</h2>
              <p className="text-xs text-google-grey-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{need.need_type} · {need.location_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-google-grey-100 flex items-center justify-center transition-google">
            <X className="h-5 w-5 text-google-grey-600" />
          </button>
        </div>

        <div className="p-5">
          {/* Loading */}
          {step === "loading" && (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-google-blue/20 border-t-google-blue animate-spin" />
                <Sparkles className="h-6 w-6 text-google-blue absolute inset-0 m-auto" />
              </div>
              <p className="text-google-grey-800 font-medium">Gemini 2.5 Flash is evaluating volunteers…</p>
              <p className="text-xs text-google-grey-500">Matching skills, proximity, and workload</p>
            </div>
          )}

          {/* Assigning */}
          {step === "assigning" && (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-google-blue animate-spin" />
              <p className="text-google-grey-700">Assigning volunteer & sending notifications…</p>
              <p className="text-xs text-google-grey-500">WhatsApp + Email + Push</p>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-google-green" />
              </div>
              <p className="text-google-grey-900 font-bold text-lg">Assigned successfully!</p>
              <p className="text-xs text-google-grey-500">Volunteer has been notified via WhatsApp, Email & Push</p>
            </div>
          )}

          {/* Result */}
          {step === "result" && (
            <div className="space-y-4">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-google-grey-600 text-sm">{error}</p>
                </div>
              ) : !topMatch ? (
                <div className="text-center py-8">
                  <p className="text-google-grey-600 text-sm">No available volunteers found.</p>
                </div>
              ) : (
                <>
                  {/* Total evaluated badge */}
                  {totalEvaluated > 0 && (
                    <p className="text-[10px] text-google-grey-500 text-center">
                      Gemini evaluated <span className="font-bold text-google-blue">{totalEvaluated}</span> volunteers
                    </p>
                  )}

                  {/* Top match card */}
                  <div className="rounded-xl border-2 border-google-blue/30 bg-blue-50/50 p-4">
                    <div className="flex items-center gap-1 text-[10px] text-google-blue font-semibold uppercase tracking-wide mb-3">
                      <Sparkles className="h-3 w-3" /> Best Match
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-google-grey-900 text-base">{topVolunteer?.name || "Unknown"}</p>
                        {topVolunteer?.phone && (
                          <p className="text-xs text-google-grey-500 mt-0.5 flex items-center gap-1">
                            <Phone className="h-3 w-3" />{topVolunteer.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-google-blue">{topMatch.score}</div>
                        <div className="text-[10px] text-google-grey-500">match score</div>
                      </div>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {topVolunteer?.skills?.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-google-blue/10 text-[11px] text-google-blue font-medium border border-google-blue/20">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Distance & tasks */}
                    <div className="flex items-center gap-4 text-xs text-google-grey-600 mb-3">
                      {topVolunteer?.distance_km != null && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-google-grey-100">
                          <MapPin className="h-3 w-3" />{topVolunteer.distance_km.toFixed(1)} km
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{topVolunteer?.active_task_count || 0} active tasks
                      </span>
                    </div>

                    {/* Gemini reasoning */}
                    {topReasoning && (
                      <div className="border-l-3 border-google-blue/50 pl-3 py-2 mb-4 bg-white rounded-r-lg">
                        <div className="flex items-center gap-1 text-[10px] text-google-grey-500 mb-1">
                          <Sparkles className="h-3 w-3 text-google-blue" /> Gemini Analysis
                        </div>
                        <p className="text-xs text-google-grey-700 italic leading-relaxed">
                          {topReasoning}
                        </p>
                      </div>
                    )}

                    {/* Assign button — Google Red */}
                    <button
                      onClick={() => handleAssign(topMatch.volunteer_id)}
                      className="w-full py-3 bg-google-red text-white rounded-full text-sm font-semibold hover:opacity-90 transition-google flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Assign {topVolunteer?.name?.split(" ")[0]}
                    </button>
                  </div>

                  {/* Other candidates */}
                  {ranked.length > 1 && (
                    <div>
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-1.5 text-xs text-google-grey-600 hover:text-google-grey-800 transition-google font-medium"
                      >
                        {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {showAll ? "Hide" : "See"} {ranked.length - 1} other candidates
                      </button>
                      {showAll && (
                        <div className="mt-3 space-y-2">
                          {ranked.slice(1).map((m) => {
                            const vol = m.volunteer;
                            return (
                              <div key={m.volunteer_id} className="flex items-center justify-between p-3 rounded-xl border border-google-grey-200 bg-google-grey-50 hover:bg-white transition-google">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-google-grey-900">{vol?.name}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {vol?.skills?.slice(0, 3).map((s) => (
                                      <span key={s} className="px-1.5 py-0 rounded text-[10px] text-google-grey-600 bg-google-grey-200">{s}</span>
                                    ))}
                                  </div>
                                  {m.reasoning && (
                                    <p className="text-[10px] text-google-grey-500 mt-1 truncate">{m.reasoning}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  {/* Score progress bar */}
                                  <div className="w-16">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-xs font-bold text-google-grey-700">{m.score}</span>
                                    </div>
                                    <div className="h-1.5 bg-google-grey-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                          width: `${m.score}%`,
                                          background: m.score >= 70 ? '#188038' : m.score >= 40 ? '#F29900' : '#D93025',
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleAssign(m.volunteer_id)}
                                    className="px-3 py-1.5 text-[11px] font-medium border border-google-grey-300 rounded-full text-google-grey-700 hover:bg-google-grey-100 transition-google"
                                  >
                                    Assign
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
