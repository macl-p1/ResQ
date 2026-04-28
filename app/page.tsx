"use client";

import Link from "next/link";
import {
  Shield, HeartHandshake, AlertTriangle, ArrowRight, Sparkles, BarChart3,
  Map, Mic, Send, Globe, Zap, Clock, Languages, Server, Brain, MapPin,
  Eye, Volume2, MessageSquare, Cpu,
} from "lucide-react";
import ResQLogo from "@/components/ResQLogo";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();

  const stats = [
    { value: "5", label: "Languages" },
    { value: "8", label: "Google Cloud APIs" },
    { value: "<3s", label: "Avg. Match Time" },
    { value: "24/7", label: "Always On" },
  ];

  const features = [
    { icon: Sparkles, title: "Gemini AI Matching", desc: "Smart volunteer-to-crisis matching powered by Gemini 2.5 Flash. Ranks by skills, proximity, and workload." },
    { icon: Map, title: "Live Crisis Map", desc: "Real-time heatmap and cluster view showing urgency pins across affected regions with Google Maps." },
    { icon: Mic, title: "Voice & OCR Reports", desc: "Report emergencies by voice in 5 languages or snap a photo of paper surveys — AI extracts the data." },
    { icon: Send, title: "Instant Dispatch", desc: "One-click volunteer assignment with WhatsApp, Email, and Push notifications — plus Google Maps navigation." },
    { icon: BarChart3, title: "Impact Analytics", desc: "Track response times, volunteer utilization, and crisis resolution rates with real-time dashboards." },
    { icon: Languages, title: "Multilingual Support", desc: "Full interface in English, Hindi, Tamil, Telugu, and Bengali — with live translation of all reports." },
  ];

  const steps = [
    { num: "1", title: "Report", desc: "Anyone reports an emergency via text, voice, or photo — no login required. Gemini AI extracts key details.", icon: AlertTriangle },
    { num: "2", title: "Match", desc: "AI evaluates all available volunteers by skills, proximity, and workload — ranks them instantly.", icon: Sparkles },
    { num: "3", title: "Dispatch", desc: "One click assigns the best volunteer with WhatsApp + Email + Push notifications and Google Maps navigation.", icon: Send },
  ];

  const techStack = [
    { label: "Firebase", desc: "Auth · Firestore · FCM", icon: Server },
    { label: "Gemini AI", desc: "NLP · Matching", icon: Brain },
    { label: "Google Maps", desc: "Geocoding · Heatmap", icon: MapPin },
    { label: "Cloud Vision", desc: "OCR extraction", icon: Eye },
    { label: "Cloud TTS", desc: "Text-to-speech", icon: Volume2 },
    { label: "Cloud STT", desc: "Speech-to-text", icon: Mic },
    { label: "Cloud Translate", desc: "5 languages", icon: Globe },
    { label: "Cloud Run", desc: "Serverless deploy", icon: Cpu },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background relative overflow-hidden">
      {/* Background — subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      {/* ─── HERO ─── */}
      <section className="relative z-10 text-center max-w-2xl mx-auto px-4 pt-16 pb-12">
        <ResQLogo size="xl" showText={false} className="justify-center mb-6" />
        <h1 className="text-5xl md:text-6xl font-extrabold font-display tracking-tight text-foreground">
          Res<span className="text-[var(--brand-red)]">Q</span>
        </h1>
        <p className="text-xl text-foreground/80 mt-3 font-display">{t("aiPowered")}</p>
        <p className="text-lg text-muted-foreground">{t("builtOnCloud")}</p>
        <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
          {t("heroDescription")}
        </p>
      </section>

      {/* ─── ROLE CARDS ─── */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6 text-left hover:shadow-md3-3 transition-google group">
            <div className="h-11 w-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-google">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground font-display mb-1">{t("coordinator")}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t("coordinatorDesc")}</p>
            <Link href="/auth/admin/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-google">
              {t("adminLogin")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-6 text-left hover:shadow-md3-3 transition-google group">
            <div className="h-11 w-11 rounded-xl bg-green-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-google">
              <HeartHandshake className="h-5 w-5 text-green-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground font-display mb-1">{t("volunteer")}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t("volunteerDesc")}</p>
            <Link href="/auth/volunteer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 dark:bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-google">
              {t("joinLogin")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/report"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--brand-red)] text-white rounded-xl text-base font-bold shadow-glow-red hover:opacity-90 transition-google">
            <AlertTriangle className="h-5 w-5" />
            {t("reportEmergency")} <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">{t("noLoginRequired")}</p>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="glass-card rounded-2xl p-5 text-center hover:shadow-md3-2 transition-google">
              <p className="text-3xl font-bold text-primary font-display">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-display">Everything you need for crisis response</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
            From AI-powered matching to multilingual voice reports — ResQ brings together the full power of Google Cloud in one platform.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card rounded-2xl p-6 hover:shadow-md3-3 transition-google group">
              <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-google">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="relative z-10 max-w-4xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-display">How ResQ works</h2>
          <p className="text-muted-foreground mt-3 text-sm">Three simple steps — from crisis report to volunteer dispatch in under 60 seconds.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ num, title, desc, icon: Icon }) => (
            <div key={num} className="relative glass-card rounded-2xl p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-glow-blue">
                {num}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Icon className="h-4 w-4 text-primary" />{title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TECH STACK (Powered by Google Cloud) ─── */}
      <section id="tech-stack" className="relative z-10 max-w-4xl mx-auto px-4 py-16 scroll-mt-20">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          {t("poweredByGoogle")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {techStack.map(({ label, desc, icon: Icon }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center hover:shadow-md3-2 transition-google">
              <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-bold text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground font-display mb-3">Ready to make a difference?</h2>
        <p className="text-muted-foreground text-sm mb-8">Join ResQ as a volunteer or coordinator. Every action counts when lives are at stake.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/auth/volunteer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-google">
            <HeartHandshake className="h-4 w-4" />Join as Volunteer
          </Link>
          <Link href="/auth/admin/login" className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-card text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-google">
            <Shield className="h-4 w-4" />{t("coordinatorLogin")}
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <ResQLogo size="md" />
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                AI-powered crisis response platform built on Google Cloud. Connecting volunteers to critical needs — instantly.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-google">Coordinator Dashboard</Link></li>
                <li><Link href="/auth/volunteer" className="text-xs text-muted-foreground hover:text-foreground transition-google">Volunteer Portal</Link></li>
                <li><Link href="/report" className="text-xs text-muted-foreground hover:text-foreground transition-google">Report Emergency</Link></li>
                <li><Link href="/analytics" className="text-xs text-muted-foreground hover:text-foreground transition-google">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Features</h4>
              <ul className="space-y-2">
                {["Gemini AI Matching", "Voice & OCR Reports", "Live Crisis Heatmap", "Multi-channel Dispatch", "5-Language Support"].map((f) => (
                  <li key={f} className="text-xs text-muted-foreground">{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Technology</h4>
              <ul className="space-y-2">
                {["Google Cloud Platform", "Firebase · Firestore", "Gemini 2.5 Flash", "Next.js 14", "Cloud Run"].map((t) => (
                  <li key={t} className="text-xs text-muted-foreground">{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-[11px] text-muted-foreground">© 2026 ResQ. Built on Google Cloud · Powered by Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
