"use client";

import Link from "next/link";
import {
  Shield, HandHeart, Cpu, Map, Eye, Globe, Cloud, Mic, Volume2, Languages,
  AlertTriangle, Zap, Users, BarChart3, MapPin, MessageSquare, Bell, Sparkles,
  ArrowRight, ChevronRight,
} from "lucide-react";
import ResQLogo from "@/components/ResQLogo";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Gemini AI Matching",
    desc: "Smart volunteer-to-crisis matching powered by Gemini 2.5 Flash. Ranks by skills, proximity, and workload.",
    color: "#4285F4",
    bg: "bg-blue-50",
  },
  {
    icon: Map,
    title: "Live Crisis Map",
    desc: "Real-time heatmap and cluster view showing urgency pins across affected regions with Google Maps.",
    color: "#EA4335",
    bg: "bg-red-50",
  },
  {
    icon: Mic,
    title: "Voice & OCR Reports",
    desc: "Report emergencies by voice in 5 languages or snap a photo of paper surveys — AI extracts the data.",
    color: "#34A853",
    bg: "bg-green-50",
  },
  {
    icon: Bell,
    title: "Instant Dispatch",
    desc: "One-click volunteer assignment with WhatsApp, Email, and Push notifications — plus Google Maps navigation.",
    color: "#FBBC04",
    bg: "bg-yellow-50",
  },
  {
    icon: BarChart3,
    title: "Impact Analytics",
    desc: "Track response times, volunteer utilization, and crisis resolution rates with real-time dashboards.",
    color: "#4285F4",
    bg: "bg-blue-50",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    desc: "Full interface in English, Hindi, Tamil, Telugu, and Bengali — with live translation of all reports.",
    color: "#34A853",
    bg: "bg-green-50",
  },
];

const GOOGLE_SERVICES = [
  { name: "Firebase", icon: Cloud, desc: "Auth · Firestore · FCM" },
  { name: "Gemini AI", icon: Cpu, desc: "NLP · Matching" },
  { name: "Google Maps", icon: Map, desc: "Geocoding · Heatmap" },
  { name: "Cloud Vision", icon: Eye, desc: "OCR extraction" },
  { name: "Cloud TTS", icon: Volume2, desc: "Text-to-speech" },
  { name: "Cloud STT", icon: Mic, desc: "Speech-to-text" },
  { name: "Cloud Translate", icon: Languages, desc: "5 languages" },
  { name: "Cloud Run", icon: Globe, desc: "Serverless deploy" },
];

