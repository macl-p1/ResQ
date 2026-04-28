"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Bell, Menu, X, LogOut } from "lucide-react";
import ResQLogo from "@/components/ResQLogo";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Hide navbar on login/volunteer auth pages and landing
  const hideNavbar = pathname.startsWith("/auth") || pathname === "/";
  if (hideNavbar) return null;

  const isAdmin = pathname.startsWith("/dashboard") || pathname.startsWith("/analytics");

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-google-grey-200 shadow-md3-1">
      <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center">
        {/* Left: Logo — fixed width */}
        <div className="flex items-center w-40 shrink-0">
          <Link href={isAdmin ? "/dashboard" : "/volunteer/dashboard"} className="flex items-center">
            <ResQLogo size="md" />
          </Link>
        </div>

        {/* Center: Page title — takes remaining space, centered */}
        <div className="flex-1 flex justify-center">
          <span className="text-sm font-semibold text-google-grey-800 tracking-wide">
            {isAdmin ? t("dashboard") : t("volunteer")}
          </span>
        </div>

        {/* Right: Actions — fixed width to balance with left */}
        <div className="flex items-center gap-1 w-40 shrink-0 justify-end">
          {/* Language selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-google-grey-100 transition-google"
              aria-label="Change language"
            >
              <Globe className="h-[18px] w-[18px] text-google-grey-600" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-md3-3 border border-google-grey-200 py-1 animate-fade-in">
                {LANGUAGES.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => { setLanguage(code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-google-grey-50 transition-google ${
                      language === code ? "text-google-blue font-semibold bg-blue-50" : "text-google-grey-800"
                    }`}
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-google-grey-100 transition-google relative">
            <Bell className="h-[18px] w-[18px] text-google-grey-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-google-red rounded-full" />
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="hidden md:flex h-9 items-center gap-1.5 px-3 rounded-full hover:bg-google-grey-100 transition-google text-[13px] text-google-grey-600"
          >
            <LogOut className="h-[15px] w-[15px]" />
            {t("signOut")}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden h-9 w-9 rounded-full flex items-center justify-center hover:bg-google-grey-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-google-grey-200 py-2 px-4 animate-fade-in">
          <Link href="/dashboard" className="block py-3 text-sm text-google-grey-800 hover:text-google-blue" onClick={() => setMobileOpen(false)}>
            {t("dashboard")}
          </Link>
          <Link href="/analytics" className="block py-3 text-sm text-google-grey-800 hover:text-google-blue" onClick={() => setMobileOpen(false)}>
            {t("analytics")}
          </Link>
          <button onClick={handleSignOut} className="w-full text-left py-3 text-sm text-google-red">
            {t("signOut")}
          </button>
        </div>
      )}
    </nav>
  );
}
