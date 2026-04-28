"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, X, Globe, LogOut, Bell, BarChart3, FileText, Users, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ResQLogo from "@/components/ResQLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { auth } from "@/lib/firebase";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
] as const;

interface Activity {
  id: string;
  type: "need" | "assignment" | "volunteer";
  title: string;
  detail: string;
  time: string;
  urgency?: number;
}

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function urgencyDot(score?: number) {
  if (!score) return "bg-muted-foreground";
  if (score > 75) return "bg-red-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-green-500";
}

// Landing page section links
const LANDING_NAV = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Technology", href: "#tech-stack" },
];

// Dashboard page links
const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: MapPin },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Report", href: "/report", icon: FileText },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeen, setLastSeen] = useState<string>("");
  const bellRef = useRef<HTMLDivElement>(null);

  const isLanding = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isVolDashboard = pathname === "/volunteer/dashboard";
  const isAnalytics = pathname === "/analytics";
  const showDashboardNav = isDashboard || isVolDashboard || isAnalytics;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch activities when on dashboard
  const fetchActivities = useCallback(async () => {
    try {
      const [needsRes, volsRes] = await Promise.all([
        fetch("/api/needs"),
        fetch("/api/volunteers"),
      ]);

      const items: Activity[] = [];

      if (needsRes.ok) {
        const needs = await needsRes.json();
        needs.slice(0, 15).forEach((n: any) => {
          items.push({
            id: `need-${n.id}`,
            type: "need",
            title: `${n.need_type} reported`,
            detail: `${n.location_name} · ${n.affected_count} affected`,
            time: n.created_at,
            urgency: n.urgency_score,
          });
          if (n.status === "assigned") {
            items.push({
              id: `assign-${n.id}`,
              type: "assignment",
              title: `Volunteer assigned`,
              detail: `${n.need_type} in ${n.location_name}`,
              time: n.updated_at || n.created_at,
              urgency: n.urgency_score,
            });
          }
          if (n.status === "resolved") {
            items.push({
              id: `resolved-${n.id}`,
              type: "assignment",
              title: `Need resolved ✓`,
              detail: `${n.need_type} in ${n.location_name}`,
              time: n.updated_at || n.created_at,
            });
          }
        });
      }

      if (volsRes.ok) {
        const vols = await volsRes.json();
        vols.slice(0, 5).forEach((v: any) => {
          if (v.created_at) {
            items.push({
              id: `vol-${v.id}`,
              type: "volunteer",
              title: `${v.name} joined`,
              detail: `Skills: ${v.skills?.slice(0, 3).join(", ") || "N/A"}`,
              time: v.created_at,
            });
          }
        });
      }

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(items.slice(0, 20));

      const saved = localStorage.getItem("resq-notif-seen") || "";
      setLastSeen(saved);
      if (saved) {
        const seenTime = new Date(saved).getTime();
        setUnreadCount(items.filter((a) => new Date(a.time).getTime() > seenTime).length);
      } else {
        setUnreadCount(items.length);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (showDashboardNav) {
      fetchActivities();
      const iv = setInterval(fetchActivities, 10000);
      return () => clearInterval(iv);
    }
  }, [showDashboardNav, fetchActivities]);

  const handleBellClick = () => {
    setBellOpen(!bellOpen);
    setLangOpen(false);
    if (!bellOpen) {
      const now = new Date().toISOString();
      localStorage.setItem("resq-notif-seen", now);
      setLastSeen(now);
      setUnreadCount(0);
    }
  };

  const handleSignOut = async () => {
    try { await auth.signOut(); } catch {}
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case "need": return "🆘";
      case "assignment": return "✅";
      case "volunteer": return "🙋";
      default: return "📋";
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border transition-google">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between relative">
        {/* Left — Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-google">
            <ResQLogo size="sm" mono />
          </Link>
        </div>

        {/* Center — Contextual nav (absolutely centered) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Landing page section nav */}
          {isLanding && (
            <nav className="flex items-center gap-1">
              {LANDING_NAV.map(({ label, href }) => (
                <a key={href} href={href} onClick={(e) => handleAnchorClick(e, href)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-google">
                  {label}
                </a>
              ))}
            </nav>
          )}

          {/* Dashboard page nav */}
          {showDashboardNav && (
            <nav className="flex items-center gap-1">
              {DASHBOARD_NAV.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-google ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language */}
          <div className="relative">
            <button onClick={() => { setLangOpen(!langOpen); setBellOpen(false); }}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google"
              title="Language">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-11 bg-card border border-border rounded-xl shadow-md3-3 py-1 min-w-[140px] animate-fade-in z-50">
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => { setLanguage(l.code as any); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-google ${
                      language === l.code ? "text-primary font-semibold" : "text-foreground"
                    }`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications & Sign out (dashboard only) */}
          {showDashboardNav && (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={bellRef}>
                <button onClick={handleBellClick}
                  className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google relative">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-[10px] text-white font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-xl shadow-md3-4 animate-fade-in z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Activity Feed</h3>
                      <span className="text-[10px] text-muted-foreground">{activities.length} events</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {activities.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No recent activity</p>
                        </div>
                      ) : (
                        activities.map((a) => {
                          const isNew = lastSeen ? new Date(a.time).getTime() > new Date(lastSeen).getTime() : false;
                          return (
                            <div key={a.id}
                              className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-google ${isNew ? "bg-primary/5" : ""}`}>
                              <div className="flex items-start gap-3">
                                <span className="text-base mt-0.5 shrink-0">{activityIcon(a.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                                    {a.urgency && <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${urgencyDot(a.urgency)}`} />}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate">{a.detail}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo(a.time)}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {activities.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-border">
                        <Link href="/analytics" onClick={() => setBellOpen(false)}
                          className="text-[11px] text-primary font-medium hover:underline">
                          View all analytics →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={handleSignOut}
                className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-google"
                title="Sign Out">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </>
          )}

          {/* Report link (non-dashboard, non-landing) */}
          {!showDashboardNav && !isLanding && (
            <Link href="/report"
              className="hidden md:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-google">
              {t("reportEmergency")}
            </Link>
          )}

          {/* Mobile menu */}
          <button className="md:hidden h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-google"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-3 space-y-1 animate-fade-in">
          {/* Landing nav links on mobile */}
          {isLanding && LANDING_NAV.map(({ label, href }) => (
            <a key={href} href={href} onClick={(e) => handleAnchorClick(e, href)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-google">
              {label}
            </a>
          ))}

          {/* Dashboard nav links on mobile */}
          {showDashboardNav && DASHBOARD_NAV.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-2 text-sm transition-google ${
                pathname === href ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}

          {!showDashboardNav && !isLanding && (
            <Link href="/report" onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-google">
              {t("reportEmergency")}
            </Link>
          )}

          {showDashboardNav && (
            <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
              className="block w-full text-left py-2 text-sm text-destructive hover:text-destructive/80 transition-google">
              {t("signOut")}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
