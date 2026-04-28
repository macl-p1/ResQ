"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { MapPin, Clock, CheckCircle2, Navigation, Loader2, ClipboardList, Compass, User, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  need_id: string;
  status: string;
  need_type: string;
  location_name: string;
  description: string;
  urgency_score: number;
  affected_count: number;
  lat?: number;
  lng?: number;
  created_at: string;
}

interface VolunteerProfile {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  completed_tasks: number;
  active_task_count: number;
}

function urgencyColor(score: number) {
  if (score > 75) return "#D93025";
  if (score >= 40) return "#F29900";
  return "#188038";
}

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function VolunteerDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [volunteer, setVolunteer] = useState<VolunteerProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nearbyNeeds, setNearbyNeeds] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"tasks" | "nearby" | "profile">("tasks");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Get volunteer info from localStorage (fallback) or Firebase Auth
  const volName = typeof window !== "undefined" ? localStorage.getItem("resq-volunteer-name") : null;

  const fetchNeeds = useCallback(async () => {
    try {
      const r = await fetch("/api/needs");
      if (r.ok) {
        const all = await r.json();
        setTasks(all.filter((n: any) => n.status === "assigned"));
        setNearbyNeeds(all.filter((n: any) => n.status === "pending").slice(0, 10));
      }
    } catch { /* */ }
  }, []);

  useEffect(() => {
    const isDemoMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (isDemoMode) {
      // Demo mode — just fetch needs from API
      fetchNeeds().then(() => setLoading(false));
      return;
    }

    // Firebase mode — listen for auth state
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/volunteer");
        return;
      }

      // Fetch volunteer profile
      try {
        const volDoc = await getDoc(doc(db, "volunteers", user.uid));
        if (volDoc.exists()) {
          setVolunteer(volDoc.data() as VolunteerProfile);
          localStorage.setItem("resq-volunteer-name", volDoc.data()?.name || "");
        }
      } catch (err) {
        console.warn("Failed to fetch volunteer profile:", err);
      }

      // Fetch needs from API (uses admin SDK, bypasses Firestore rules)
      await fetchNeeds();
      setLoading(false);

      // Listen for assignments in real time
      try {
        const assignmentsQuery = query(
          collection(db, "assignments"),
          where("volunteer_id", "==", user.uid),
          orderBy("matched_at", "desc")
        );
        const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
          // Re-fetch needs when assignments change
          fetchNeeds();
        }, (err) => {
          console.warn("Assignments listener error:", err);
        });

        return () => unsubAssignments();
      } catch (err) {
        console.warn("Assignments query setup failed:", err);
      }
    });

    return () => unsubAuth();
  }, [router, fetchNeeds]);

  const handleAction = async (taskId: string, action: string) => {
    setActionLoading(taskId);
    await new Promise((r) => setTimeout(r, 800));
    setActionLoading(null);
    fetchNeeds();
  };

  const displayName = volunteer?.name || volName || "Volunteer";
  const initials = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "V";
  const completedCount = volunteer?.completed_tasks || 0;

  const tabs = [
    { id: "tasks" as const, icon: ClipboardList, label: t("myTasks") },
    { id: "nearby" as const, icon: Compass, label: t("nearby") },
    { id: "profile" as const, icon: User, label: t("profile") },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] flex flex-col pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-google-grey-200 px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-google-green text-white flex items-center justify-center font-bold text-lg">
            {initials}
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-google-grey-900 font-display">{t("hi")}, {displayName} 👋</p>
            <p className="text-xs text-google-grey-600">{t("findTasksNearYou")}</p>
          </div>
          <Link href="/report"
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-[10px] text-google-red font-medium hover:bg-red-100 transition-google">
            <AlertTriangle className="h-3 w-3" />
            Report
          </Link>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 bg-google-green rounded-full animate-pulse" />
            <span className="text-[10px] text-google-green font-medium">{t("online")}</span>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="px-4 py-3 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("tasksCompleted"), value: completedCount, color: "text-google-green", bg: "bg-green-50" },
            { label: t("nearby"), value: nearbyNeeds.length, color: "text-google-blue", bg: "bg-blue-50" },
            { label: t("myTasks"), value: tasks.length, color: "text-google-yellow", bg: "bg-yellow-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl py-3 text-center`}>
              <p className={`text-xl font-bold ${color} animate-count-up`}>{value}</p>
              <p className="text-[10px] text-google-grey-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 max-w-lg mx-auto w-full">
        {activeTab === "tasks" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-google-grey-900">{t("myTasks")}</h2>
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-google-blue mx-auto" /></div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-google-grey-200">
                <ClipboardList className="h-8 w-8 text-google-grey-400 mx-auto mb-2" />
                <p className="text-sm text-google-grey-600">{t("noTasksYet")}</p>
                <p className="text-xs text-google-grey-500 mt-1">Check &quot;Nearby&quot; tab for available needs</p>
              </div>
            ) : (
              tasks.map((task, i) => (
                <motion.div key={task.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}>
                  <div className="bg-white rounded-xl border border-google-grey-200 shadow-md3-1 p-4"
                    style={{ borderLeftWidth: "4px", borderLeftColor: urgencyColor(task.urgency_score) }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${urgencyColor(task.urgency_score)}15`, color: urgencyColor(task.urgency_score) }}>
                          {task.need_type}
                        </span>
                        <p className="text-sm font-medium text-google-grey-900 mt-1">{task.location_name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-google-grey-500">
                        <Clock className="h-3 w-3" />{timeAgo(task.created_at)}
                      </div>
                    </div>
                    <p className="text-xs text-google-grey-600 line-clamp-2 mb-3">{task.description}</p>
                    <div className="flex gap-2">
                      {task.lat && task.lng && (
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${task.lat},${task.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full border border-google-grey-300 text-xs font-medium text-google-grey-700 hover:bg-google-grey-50 transition-google">
                          <Navigation className="h-3.5 w-3.5" />{t("navigate")}
                        </a>
                      )}
                      <button onClick={() => handleAction(task.id, "complete")} disabled={actionLoading === task.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full bg-google-green text-white text-xs font-medium hover:opacity-90 transition-google disabled:opacity-60">
                        {actionLoading === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {t("markComplete")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "nearby" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-google-grey-900">{t("nearby")}</h2>
            {nearbyNeeds.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-google-grey-200">
                <MapPin className="h-8 w-8 text-google-grey-400 mx-auto mb-2" />
                <p className="text-sm text-google-grey-600">{t("noPendingNeeds")}</p>
              </div>
            ) : (
              nearbyNeeds.map((need, i) => (
                <motion.div key={need.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}>
                  <div className="bg-white rounded-xl border border-google-grey-200 shadow-md3-1 p-4"
                    style={{ borderLeftWidth: "4px", borderLeftColor: urgencyColor(need.urgency_score) }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${urgencyColor(need.urgency_score)}15`, color: urgencyColor(need.urgency_score) }}>
                        {need.need_type}
                      </span>
                      <span className="text-[10px] text-google-grey-500">{need.affected_count} people</span>
                    </div>
                    <p className="text-sm font-medium text-google-grey-900">{need.location_name}</p>
                    <p className="text-xs text-google-grey-600 line-clamp-1 mt-0.5">{need.description}</p>
                    <button onClick={() => handleAction(need.id, "accept")} disabled={actionLoading === need.id}
                      className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-full bg-google-blue text-white text-xs font-medium hover:bg-google-blue-hover transition-google disabled:opacity-60">
                      {actionLoading === need.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      {t("acceptTask")}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-google-grey-200 shadow-md3-1 p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-google-green text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                {initials}
              </div>
              <p className="text-lg font-bold text-google-grey-900">{displayName}</p>
              <p className="text-xs text-google-grey-600 mt-0.5">{volunteer?.email || "Active Volunteer"}</p>
              {volunteer?.skills && (
                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {volunteer.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-google-blue text-[10px] rounded-full font-medium">{s}</span>
                  ))}
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl py-3"><p className="text-xl font-bold text-google-green">{completedCount}</p><p className="text-[10px] text-google-grey-600">Completed</p></div>
                <div className="bg-blue-50 rounded-xl py-3"><p className="text-xl font-bold text-google-blue">{tasks.length}</p><p className="text-[10px] text-google-grey-600">Active</p></div>
              </div>
            </div>
            <button onClick={() => {
              localStorage.removeItem("resq-volunteer-id");
              localStorage.removeItem("resq-volunteer-name");
              auth.signOut().catch(() => {});
              fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/");
            }}
              className="w-full py-3 border border-google-red text-google-red rounded-full text-sm font-medium hover:bg-red-50 transition-google">
              {t("signOut")}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation — Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-google-grey-200 md:hidden z-40">
        <div className="flex">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-google ${
                activeTab === id ? "text-google-blue" : "text-google-grey-500"
              }`}>
              <Icon className={`h-5 w-5 ${activeTab === id ? "text-google-blue" : "text-google-grey-500"}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
