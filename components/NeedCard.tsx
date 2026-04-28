"use client";

import { useState, useRef } from "react";
import { Need } from "@/types/database";
import { MapPin, Users, Clock, Volume2, Loader2, Navigation, Search, Pause, Trash2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";

function urgencyColor(score: number) {
  if (score > 75) return "#D93025";
  if (score >= 40) return "#F29900";
  return "#188038";
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
}

export default function NeedCard({ need, selected, onSelect, onFindVolunteer, isAdmin, onDeleted }: NeedCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      console.log('[NeedCard TTS] Response:', { hasAudio: !!data.audio, audioLen: data.audio?.length, error: data.error });
      if (data.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const a = new Audio(audioUrl);
        audioRef.current = a;
        a.onended = () => { setPlaying(false); URL.revokeObjectURL(audioUrl); };
        a.onerror = (e) => { console.error('[NeedCard TTS] Audio play error:', e); setPlaying(false); };
        await a.play();
        setPlaying(true);
        console.log('[NeedCard TTS] ✅ Playing audio');
      } else {
        console.error('[NeedCard TTS] No audio in response:', data.error);
        toast.error(data.error || 'TTS failed');
      }
    } catch (err: any) {
      console.error('[NeedCard TTS] Error:', err);
      toast.error('Text-to-speech failed');
    }
    setTtsLoading(false);
  };

  // Urgency dial SVG
  const dialRadius = 18;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const dialOffset = dialCircumference - (need.urgency_score / 100) * dialCircumference;

  return (
    <div
      className={`bg-white rounded-xl border shadow-md3-1 hover:shadow-md3-2 transition-google overflow-hidden cursor-pointer ${
        selected ? "ring-2 ring-google-blue border-google-blue" : "border-google-grey-200"
      } ${fadeOut ? "opacity-0 scale-95 transition-all duration-300" : ""}`}
      onClick={() => onSelect?.(need)}
      style={{ borderLeftWidth: "4px", borderLeftColor: color }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                {need.need_type}
              </span>
              <span className="text-[10px] text-google-grey-500">{source.emoji} {source.label}</span>
            </div>
            <p className="text-sm font-medium text-google-grey-900 truncate">{need.location_name}</p>
          </div>
          {/* Urgency dial */}
          <div className="relative h-11 w-11 shrink-0">
            <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={dialRadius} fill="none" stroke="#E8EAED" strokeWidth="3" />
              <circle cx="22" cy="22" r={dialRadius} fill="none" stroke={color} strokeWidth="3"
                strokeDasharray={dialCircumference} strokeDashoffset={dialOffset} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color }}>
              {need.urgency_score}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-google-grey-600 line-clamp-2 mb-3">{description}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-google-grey-500 mb-3">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{need.affected_count} {t("affectedPeople").toLowerCase()}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(need.created_at)}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${color}10`, color }}>
            {urgencyLabel(need.urgency_score, t)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleTTS(); }}
            className="h-8 w-8 rounded-full border border-google-grey-200 flex items-center justify-center hover:bg-google-grey-50 transition-google"
            title="Read aloud">
            {ttsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-google-blue" /> :
              playing ? <Pause className="h-3.5 w-3.5 text-google-blue" /> :
              <Volume2 className="h-3.5 w-3.5 text-google-grey-600" />}
          </button>
          {need.lat && need.lng && (
            <a href={`https://www.google.com/maps?q=${need.lat},${need.lng}`} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded-full border border-google-grey-200 flex items-center justify-center hover:bg-google-grey-50 transition-google">
              <Navigation className="h-3.5 w-3.5 text-google-grey-600" />
            </a>
          )}
          {/* Delete button — admin only */}
          {isAdmin && (
            <button onClick={(e) => {
              e.stopPropagation();
              if (need.status !== "pending") {
                toast.error("Cannot delete an assigned need — unassign the volunteer first");
                return;
              }
              setShowDeleteConfirm(true);
            }}
              className="h-8 w-8 rounded-full border border-google-grey-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-google"
              title="Delete need">
              <Trash2 className="h-3.5 w-3.5 text-google-grey-500 hover:text-google-red" />
            </button>
          )}
          {onFindVolunteer && need.status === "pending" && (
            <button onClick={(e) => { e.stopPropagation(); onFindVolunteer(need); }}
              className="ml-auto h-8 px-3 rounded-full bg-google-blue text-white text-[11px] font-medium hover:bg-google-blue-hover transition-google flex items-center gap-1">
              <Search className="h-3 w-3" />{t("findVolunteer")}
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
          <div className="bg-white rounded-xl shadow-md3-4 p-6 max-w-sm mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle className="h-8 w-8 text-google-red mx-auto mb-3" />
            <p className="text-sm text-google-grey-800 text-center font-medium mb-1">Delete this need?</p>
            <p className="text-xs text-google-grey-600 text-center mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-google-grey-300 rounded-full text-sm text-google-grey-700 hover:bg-google-grey-50 transition-google">
                Cancel
              </button>
              <button disabled={deleting} onClick={async () => {
                setDeleting(true);
                try {
                  const res = await fetch("/api/needs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: need.id }) });
                  if (res.ok) {
                    setShowDeleteConfirm(false);
                    setFadeOut(true);
                    setTimeout(() => onDeleted?.(), 300);
                    toast.success("Need deleted");
                  } else {
                    const d = await res.json();
                    toast.error(d.error || "Delete failed");
                  }
                } catch { toast.error("Delete failed"); }
                setDeleting(false);
              }}
                className="flex-1 py-2.5 bg-google-red text-white rounded-full text-sm font-medium hover:opacity-90 transition-google disabled:opacity-60 flex items-center justify-center gap-1">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
