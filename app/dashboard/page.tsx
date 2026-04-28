"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Need, Volunteer } from "@/types/database";
import NeedCard from "@/components/NeedCard";
import IngestForm from "@/components/IngestForm";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Users, CheckCircle2, Clock, Plus, X } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
const VolunteerMatchModal = dynamic(() => import("@/components/VolunteerMatchModal"), { ssr: false });

type Language = "en" | "hi" | "ta" | "te" | "bn";

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [matchNeed, setMatchNeed] = useState<Need | null>(null);
  const [showIngest, setShowIngest] = useState(false);

  const fetchNeeds = useCallback(async () => {
    try {
      const r = await fetch("/api/needs");
      if (r.ok) {
        const incoming: Need[] = await r.json();
        setNeeds((prev) => {
          const merged = incoming.map((n) => {
            const existing = prev.find((p) => p.id === n.id);
            return existing?.translated_text ? { ...n, translated_text: { ...n.translated_text, ...existing.translated_text } } : n;
          });
          return merged;
        });
      }
    } catch { /* */ }
  }, []);

  const fetchVolunteers = useCallback(async () => {
    try { const r = await fetch("/api/volunteers"); if (r.ok) setVolunteers(await r.json()); } catch { /* */ }
  }, []);

  // Translate needs when language changes
  useEffect(() => {
    if (language === "en") return;
    const untranslated = needs.filter((n) => !n.translated_text?.[language]);
    if (untranslated.length === 0) return;

    let cancelled = false;
    (async () => {
      const updated = [...needs];
      for (let i = 0; i < updated.length; i++) {
        if (cancelled) break;
        const n = updated[i];
        if (n.translated_text?.[language]) continue;
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: n.description, targetLang: language }),
          });
          if (res.ok) {
            const { translatedText } = await res.json();
            updated[i] = { ...n, translated_text: { ...n.translated_text, [language]: translatedText } };
          }
        } catch { /* */ }
      }
      if (!cancelled) setNeeds(updated);
    })();
    return () => { cancelled = true; };
  }, [language, needs.length]);

  useEffect(() => {
    fetchNeeds();
    fetchVolunteers();
    const iv = setInterval(fetchNeeds, 5000);
    return () => clearInterval(iv);
  }, [fetchNeeds, fetchVolunteers]);

  const criticalCount = needs.filter((n) => n.urgency_score > 75 && n.status === "pending").length;
  const resolvedCount = needs.filter((n) => n.status === "resolved").length;
  const availableVols = volunteers.filter((v) => v.is_available).length;

  const stats = [
    { label: t("totalNeeds"), value: needs.length, icon: AlertTriangle, color: "text-google-red", bg: "bg-red-50" },
    { label: t("criticalNeeds"), value: criticalCount, icon: Clock, color: "text-google-yellow", bg: "bg-yellow-50" },
    { label: t("volunteersAvailable"), value: availableVols, icon: Users, color: "text-google-blue", bg: "bg-blue-50" },
    { label: t("tasksCompleted"), value: resolvedCount, icon: CheckCircle2, color: "text-google-green", bg: "bg-green-50" },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-[#F8F9FA]">
      {/* Left Panel */}
      <div className="w-full md:w-[420px] flex flex-col border-r border-google-grey-200 bg-white">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-google-grey-200">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
              <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
              <p className={`text-lg font-bold ${color} animate-count-up`}>{value}</p>
              <p className="text-[9px] text-google-grey-600 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Feed Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-google-grey-100">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-google-red rounded-full animate-pulse" />
            <h2 className="text-sm font-semibold text-google-grey-900">{t("liveCrisisFeed")}</h2>
          </div>
          <span className="text-[10px] text-google-grey-500">{needs.length} {t("needs").toLowerCase()}</span>
        </div>

        {/* Need Cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          <AnimatePresence>
            {needs.map((need, i) => (
              <motion.div
                key={need.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <NeedCard
                  need={need}
                  selected={selectedNeed?.id === need.id}
                  onSelect={setSelectedNeed}
                  onFindVolunteer={setMatchNeed}
                  isAdmin={true}
                  onDeleted={fetchNeeds}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {needs.length === 0 && (
            <div className="text-center py-16 text-google-grey-500 text-sm">No needs reported yet</div>
          )}
        </div>

        {/* Report Button / Form */}
        <div className="border-t border-google-grey-200 p-3">
          {showIngest ? (
            <div className="bg-google-grey-50 rounded-xl border border-google-grey-200 p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <IngestForm onIngested={() => { fetchNeeds(); setShowIngest(false); }} onClose={() => setShowIngest(false)} />
            </div>
          ) : (
            <button onClick={() => setShowIngest(true)}
              className="w-full btn-google-primary gap-2">
              <Plus className="h-4 w-4" />
              {t("reportNeed")}
            </button>
          )}
        </div>
      </div>

      {/* Right: Map */}
      <div className="flex-1 min-h-[300px]">
        <MapView needs={needs} selectedNeed={selectedNeed} onSelectNeed={setSelectedNeed} />
      </div>

      {/* Volunteer Match Modal */}
      {matchNeed && (
        <VolunteerMatchModal
          need={matchNeed}
          onClose={() => { setMatchNeed(null); fetchNeeds(); fetchVolunteers(); }}
        />
      )}
    </div>
  );
}
