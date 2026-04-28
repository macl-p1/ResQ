"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Minus, Plus, AlertTriangle, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ExtractionData { need_type: string; location_name: string; urgency_score: number; affected_count: number; description: string; lat?: number; lng?: number; }
interface Props { extraction: ExtractionData; rawText: string; onConfirm: (data: ExtractionData) => void; onCancel: () => void; loading?: boolean; }

const SEVERITY_LEVELS = [
  { label: "Low", score: 20, emoji: "🟢", desc: "Minor issue, can wait", color: "var(--brand-green)", bgClass: "bg-green-50 dark:bg-emerald-950/40", borderClass: "border-green-300 dark:border-emerald-800", textClass: "text-green-700 dark:text-emerald-400" },
  { label: "Moderate", score: 40, emoji: "🟡", desc: "Needs attention soon", color: "var(--brand-amber)", bgClass: "bg-yellow-50 dark:bg-amber-950/40", borderClass: "border-yellow-300 dark:border-amber-800", textClass: "text-yellow-700 dark:text-amber-400" },
  { label: "High", score: 60, emoji: "🟠", desc: "Urgent, people at risk", color: "#E8710A", bgClass: "bg-orange-50 dark:bg-orange-950/40", borderClass: "border-orange-300 dark:border-orange-800", textClass: "text-orange-700 dark:text-orange-400" },
  { label: "Critical", score: 80, emoji: "🔴", desc: "Emergency response needed", color: "var(--brand-red)", bgClass: "bg-red-50 dark:bg-red-950/40", borderClass: "border-red-300 dark:border-red-800", textClass: "text-red-700 dark:text-red-400" },
  { label: "Extreme", score: 100, emoji: "🆘", desc: "Life threatening NOW", color: "#7B0000", bgClass: "bg-red-100 dark:bg-red-950/60", borderClass: "border-red-400 dark:border-red-700", textClass: "text-red-900 dark:text-red-300" },
];
const NEED_TYPES = ["Food","Water","Medical","Shelter","Rescue","Sanitation","Education","Logistics"];

export default function NeedVerificationModal({ extraction, rawText, onConfirm, onCancel, loading }: Props) {
  const { t } = useLanguage();
  const [data, setData] = useState<ExtractionData>({ ...extraction, urgency_score: 0 });
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [severityError, setSeverityError] = useState(false);
  const selectedSeverity = SEVERITY_LEVELS.find((s) => s.score === data.urgency_score) || null;
  const handleClose = useCallback(() => setShowCloseConfirm(true), []);
  const handleBackdropClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget) handleClose(); };
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4" onClick={handleBackdropClick}>
      <div className="bg-card border border-border rounded-2xl shadow-md3-4 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div><h2 className="text-lg font-bold text-foreground font-display">{t("verifyReport")}</h2><p className="text-xs text-muted-foreground mt-0.5">Gemini AI extracted — please confirm or correct:</p></div>
          <button onClick={handleClose} className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center transition-google"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-5">
          {/* Affected People */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">{t("affectedPeople")}</label>
            <p className="text-[10px] text-muted-foreground/60 mb-2">AI detected: {extraction.affected_count} people</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setData({...data, affected_count: Math.max(0, data.affected_count-10)})} className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google"><Minus className="h-4 w-4 text-muted-foreground" /></button>
              <input type="number" value={data.affected_count} onChange={(e) => setData({...data, affected_count: parseInt(e.target.value)||0})} className="w-24 text-center text-2xl font-bold text-foreground bg-card border border-border rounded-lg py-2" />
              <button onClick={() => setData({...data, affected_count: data.affected_count+10})} className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google"><Plus className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <input type="range" min={0} max={10000} step={10} value={data.affected_count} onChange={(e) => setData({...data, affected_count: parseInt(e.target.value)})} className="w-full mt-2 accent-[var(--brand-blue)]" />
          </div>
          {/* Severity */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">{t("severity")} <span className="text-destructive">*</span></label>
            <p className="text-[10px] text-muted-foreground/60 mb-3">Select severity — determines dispatch priority</p>
            <div className="space-y-2">
              {SEVERITY_LEVELS.map((s) => {
                const isSel = data.urgency_score === s.score;
                return (<button key={s.label} onClick={() => { setData({...data, urgency_score: s.score}); setSeverityError(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-google ${isSel ? `${s.bgClass} ${s.borderClass} ring-2 ring-offset-1 ring-offset-card` : "bg-card border-border hover:bg-muted"}`}>
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1"><p className={`text-sm font-semibold ${isSel ? s.textClass : "text-foreground"}`}>{s.label} <span className="text-xs font-normal text-muted-foreground">(score: {s.score})</span></p><p className="text-[11px] text-muted-foreground">{s.desc}</p></div>
                  {isSel && <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: s.color }} />}
                </button>);
              })}
            </div>
            {severityError && <p className="mt-2 text-xs text-destructive font-medium">⚠️ Please select a severity level</p>}
          </div>
          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block"><MapPin className="h-3 w-3 inline mr-1" />{t("location")}</label>
            <input value={data.location_name} onChange={(e) => setData({...data, location_name: e.target.value})} className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-google" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input type="number" step="0.000001" value={data.lat||""} placeholder="Latitude" onChange={(e) => setData({...data, lat: parseFloat(e.target.value)})} className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary outline-none" />
              <input type="number" step="0.000001" value={data.lng||""} placeholder="Longitude" onChange={(e) => setData({...data, lng: parseFloat(e.target.value)})} className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary outline-none" />
            </div>
          </div>
          {/* Need Type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">{t("needType")}</label>
            <div className="flex flex-wrap gap-2">
              {NEED_TYPES.map((type) => (<button key={type} onClick={() => setData({...data, need_type: type})}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-google ${data.need_type === type ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-muted"}`}>{type}</button>))}
            </div>
          </div>
          {/* Summary */}
          {selectedSeverity && <div className="bg-muted rounded-lg p-3 border border-border">
            <p className="text-xs text-foreground">This will log a <span className="font-bold" style={{ color: selectedSeverity.color }}>{selectedSeverity.label}</span> need affecting <span className="font-bold">{data.affected_count}</span> people in <span className="font-bold">{data.location_name}</span></p>
          </div>}
        </div>
        <div className="p-5 border-t border-border flex gap-3">
          <button onClick={handleClose} className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-google">{t("editMore")}</button>
          <button onClick={() => { if (data.urgency_score === 0) { setSeverityError(true); return; } onConfirm(data); }} disabled={loading}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-google disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{t("confirmSubmit")}
          </button>
        </div>
      </div>
      {showCloseConfirm && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowCloseConfirm(false)}>
        <div className="bg-card rounded-xl shadow-md3-4 border border-border p-6 max-w-sm mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <p className="text-sm text-foreground text-center font-medium mb-4">{t("confirmClose")}</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCloseConfirm(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-google">{t("cancel")}</button>
            <button onClick={onCancel} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-google">Discard</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
