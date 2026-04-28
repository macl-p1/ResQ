"use client";

import { useEffect, useState } from "react";
import { AnalyticsData } from "@/types/database";
import { BarChart3, Users, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const NEED_TYPE_COLORS: Record<string, string> = {
  Rescue: "#EF4444", Medical: "#EF4444", Food: "#F59E0B", Water: "#3B82F6",
  Shelter: "#F59E0B", Clothing: "#A855F7", Sanitation: "#22C55E",
  Education: "#3B82F6", Infrastructure: "#71717A", Other: "#A1A1AA",
};

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background">
      <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
  );

  const maxType = Math.max(...Object.values(data.needs_by_type), 1);
  const total = data.total_needs || 1;

  const statCards = [
    { label: t("totalNeeds"), value: data.total_needs, icon: AlertTriangle, color: "text-red-500 dark:text-red-400", bgClass: "stat-red" },
    { label: t("tasksCompleted"), value: data.resolved_needs, icon: CheckCircle2, color: "text-green-500 dark:text-emerald-400", bgClass: "stat-green" },
    { label: t("volunteersAvailable"), value: data.active_volunteers, icon: Users, color: "text-blue-500 dark:text-blue-400", bgClass: "stat-blue" },
    { label: t("avgResponse"), value: `${data.avg_response_time_minutes}m`, icon: Clock, color: "text-amber-500 dark:text-amber-400", bgClass: "stat-amber" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 md:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-glow-blue">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground font-display">{t("analytics")}</h1>
          <p className="text-muted-foreground text-sm">{t("realTimeOverview")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bgClass }) => (
          <div key={label} className={`${bgClass} rounded-2xl p-5 border border-border`}>
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <p className={`text-3xl font-bold ${color} animate-count-up`}>{value}</p>
            <p className="text-muted-foreground text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t("needsByType")}</h2>
          <div className="space-y-3">
            {Object.entries(data.needs_by_type).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{type}</span>
                  <span className="text-xs text-muted-foreground font-medium">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / maxType) * 100}%`, background: NEED_TYPE_COLORS[type] || "#A1A1AA" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t("statusBreakdown")}</h2>
          <div className="space-y-3">
            {[
              { label: t("pending"), value: data.pending_needs, color: "#F59E0B" },
              { label: t("assigned"), value: data.assigned_needs, color: "#3B82F6" },
              { label: t("resolved"), value: data.resolved_needs, color: "#22C55E" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-foreground">{label}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{value} ({Math.round((value / total) * 100)}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / total) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
            <span>{t("totalAssignments")}</span><span className="font-semibold text-foreground">{data.total_assignments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