const STATS = [
  { value: "5", label: "Languages", icon: Languages },
  { value: "8", label: "Google Cloud APIs", icon: Cloud },
  { value: "<3s", label: "Avg. Match Time", icon: Zap },
  { value: "24/7", label: "Always On", icon: Globe },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient -z-10"
          style={{
            background: "linear-gradient(135deg, #E8F0FE 0%, #FDE7E9 25%, #E6F4EA 50%, #FEF7E0 75%, #E8F0FE 100%)",
            backgroundSize: "400% 400%",
          }}
        />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(#202124 1px, transparent 1px), linear-gradient(90deg, #202124 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12">
          <ResQLogo size="md" />
          <div className="flex items-center gap-2">
            <Link href="/report" className="text-xs text-google-grey-600 hover:text-google-red transition-google font-medium">
              Report Emergency
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="mt-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-google-grey-900 font-display mb-5">
            Res<span className="text-google-red">Q</span>
          </h1>

          <p className="text-lg md:text-xl text-google-grey-700 max-w-xl mx-auto mb-2 font-medium">
            AI-powered crisis response.
          </p>
          <p className="text-lg md:text-xl text-google-grey-500 max-w-xl mx-auto mb-4 font-medium">
            Built on Google Cloud.
          </p>
          <p className="text-sm text-google-grey-500 max-w-lg mx-auto mb-10 leading-relaxed">
            When disasters strike, every second counts. ResQ uses Gemini AI and real-time data to connect volunteers to critical needs — instantly.
          </p>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-xl mx-auto mb-10">
            {/* Coordinator */}
            <Link
              href="/auth/admin/login"
              className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-left shadow-md3-2 border border-white/80 hover:shadow-md3-4 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-xl bg-google-blue flex items-center justify-center mb-3 shadow-google-blue group-hover:scale-105 transition-transform">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-base font-bold text-google-grey-900 mb-0.5 font-display">Coordinator</h2>
              <p className="text-xs text-google-grey-500 mb-4">Manage crises, coordinate volunteers, track impact</p>
              <span className="inline-flex items-center gap-2 bg-google-blue text-white px-4 py-2 rounded-full text-xs font-semibold group-hover:bg-google-blue-hover transition-google">
                Admin Login
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            {/* Volunteer */}
            <Link
              href="/auth/volunteer"
              className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-left shadow-md3-2 border border-white/80 hover:shadow-md3-4 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-xl bg-google-green flex items-center justify-center mb-3 shadow-google-green group-hover:scale-105 transition-transform">
                <HandHeart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-base font-bold text-google-grey-900 mb-0.5 font-display">Volunteer</h2>
              <p className="text-xs text-google-grey-500 mb-4">Find tasks near you, make a real difference</p>
              <span className="inline-flex items-center gap-2 bg-google-green text-white px-4 py-2 rounded-full text-xs font-semibold group-hover:opacity-90 transition-google">
                Join / Login
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Report Emergency CTA */}
          <Link
            href="/report"
            className="group inline-flex items-center gap-3 bg-google-red text-white px-7 py-3.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <AlertTriangle className="h-4 w-4" />
            Report an Emergency
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-[10px] text-google-grey-400 mt-3 mb-8">No login required — anyone can report</p>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-white border-y border-google-grey-200 py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-google-grey-50 border border-google-grey-200 flex items-center justify-center">
                <Icon className="h-5 w-5 text-google-blue" />
              </div>
              <div>
                <p className="text-xl font-bold text-google-grey-900 font-display">{value}</p>
                <p className="text-[11px] text-google-grey-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-6 bg-[#F8F9FA]" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-google-grey-200 mb-4 shadow-md3-1">
              <Zap className="h-3.5 w-3.5 text-google-yellow" />
              <span className="text-xs font-medium text-google-grey-700">Core Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-google-grey-900 font-display mb-3">
              Everything you need for crisis response
            </h2>
            <p className="text-sm text-google-grey-600 max-w-lg mx-auto">
              From AI-powered matching to multilingual voice reports — ResQ brings together the full power of Google Cloud in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-google-grey-200 shadow-md3-1 hover:shadow-md3-3 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="text-sm font-bold text-google-grey-900 mb-1.5 font-display">{title}</h3>
                <p className="text-xs text-google-grey-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-google-grey-900 font-display mb-3">
              How ResQ works
            </h2>
            <p className="text-sm text-google-grey-600 max-w-md mx-auto">
              Three simple steps — from crisis report to volunteer dispatch in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Report", desc: "Anyone reports an emergency via text, voice, or photo — no login required. Gemini AI extracts key details.", icon: MessageSquare, color: "#EA4335" },
              { step: "02", title: "Match", desc: "AI evaluates all available volunteers by skills, proximity, and workload — ranks them instantly.", icon: Users, color: "#4285F4" },
              { step: "03", title: "Dispatch", desc: "One click assigns the best volunteer with WhatsApp + Email + Push notifications and Google Maps navigation.", icon: MapPin, color: "#34A853" },
            ].map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="text-center">
                <div className="relative mx-auto mb-5">
                  <div className="h-16 w-16 rounded-2xl bg-white border-2 border-google-grey-200 flex items-center justify-center shadow-md3-2 mx-auto">
                    <Icon className="h-7 w-7" style={{ color }} />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center" style={{ background: color }}>
                    {step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-google-grey-900 font-display mb-2">{title}</h3>
                <p className="text-xs text-google-grey-600 leading-relaxed max-w-[220px] mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── POWERED BY GOOGLE ─── */}
      <section className="py-16 px-6 bg-[#F8F9FA] border-t border-google-grey-200">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] text-google-grey-500 uppercase tracking-[0.2em] mb-10 font-semibold">
            Powered by Google Cloud
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {GOOGLE_SERVICES.map(({ name, icon: Icon, desc }) => (
              <div key={name} className="flex flex-col items-center gap-2 text-center group py-4">
                <div className="h-11 w-11 rounded-xl border border-google-grey-200 bg-white flex items-center justify-center shadow-md3-1 group-hover:shadow-md3-2 group-hover:-translate-y-0.5 transition-all duration-200">
                  <Icon className="h-5 w-5 text-google-blue" />
                </div>
                <p className="text-xs font-semibold text-google-grey-800">{name}</p>
                <p className="text-[10px] text-google-grey-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-google-grey-900 font-display mb-3">
            Ready to make a difference?
          </h2>
          <p className="text-sm text-google-grey-600 mb-8 max-w-md mx-auto">
            Join ResQ as a volunteer or coordinator. Every action counts when lives are at stake.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/volunteer" className="inline-flex items-center gap-2 bg-google-blue text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-google-blue-hover transition-google">
              <HandHeart className="h-4 w-4" />
              Join as Volunteer
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/admin/login" className="inline-flex items-center gap-2 border border-google-grey-300 text-google-grey-700 px-6 py-3 rounded-full text-sm font-medium hover:bg-google-grey-50 transition-google">
              <Shield className="h-4 w-4" />
              Coordinator Login
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-google-grey-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold font-display mb-2">
                Res<span className="text-google-red">Q</span>
              </h3>
              <p className="text-xs text-google-grey-400 leading-relaxed">
                AI-powered crisis response platform built on Google Cloud. Connecting volunteers to critical needs — instantly.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-google-grey-400 mb-3">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/admin/login" className="text-xs text-google-grey-300 hover:text-white transition-google">Coordinator Dashboard</Link></li>
                <li><Link href="/auth/volunteer" className="text-xs text-google-grey-300 hover:text-white transition-google">Volunteer Portal</Link></li>
                <li><Link href="/report" className="text-xs text-google-grey-300 hover:text-white transition-google">Report Emergency</Link></li>
                <li><Link href="/analytics" className="text-xs text-google-grey-300 hover:text-white transition-google">Analytics</Link></li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-google-grey-400 mb-3">Features</h4>
              <ul className="space-y-2">
                <li><span className="text-xs text-google-grey-300">Gemini AI Matching</span></li>
                <li><span className="text-xs text-google-grey-300">Voice & OCR Reports</span></li>
                <li><span className="text-xs text-google-grey-300">Live Crisis Heatmap</span></li>
                <li><span className="text-xs text-google-grey-300">Multi-channel Dispatch</span></li>
                <li><span className="text-xs text-google-grey-300">5-Language Support</span></li>
              </ul>
            </div>

            {/* Technology */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-google-grey-400 mb-3">Technology</h4>
              <ul className="space-y-2">
                <li><span className="text-xs text-google-grey-300">Google Cloud Platform</span></li>
                <li><span className="text-xs text-google-grey-300">Firebase · Firestore</span></li>
                <li><span className="text-xs text-google-grey-300">Gemini 2.5 Flash</span></li>
                <li><span className="text-xs text-google-grey-300">Next.js 14</span></li>
                <li><span className="text-xs text-google-grey-300">Cloud Run</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-google-grey-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-google-grey-500">
              © 2026 ResQ. Built on Google Cloud · Powered by Gemini AI.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-google-grey-500">Made with ❤️ for crisis response</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
