"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import ResQLogo from "@/components/ResQLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Get ID token
      const idToken = await user.getIdToken();

      // Step 3: Create server session cookie
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        await signOut(auth);
        throw new Error("SESSION_FAILED");
      }

      // Step 4: Check if user is in admins collection
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (!adminDoc.exists()) {
        await signOut(auth);
        // Clear session since they're not admin
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("NOT_ADMIN");
      }

      // Step 5: Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      const code = err?.code || err?.message || "";

      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect password. Please try again.");
      } else if (code === "auth/user-not-found") {
        setError("No coordinator account found with this email.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (code === "auth/network-request-failed") {
        setError("Connection failed. Please check your internet.");
      } else if (code === "NOT_ADMIN") {
        setError("This account is not registered as a coordinator.");
      } else if (code === "SESSION_FAILED") {
        setError("Failed to create session. Please try again.");
      } else {
        setError("Sign in failed. Please check your credentials.");
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4">
      <div className="w-full max-w-[480px]">
        {/* Logo + Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ResQLogo size="xl" />
          </div>
          <h1 className="text-2xl font-semibold text-google-grey-900 font-display">
            Coordinator Login
          </h1>
          <p className="text-sm text-google-grey-700 mt-1">
            Sign in to access the command center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-md3-2 p-8 border border-google-grey-200">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="floating-label-group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                autoComplete="email"
                className="w-full"
              />
              <label htmlFor="email">Email address</label>
            </div>

            {/* Password */}
            <div className="floating-label-group relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                autoComplete="current-password"
                className="w-full pr-12"
              />
              <label htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-google-grey-600 hover:text-google-grey-900 transition-google"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <svg className="h-5 w-5 text-google-red shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-google-red">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-google-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t border-google-grey-200 text-center">
            <p className="text-xs text-google-grey-600">
              Default credentials: <span className="font-medium text-google-grey-800">admin@resq.org</span> / <span className="font-medium text-google-grey-800">ResQ2026!</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-google-grey-500 mt-6">
          Built on Google Cloud · Firebase · Gemini AI
        </p>
      </div>
    </div>
  );
}
