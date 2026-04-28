"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Keyboard, Mic, Camera, Sparkles, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import ImageUploader from "@/components/ImageUploader";
import NeedVerificationModal from "@/components/NeedVerificationModal";
import ResQLogo from "@/components/ResQLogo";
import Link from "next/link";
import toast from "react-hot-toast";

type Tab = "type" | "voice" | "photo";

interface ExtractionData {
  need_type: string;
  location_name: string;
  urgency_score: number;
  affected_count: number;
  description: string;
  lat?: number;
  lng?: number;
}

export default function PublicReportPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("type");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");

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
        body: JSON.stringify({ text, source: "public", dryRun: true }),
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
          source: "public",
          lat: data.lat,
          lng: data.lng,
          location_name: data.location_name,
          affected_count: data.affected_count,
          need_type: data.need_type,
          urgency_score: data.urgency_score,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const result = await res.json();
      setRefId(result.need?.id || result.id || "N/A");
      setSubmitted(true);
      setExtraction(null);
      toast.success("Report submitted successfully!");
    } catch {
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-md3-2 border border-google-grey-200 p-8">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-google-green" />
            </div>
            <h1 className="text-xl font-bold text-google-grey-900 font-display mb-2">Thank you!</h1>
            <p className="text-sm text-google-grey-600 mb-4">
              Your report has been received and logged. A coordinator will review it shortly.
            </p>
            <div className="bg-google-grey-50 rounded-xl px-4 py-3 mb-6">
              <p className="text-[10px] text-google-grey-500 uppercase tracking-wide">Reference ID</p>
              <p className="text-lg font-bold text-google-blue font-mono">{refId}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSubmitted(false); setText(""); setRefId(""); }}
                className="flex-1 py-3 border border-google-grey-300 rounded-full text-sm font-medium text-google-grey-700 hover:bg-google-grey-50 transition-google">
                Report Another
              </button>
              <Link href="/" className="flex-1 py-3 bg-google-blue text-white rounded-full text-sm font-medium text-center hover:bg-google-blue-hover transition-google">
                Back Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8F9FA] px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Back + Logo */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="h-9 w-9 rounded-full border border-google-grey-200 flex items-center justify-center hover:bg-white transition-google">
              <ArrowLeft className="h-4 w-4 text-google-grey-600" />
            </Link>
            <ResQLogo size="sm" />
          </div>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-md3-2 border border-google-grey-200 p-6 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-google-red flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-google-grey-900 font-display">Report an Emergency</h1>
                <p className="text-xs text-google-grey-600">No login required — your report is anonymous</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-md3-1 border border-google-grey-200 p-6">
            {/* Tabs */}
            <div className="flex bg-google-grey-100 rounded-xl p-1 gap-1 mb-4">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-google ${
                    tab === id ? "bg-white text-google-blue shadow-md3-1" : "text-google-grey-600 hover:text-google-grey-800"
                  }`}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "type" && (
              <div className="space-y-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the emergency… e.g. 'Flooding in Andheri East, 200 families stranded, need food and medical supplies urgently'"
                  className="w-full border border-google-grey-300 rounded-xl px-4 py-3 text-sm text-google-grey-900 placeholder:text-google-grey-400 resize-none min-h-[120px] focus:border-google-blue focus:ring-1 focus:ring-google-blue outline-none transition-google"
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
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-google-red">{error}</div>
            )}
          </div>

          {/* Info */}
          <p className="text-center text-[10px] text-google-grey-500 mt-4">
            Your report will be reviewed by a coordinator. Gemini AI extracts key details automatically.
          </p>
        </div>
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
