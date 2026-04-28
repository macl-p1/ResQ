"use client";

import { useState } from "react";
import { Keyboard, Mic, Camera, Sparkles, Loader2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import VoiceRecorder from "@/components/VoiceRecorder";
import ImageUploader from "@/components/ImageUploader";
import NeedVerificationModal from "@/components/NeedVerificationModal";
import toast from "react-hot-toast";

type Tab = "type" | "voice" | "photo";

interface IngestFormProps {
  onIngested?: () => void;
  onClose?: () => void;
}

interface ExtractionData {
  need_type: string;
  location_name: string;
  urgency_score: number;
  affected_count: number;
  description: string;
  lat?: number;
  lng?: number;
}

export default function IngestForm({ onIngested, onClose }: IngestFormProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("type");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [saving, setSaving] = useState(false);

  const tabs: { id: Tab; label: string; icon: typeof Keyboard }[] = [
    { id: "type", label: t("typeReport"), icon: Keyboard },
    { id: "voice", label: t("voiceReport"), icon: Mic },
    { id: "photo", label: t("photoReport"), icon: Camera },
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source: tab === "voice" ? "voice" : tab === "photo" ? "ocr" : "web", dryRun: true }),
      });
      if (!res.ok) throw new Error("Failed to analyze");
      const data = await res.json();
      setExtraction(data.extraction || data.need);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async (data: ExtractionData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          source: tab === "voice" ? "voice" : tab === "photo" ? "ocr" : "web",
          lat: data.lat,
          lng: data.lng,
          location_name: data.location_name,
          affected_count: data.affected_count,
          need_type: data.need_type,
          urgency_score: data.urgency_score,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(t("reportSaved"));
      setText("");
      setExtraction(null);
      onIngested?.();
    } catch {
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-google-grey-900 font-display flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-google-blue" />
            {t("reportNeed")}
          </h3>
          {onClose && (
            <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-google-grey-100 flex items-center justify-center transition-google">
              <X className="h-4 w-4 text-google-grey-600" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-google-grey-100 rounded-xl p-1 gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-google ${
                tab === id ? "bg-white text-google-blue shadow-md3-1" : "text-google-grey-600 hover:text-google-grey-800"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "type" && (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the emergency… e.g. 'Flooding in Andheri East, 200 families stranded'"
              className="w-full border border-google-grey-300 rounded-xl px-4 py-3 text-sm text-google-grey-900 placeholder:text-google-grey-400 resize-none min-h-[100px] focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-google"
            />
            <button onClick={handleAnalyze} disabled={loading || !text.trim()}
              className="w-full btn-google-primary disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? t("analyzing") : t("analyzeWithAI")}
            </button>
          </div>
        )}

        {tab === "voice" && (
          <VoiceRecorder onTranscript={(transcript) => { setText(transcript); setTab("type"); }} />
        )}

        {tab === "photo" && (
          <ImageUploader onExtractedText={(extracted) => { setText(extracted); setTab("type"); }} />
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-google-red">{error}</div>
        )}
      </div>

      {/* Verification Modal */}
      {extraction && (
        <NeedVerificationModal
          extraction={extraction}
          rawText={text}
          onConfirm={handleConfirmSave}
          onCancel={() => setExtraction(null)}
          loading={saving}
        />
      )}
    </>
  );
}
