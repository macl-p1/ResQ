"use client";

import { useEffect, useState } from "react";
import { AnalyticsData } from "@/types/database";
import { BarChart3, Users, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const NEED_TYPE_COLORS: Record<string, string> = {
  Rescue: "#D93025", Medical: "#D93025", Food: "#F29900", Water: "#1A73E8",
  Shelter: "#F29900", Clothing: "#8E24AA", Sanitation: "#188038",
  Education: "#1A73E8", Infrastructure: "#5F6368", Other: "#80868B",
};

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8F9FA]">
      <div className="h-10 w-10 rounded-full border-4 border-google-blue/20 border-t-google-blue animate-spin" />
    </div>
  );

  const maxType = Math.max(...Object.values(data.needs_by_type), 1);
  const total = data.total_needs || 1;

  const statCards = [
    { label: t("totalNeeds"), value: data.total_needs, icon: AlertTriangle, color: "text-google-red", bg: "bg-red-50" },
    { label: t("tasksCompleted"), value: data.resolved_needs, icon: CheckCircle2, color: "text-google-green", bg: "bg-green-50" },
    { label: t("volunteersAvailable"), value: data.active_volunteers, icon: Users, color: "text-google-blue", bg: "bg-blue-50" },
    { label: t("avgResponse"), value: `${data.avg_response_time_minutes}m`, icon: Clock, color: "text-google-yellow", bg: "bg-yellow-50" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] px-4 md:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-google-blue flex items-center justify-center shadow-google-blue">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-google-grey-900 font-display">{t("analytics")}</h1>
          <p className="text-google-grey-600 text-sm">{t("realTimeOverview")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-google-grey-200`}>
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <p className={`text-3xl font-bold ${color} animate-count-up`}>{value}</p>
            <p className="text-google-grey-600 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-google-grey-200 rounded-2xl p-6 shadow-md3-1">
          <h2 className="text-sm font-semibold text-google-grey-900 mb-4">{t("needsByType")}</h2>
          <div className="space-y-3">
            {Object.entries(data.needs_by_type).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-google-grey-700">{type}</span>
                  <span className="text-xs text-google-grey-500 font-medium">{count}</span>
                </div>
                <div className="h-2 bg-google-grey-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / maxType) * 100}%`, background: NEED_TYPE_COLORS[type] || "#80868B" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-google-grey-200 rounded-2xl p-6 shadow-md3-1">
          <h2 className="text-sm font-semibold text-google-grey-900 mb-4">{t("statusBreakdown")}</h2>
          <div className="space-y-3">
            {[
              { label: t("pending"), value: data.pending_needs, color: "#F29900" },
              { label: t("assigned"), value: data.assigned_needs, color: "#1A73E8" },
              { label: t("resolved"), value: data.resolved_needs, color: "#188038" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-google-grey-700">{label}</span>
                  </div>
                  <span className="text-xs font-medium text-google-grey-600">{value} ({Math.round((value / total) * 100)}%)</span>
                </div>
                <div className="h-2 bg-google-grey-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / total) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-google-grey-200 flex justify-between text-xs text-google-grey-500">
            <span>{t("totalAssignments")}</span><span className="font-semibold text-google-grey-900">{data.total_assignments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
