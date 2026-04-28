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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="glass-card rounded-2xl p-8">
            <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-foreground font-display mb-2">Thank you!</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Your report has been received and logged. A coordinator will review it shortly.
            </p>
            <div className="bg-muted rounded-xl px-4 py-3 mb-6 border border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Reference ID</p>
              <p className="text-lg font-bold text-primary font-mono">{refId}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSubmitted(false); setText(""); setRefId(""); }}
                className="flex-1 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-google">
                Report Another
              </button>
              <Link href="/" className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium text-center hover:opacity-90 transition-google">
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
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Back + Logo */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
            <ResQLogo size="sm" />
          </div>

          {/* Header */}
          <div className="glass-card rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-[var(--brand-red)] flex items-center justify-center shadow-glow-red">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground font-display">Report an Emergency</h1>
                <p className="text-xs text-muted-foreground">No login required — your report is anonymous</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-6">
            {/* Tabs */}
            <div className="flex bg-muted rounded-xl p-1 gap-1 mb-4 border border-border">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-google ${
                    tab === id ? "bg-card text-primary shadow-md3-1" : "text-muted-foreground hover:text-foreground"
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
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none min-h-[120px] focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-google"
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
              <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>
            )}
          </div>

          {/* Info */}
          <p className="text-center text-[10px] text-muted-foreground/60 mt-4">
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
