"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Minus, Plus, AlertTriangle, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ExtractionData {
  need_type: string;
  location_name: string;
  urgency_score: number;
  affected_count: number;
  description: string;
  lat?: number;
  lng?: number;
}

interface NeedVerificationModalProps {
  extraction: ExtractionData;
  rawText: string;
  onConfirm: (data: ExtractionData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const SEVERITY_LEVELS = [
  { label: "Low", score: 20, emoji: "🟢", desc: "Minor issue, can wait", color: "#188038", bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
  { label: "Moderate", score: 40, emoji: "🟡", desc: "Needs attention soon", color: "#F29900", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700" },
  { label: "High", score: 60, emoji: "🟠", desc: "Urgent, people at risk", color: "#E8710A", bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
  { label: "Critical", score: 80, emoji: "🔴", desc: "Emergency response needed", color: "#D93025", bg: "bg-red-50", border: "border-red-300", text: "text-red-700" },
  { label: "Extreme", score: 100, emoji: "🆘", desc: "Life threatening NOW", color: "#7B0000", bg: "bg-red-100", border: "border-red-400", text: "text-red-900" },
];

const NEED_TYPES = ["Food", "Water", "Medical", "Shelter", "Rescue", "Sanitation", "Education", "Logistics"];

export default function NeedVerificationModal({ extraction, rawText, onConfirm, onCancel, loading }: NeedVerificationModalProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<ExtractionData>({ ...extraction, urgency_score: 0 });
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [severityError, setSeverityError] = useState(false);

  const selectedSeverity = SEVERITY_LEVELS.find((s) => s.score === data.urgency_score) || null;

  const handleClose = useCallback(() => {
    setShowCloseConfirm(true);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-md3-4 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-google-grey-200">
          <div>
            <h2 className="text-lg font-bold text-google-grey-900 font-display">{t("verifyReport")}</h2>
            <p className="text-xs text-google-grey-600 mt-0.5">Gemini AI extracted the following — please confirm or correct:</p>
          </div>
          <button onClick={handleClose} className="h-9 w-9 rounded-full hover:bg-google-grey-100 flex items-center justify-center transition-google">
            <X className="h-5 w-5 text-google-grey-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Affected People */}
          <div>
            <label className="text-xs font-semibold text-google-grey-700 uppercase tracking-wide mb-2 block">
              {t("affectedPeople")}
            </label>
            <p className="text-[10px] text-google-grey-500 mb-2">AI detected: {extraction.affected_count} people</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setData({ ...data, affected_count: Math.max(0, data.affected_count - 10) })}
                className="h-10 w-10 rounded-full border border-google-grey-300 flex items-center justify-center hover:bg-google-grey-50 transition-google">
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={data.affected_count}
                onChange={(e) => setData({ ...data, affected_count: parseInt(e.target.value) || 0 })}
                className="w-24 text-center text-2xl font-bold text-google-grey-900 border border-google-grey-300 rounded-lg py-2"
              />
              <button onClick={() => setData({ ...data, affected_count: data.affected_count + 10 })}
                className="h-10 w-10 rounded-full border border-google-grey-300 flex items-center justify-center hover:bg-google-grey-50 transition-google">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <input type="range" min={0} max={10000} step={10} value={data.affected_count}
              onChange={(e) => setData({ ...data, affected_count: parseInt(e.target.value) })}
              className="w-full mt-2 accent-google-blue" />
          </div>

          {/* Severity — MANUAL SELECTION REQUIRED */}
          <div>
            <label className="text-xs font-semibold text-google-grey-700 uppercase tracking-wide mb-2 block">
              {t("severity")} <span className="text-google-red">*</span>
            </label>
            <p className="text-[10px] text-google-grey-500 mb-3">Select the severity level — this determines volunteer dispatch priority</p>
            <div className="space-y-2">
              {SEVERITY_LEVELS.map((s) => {
                const isSelected = data.urgency_score === s.score;
                return (
                  <button
                    key={s.label}
                    onClick={() => { setData({ ...data, urgency_score: s.score }); setSeverityError(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-google ${
                      isSelected
                        ? `${s.bg} ${s.border} ring-2 ring-offset-1`
                        : "bg-white border-google-grey-200 hover:bg-google-grey-50"
                    }`}
                    style={isSelected ? { ringColor: s.color } : {}}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isSelected ? s.text : "text-google-grey-800"}`}>
                        {s.label} <span className="text-xs font-normal text-google-grey-500">(score: {s.score})</span>
                      </p>
                      <p className="text-[11px] text-google-grey-600">{s.desc}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: s.color }} />
                    )}
                  </button>
                );
              })}
            </div>
            {severityError && (
              <p className="mt-2 text-xs text-google-red font-medium">⚠️ Please select a severity level to continue</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-google-grey-700 uppercase tracking-wide mb-2 block">
              <MapPin className="h-3 w-3 inline mr-1" />{t("location")}
            </label>
            <input value={data.location_name} onChange={(e) => setData({ ...data, location_name: e.target.value })}
              className="w-full border border-google-grey-300 rounded-lg px-3 py-2.5 text-sm text-google-grey-900" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input type="number" step="0.000001" value={data.lat || ""} placeholder="Latitude"
                onChange={(e) => setData({ ...data, lat: parseFloat(e.target.value) })}
                className="border border-google-grey-300 rounded-lg px-3 py-2 text-xs text-google-grey-700" />
              <input type="number" step="0.000001" value={data.lng || ""} placeholder="Longitude"
                onChange={(e) => setData({ ...data, lng: parseFloat(e.target.value) })}
                className="border border-google-grey-300 rounded-lg px-3 py-2 text-xs text-google-grey-700" />
            </div>
          </div>

          {/* Need Type Pills */}
          <div>
            <label className="text-xs font-semibold text-google-grey-700 uppercase tracking-wide mb-2 block">{t("needType")}</label>
            <div className="flex flex-wrap gap-2">
              {NEED_TYPES.map((type) => (
                <button key={type} onClick={() => setData({ ...data, need_type: type })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-google ${
                    data.need_type === type ? "bg-google-blue text-white border-google-blue" : "bg-white border-google-grey-300 text-google-grey-700 hover:bg-google-grey-50"
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedSeverity && (
            <div className="bg-google-grey-50 rounded-lg p-3 border border-google-grey-200">
              <p className="text-xs text-google-grey-700">
                This will log a <span className="font-bold" style={{ color: selectedSeverity.color }}>{selectedSeverity.label}</span> need
                affecting <span className="font-bold">{data.affected_count}</span> people
                in <span className="font-bold">{data.location_name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-google-grey-200 flex gap-3">
          <button onClick={handleClose}
            className="flex-1 py-3 border border-google-grey-300 rounded-full text-sm font-medium text-google-grey-700 hover:bg-google-grey-50 transition-google">
            {t("editMore")}
          </button>
          <button onClick={() => {
            if (data.urgency_score === 0) {
              setSeverityError(true);
              return;
            }
            onConfirm(data);
          }} disabled={loading}
            className="flex-1 py-3 bg-google-blue text-white rounded-full text-sm font-semibold hover:bg-google-blue-hover transition-google disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t("confirmSubmit")}
          </button>
        </div>
      </div>

      {/* Close confirmation dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowCloseConfirm(false)}>
          <div className="bg-white rounded-xl shadow-md3-4 p-6 max-w-sm mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle className="h-8 w-8 text-google-yellow mx-auto mb-3" />
            <p className="text-sm text-google-grey-800 text-center font-medium mb-4">{t("confirmClose")}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCloseConfirm(false)}
                className="flex-1 py-2.5 border border-google-grey-300 rounded-full text-sm text-google-grey-700 hover:bg-google-grey-50 transition-google">
                {t("cancel")}
              </button>
              <button onClick={onCancel}
                className="flex-1 py-2.5 bg-google-red text-white rounded-full text-sm font-medium hover:opacity-90 transition-google">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
