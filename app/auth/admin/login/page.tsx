"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ResQLogo from "@/components/ResQLogo";

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
      if (res.ok) router.push("/dashboard"); else { const d = await res.json(); setError(d.error || "Session creation failed"); }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") setError("Invalid email or password");
      else if (err.code === "auth/too-many-requests") setError("Too many attempts. Try again later.");
      else setError(err.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
      <div className="relative z-10 w-full max-w-md text-center">
        <ResQLogo size="lg" className="justify-center mb-4" />
        <h1 className="text-xl font-bold text-foreground font-display mb-1">{t("coordinatorLogin")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("signInAccess")}</p>
        <form onSubmit={handleLogin} className="glass-card rounded-2xl p-6 space-y-4 text-left">
          <div className="floating-label-group"><input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required /><label>Email address</label></div>
          <div className="floating-label-group relative">
            <input type={showPassword ? "text" : "password"} placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label>Password</label>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
          <button type="submit" disabled={loading} className="w-full btn-google-primary disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {t("signIn")}
          </button>
          <div className="border-t border-border pt-3"><p className="text-xs text-muted-foreground text-center">Default credentials: <span className="font-semibold text-foreground">admin@resq.org</span> / <span className="font-semibold text-foreground">ResQ2026!</span></p></div>
        </form>
        <p className="text-xs text-muted-foreground mt-4">Built on Google Cloud · Firebase · Gemini AI</p>
      </div>
    </div>
  );
}
