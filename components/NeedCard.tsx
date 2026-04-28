"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Need, Volunteer } from "@/types/database";
import { MapPin, Users, Clock, Volume2, Loader2, Navigation, Search, Pause, Trash2, AlertTriangle, Phone, Mail, CheckCircle2, UserCircle, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";

function urgencyColor(score: number) {
  if (score > 75) return "var(--brand-red)";
  if (score >= 40) return "var(--brand-amber)";
  return "var(--brand-green)";
}

function urgencyLabel(score: number, t: (k: string) => string) {
  if (score > 75) return t("critical");
  if (score >= 40) return t("moderate");
  return t("low");
}

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const SOURCE_BADGES: Record<string, { emoji: string; label: string }> = {
  whatsapp: { emoji: "📱", label: "WhatsApp" },
  voice: { emoji: "🎤", label: "Voice" },
  ocr: { emoji: "📷", label: "OCR" },
  web: { emoji: "⌨️", label: "Manual" },
};

interface NeedCardProps {
  need: Need;
  selected?: boolean;
  onSelect?: (need: Need) => void;
  onFindVolunteer?: (need: Need) => void;
  isAdmin?: boolean;
  onDeleted?: () => void;
  volunteers?: Volunteer[];
}

export default function NeedCard({ need, selected, onSelect, onFindVolunteer, isAdmin, onDeleted, volunteers = [] }: NeedCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVolunteerDetail, setShowVolunteerDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const { language, t } = useLanguage();
  const [ttsLoading, setTtsLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const color = urgencyColor(need.urgency_score);
  const description = (language !== "en" && need.translated_text?.[language])
    ? need.translated_text[language]
    : need.description;
  const source = SOURCE_BADGES[need.source] || SOURCE_BADGES.web;

  // Find assigned volunteer
  const assignedVolunteer = need.assigned_volunteer_id
    ? volunteers.find((v) => v.id === need.assigned_volunteer_id) || null
    : null;

  const handleTTS = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    setTtsLoading(true);
    try {
      const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN" };
      const ttsText = `${need.need_type} in ${need.location_name}. ${description}. ${need.affected_count} people affected.`;
      console.log('[NeedCard TTS] Requesting:', ttsText.substring(0, 60));
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText, languageCode: langMap[language] || "en-IN" }),
      });
      const data = await res.json();
      if (data.audio) {
        const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const a = new Audio(audioUrl);
        audioRef.current = a;
        a.onended = () => { setPlaying(false); URL.revokeObjectURL(audioUrl); };
        a.onerror = () => setPlaying(false);
        await a.play();
        setPlaying(true);
      } else {
        toast.error(data.error || 'TTS failed');
      }
    } catch {
      toast.error('Text-to-speech failed');
    }
    setTtsLoading(false);
  };

  const dialRadius = 18;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const dialOffset = dialCircumference - (need.urgency_score / 100) * dialCircumference;

  return (
    <div
      className={`glass-card rounded-xl transition-google overflow-hidden cursor-pointer ${
        selected ? "ring-2 ring-primary border-primary/50" : ""
      } ${fadeOut ? "opacity-0 scale-95 transition-all duration-300" : ""}`}
      onClick={() => onSelect?.(need)}
      style={{ borderLeftWidth: "4px", borderLeftColor: color }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>{need.need_type}</span>
              <span className="text-[10px] text-muted-foreground">{source.emoji} {source.label}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{need.location_name}</p>
          </div>
          <div className="relative h-11 w-11 shrink-0">
            <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={dialRadius} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle cx="22" cy="22" r={dialRadius} fill="none" stroke={color} strokeWidth="3"
                strokeDasharray={dialCircumference} strokeDashoffset={dialOffset} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color }}>{need.urgency_score}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{description}</p>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{need.affected_count} {t("affectedPeople").toLowerCase()}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(need.created_at)}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `color-mix(in srgb, ${color} 8%, transparent)`, color }}>{urgencyLabel(need.urgency_score, t)}</span>
        </div>

        {/* Assigned Volunteer Badge */}
        {need.status === "assigned" && assignedVolunteer && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowVolunteerDetail(true); }}
            className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-google group"
          >
            <div className="h-7 w-7 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center shrink-0 group-hover:scale-110 transition-google">
              <UserCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{assignedVolunteer.name}</p>
              <p className="text-[10px] text-muted-foreground">Assigned volunteer · Tap for details</p>
            </div>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
          </button>
        )}

        {/* Assigned but volunteer not found in local data */}
        {need.status === "assigned" && !assignedVolunteer && need.assigned_volunteer_id && (
          <div className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30">
            <UserCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400">Volunteer assigned (loading...)</p>
          </div>
        )}

        {/* Resolved badge */}
        {need.status === "resolved" && (
          <div className="w-full mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700/30">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-[11px] text-green-700 dark:text-green-400 font-medium">Resolved</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleTTS(); }}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google" title="Read aloud">
            {ttsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> :
              playing ? <Pause className="h-3.5 w-3.5 text-primary" /> :
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          {need.lat && need.lng && (
            <a href={`https://www.google.com/maps?q=${need.lat},${need.lng}`} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google">
              <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )}
          {isAdmin && (
            <button onClick={(e) => {
              e.stopPropagation();
              if (need.status !== "pending") { toast.error("Cannot delete an assigned need"); return; }
              setShowDeleteConfirm(true);
            }}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-google" title="Delete">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {onFindVolunteer && need.status === "pending" && (
            <button onClick={(e) => { e.stopPropagation(); onFindVolunteer(need); }}
              className="ml-auto h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 transition-google flex items-center gap-1">
              <Search className="h-3 w-3" />{t("findVolunteer")}
            </button>
          )}
        </div>
      </div>

      {/* Portal-rendered modals */}
      {showDeleteConfirm && (
        <DeleteModal need={need} deleting={deleting} setDeleting={setDeleting}
          onClose={() => setShowDeleteConfirm(false)}
          onDeleted={() => { setFadeOut(true); setTimeout(() => onDeleted?.(), 300); }} />
      )}
      {showVolunteerDetail && assignedVolunteer && (
        <VolunteerDetailModal volunteer={assignedVolunteer}
          onClose={() => setShowVolunteerDetail(false)} t={t} />
      )}
    </div>
  );
}

/* ─── Portal-rendered Modals (extracted to avoid overflow clipping) ─── */

function DeleteModal({ need, deleting, setDeleting, onClose, onDeleted }: {
  need: Need; deleting: boolean; setDeleting: (v: boolean) => void; onClose: () => void; onDeleted?: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-md3-4 border border-border p-6 max-w-sm mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <p className="text-sm text-foreground text-center font-medium mb-1">Delete this need?</p>
        <p className="text-xs text-muted-foreground text-center mb-4">This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-google">Cancel</button>
          <button disabled={deleting} onClick={async () => {
            setDeleting(true);
            try {
              const res = await fetch("/api/needs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: need.id }) });
              if (res.ok) { onClose(); onDeleted?.(); toast.success("Need deleted"); }
              else { const d = await res.json(); toast.error(d.error || "Delete failed"); }
            } catch { toast.error("Delete failed"); }
            setDeleting(false);
          }}
            className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-google disabled:opacity-60 flex items-center justify-center gap-1">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function VolunteerDetailModal({ volunteer, onClose, t }: {
  volunteer: Volunteer; onClose: () => void; t: (k: string) => string;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-md3-4 border border-border w-full max-w-sm mx-4 max-h-[85vh] flex flex-col animate-fade-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-primary/5 dark:bg-primary/10 px-6 pt-6 pb-4 text-center relative shrink-0">
          <button onClick={onClose} className="absolute top-3 right-3 h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-google">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="h-16 w-16 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center mx-auto mb-3">
            <UserCircle className="h-9 w-9 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{volunteer.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">Assigned to this need</p>
        </div>

        {/* Scrollable Details */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p>
              <a href={`tel:${volunteer.phone}`} className="text-sm font-medium text-foreground hover:text-primary transition-google truncate block">
                {volunteer.phone}
              </a>
            </div>
          </div>

          {/* Email */}
          {volunteer.email && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p>
                <a href={`mailto:${volunteer.email}`} className="text-sm font-medium text-foreground hover:text-primary transition-google truncate block">
                  {volunteer.email}
                </a>
              </div>
            </div>
          )}

          {/* Location */}
          {volunteer.location_name && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-foreground truncate">{volunteer.location_name}</p>
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {volunteer.skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-lg bg-primary/8 dark:bg-primary/15 text-[11px] font-medium text-primary border border-primary/15">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl bg-muted p-3 text-center">
              <p className="text-lg font-bold text-foreground">{volunteer.active_task_count}</p>
              <p className="text-[10px] text-muted-foreground">Active Tasks</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-center">
              <p className="text-lg font-bold text-foreground">{volunteer.completed_tasks || 0}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 pt-1">
            <span className={`h-2 w-2 rounded-full ${volunteer.is_available ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-xs text-muted-foreground">
              {volunteer.is_available ? t("available") : t("busy")}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`tel:${volunteer.phone}`, "_self"); }}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-google flex items-center justify-center gap-2">
            <Phone className="h-4 w-4" />Call
          </button>
          {volunteer.email && (
            <button
              onClick={(e) => { e.stopPropagation(); window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(volunteer.email!)}`, "_blank"); }}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-google flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />Email
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
