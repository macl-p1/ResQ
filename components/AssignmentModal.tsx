"use client";

import { useState } from "react";
import { Need, Volunteer, VolunteerMatch } from "@/types/database";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, UserCheck, MapPin, Briefcase, Star, Quote, CheckCircle2, XCircle,
} from "lucide-react";

interface AssignmentModalProps {
  need: Need | null;
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

interface MatchResult {
  assignment: { id: string; need_id: string; volunteer_id: string; status: string; claude_reasoning: string };
  matched_volunteer: Volunteer;
  all_matches: VolunteerMatch[];
  top_reasoning: string;
}

export default function AssignmentModal({ need, isOpen, onClose, onAssigned }: AssignmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFindMatch = async () => {
    if (!need) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/match/${need.id}`, { method: "POST" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      setResult(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally { setLoading(false); }
  };

  const handleClose = () => { setResult(null); setError(null); setLoading(false); onClose(); if (result) onAssigned?.(); };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-rose-400" />Find Volunteer Match
          </DialogTitle>
          <DialogDescription className="text-slate-400">AI-powered volunteer matching</DialogDescription>
        </DialogHeader>

        {need && (
          <div className="rounded-lg bg-slate-800/50 border border-white/10 p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{need.need_type}</span>
              <Badge variant="outline" className={`text-xs ${need.urgency_score > 75 ? "bg-red-500/20 text-red-400 border-red-500/30" : need.urgency_score >= 40 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
                Urgency: {need.urgency_score}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{need.location_name}</p>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 mb-4">Claude AI will analyze available volunteers and find the best match based on skills, proximity, and workload.</p>
            <Button onClick={handleFindMatch} className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white border-0 px-8">
              <Star className="h-4 w-4 mr-2" />Run AI Matching
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-10 gap-3">
            <Loader2 className="h-8 w-8 text-rose-400 animate-spin" />
            <p className="text-sm text-slate-400 animate-pulse">Claude is analyzing volunteers...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-400">{error}</p>
            <Button onClick={handleFindMatch} variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">Try Again</Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-5 w-5" /><span className="text-sm font-semibold">Match Found!</span></div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-white">{result.matched_volunteer.name}</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Top Match</Badge>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{result.matched_volunteer.lat?.toFixed(2)}, {result.matched_volunteer.lng?.toFixed(2)}</p>
                <p className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" />{result.matched_volunteer.skills?.join(", ")}</p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-800/50 border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2"><Quote className="h-4 w-4 text-blue-400" /><span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Claude&apos;s Reasoning</span></div>
              <p className="text-sm text-slate-300 leading-relaxed italic">&ldquo;{result.top_reasoning}&rdquo;</p>
            </div>
            {result.all_matches.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Other Candidates</p>
                <div className="space-y-1">
                  {result.all_matches.slice(1, 4).map((match, idx) => (
                    <div key={match.volunteer_id} className="flex items-center justify-between px-3 py-2 rounded bg-slate-800/30 border border-white/5">
                      <span className="text-xs text-slate-400">#{idx + 2} — {match.volunteer_id.slice(0, 8)}...</span>
                      <span className="text-xs text-slate-500">Score: {match.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={handleClose} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0">
              <CheckCircle2 className="h-4 w-4 mr-2" />Confirm Assignment
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
