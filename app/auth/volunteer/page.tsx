"use client";

import { useState, useRef, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SKILL_OPTIONS, SkillType } from "@/types/database";
import ResQLogo from "@/components/ResQLogo";
import toast from "react-hot-toast";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

type AuthTab = "register" | "login";

function VolunteerAuthContent() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [skills, setSkills] = useState<SkillType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [pincode, setPincode] = useState("");
  const isDemoMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
  ];

  const cityCoordinates: Record<string, {lat: number, lng: number}> = {
    'Mumbai': {lat: 19.0760, lng: 72.8777},
    'Delhi': {lat: 28.6139, lng: 77.2090},
    'Bengaluru': {lat: 12.9716, lng: 77.5946},
    'Bangalore': {lat: 12.9716, lng: 77.5946},
    'Chennai': {lat: 13.0827, lng: 80.2707},
    'Hyderabad': {lat: 17.3850, lng: 78.4867},
    'Kolkata': {lat: 22.5726, lng: 88.3639},
    'Pune': {lat: 18.5204, lng: 73.8567},
    'Ahmedabad': {lat: 23.0225, lng: 72.5714},
    'Jaipur': {lat: 26.9124, lng: 75.7873},
    'Surat': {lat: 21.1702, lng: 72.8311},
    'Lucknow': {lat: 26.8467, lng: 80.9462},
    'Kanpur': {lat: 26.4499, lng: 80.3319},
    'Nagpur': {lat: 21.1458, lng: 79.0882},
    'Visakhapatnam': {lat: 17.6868, lng: 83.2185},
    'Bhopal': {lat: 23.2599, lng: 77.4126},
    'Patna': {lat: 25.5941, lng: 85.1376},
    'Coimbatore': {lat: 11.0168, lng: 76.9558},
    'Kochi': {lat: 9.9312, lng: 76.2673},
    'Chandigarh': {lat: 30.7333, lng: 76.7794},
    'Guwahati': {lat: 26.1445, lng: 91.7362},
    'Indore': {lat: 22.7196, lng: 75.8577},
    'Vadodara': {lat: 22.3072, lng: 73.1812},
    'Agra': {lat: 27.1767, lng: 78.0081},
    'Varanasi': {lat: 25.3176, lng: 82.9739},
    'Amritsar': {lat: 31.6340, lng: 74.8723},
    'Mysuru': {lat: 12.2958, lng: 76.6394},
    'Ranchi': {lat: 23.3441, lng: 85.3096},
    'Thiruvananthapuram': {lat: 8.5241, lng: 76.9366},
    'Bhubaneswar': {lat: 20.2961, lng: 85.8245},
    'Dehradun': {lat: 30.3165, lng: 78.0322},
    'Jammu': {lat: 32.7266, lng: 74.8570},
    'Srinagar': {lat: 34.0837, lng: 74.7973},
    'Shimla': {lat: 31.1048, lng: 77.1734},
    'Raipur': {lat: 21.2514, lng: 81.6296},
    'Jodhpur': {lat: 26.2389, lng: 73.0243},
    'Madurai': {lat: 9.9252, lng: 78.1198},
    'Gurgaon': {lat: 28.4595, lng: 77.0266},
    'Noida': {lat: 28.5355, lng: 77.3910},
    'Faridabad': {lat: 28.4089, lng: 77.3178},
  };

  // Function to get coordinates from city name
  const getCoordsFromCity = (cityName: string) => {
    const key = Object.keys(cityCoordinates).find(
      k => cityName.toLowerCase().includes(k.toLowerCase())
    );
    return key ? cityCoordinates[key] : null;
  };

  const toggleSkill = (s: SkillType) => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) { setError("Select at least one skill"); return; }
    if (!cityInput || !selectedState || pincode.length !== 6 || lat === null || lng === null) { setError("Please enter your city, state and PIN code to continue"); return; }
    setLoading(true); setError(null);
    try {
      const location_name = `${cityInput}, ${selectedState}`;
      
      if (isDemoMode) {
        const { demoStore } = await import("@/lib/demo-store");
        demoStore.addVolunteer({ name, phone, email, skills, lat, lng, is_available: true, active_task_count: 0, completed_tasks: 0 });
        localStorage.setItem("resq-volunteer-id", "demo-vol");
        localStorage.setItem("resq-volunteer-name", name);
        toast.success("Welcome to ResQ! Registration successful", { icon: "🎉", duration: 4000 });
        // Non-blocking notifications
        fetch("/api/notify/welcome", {
          method: "POST",
          body: JSON.stringify({ name, email, phone, skills, location_name }),
          headers: { "Content-Type": "application/json" },
        }).catch(console.error);
        router.push("/volunteer/dashboard");
        return;
      }

      // 1. Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Save to Firestore volunteers collection
      await setDoc(doc(db, "volunteers", cred.user.uid), {
        uid: cred.user.uid, name, email, phone, skills,
        location_name, pincode,
        lat, lng, is_available: true,
        active_task_count: 0, completed_tasks: 0,
        fcm_token: "", created_at: serverTimestamp(),
      });

      // 3. Set session cookie
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/volunteer-session", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        headers: { "Content-Type": "application/json" },
      });

      // 4. Store locally
      localStorage.setItem("resq-volunteer-id", cred.user.uid);
      localStorage.setItem("resq-volunteer-name", name);

      // 5. Send notifications — awaiting for debug, can change to fire-and-forget later
      console.log("=== CALLING WELCOME NOTIFICATION ===");
      try {
        const response = await fetch(`${window.location.origin}/api/notify/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone,
            skills: skills,
            location_name
          })
        });
        const result = await response.json();
        console.log('Welcome email result:', result);
        if (result.email === "sent") {
          toast.success(`Welcome email sent to ${email}`, { icon: "📧", duration: 5000 });
        }
      } catch (err) {
        console.error('Welcome email failed:', err);
      }

      toast.success("Welcome to ResQ! Registration successful", { icon: "🎉", duration: 4000 });

      // 6. Redirect immediately
      router.push("/volunteer/dashboard");

    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please login instead.");
      } else if (err?.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      }
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (isDemoMode) {
        localStorage.setItem("resq-volunteer-name", email.split("@")[0]);
        router.push("/volunteer/dashboard");
        return;
      }
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const volDoc = await getDoc(doc(db, "volunteers", cred.user.uid));
      if (!volDoc.exists()) { await auth.signOut(); throw new Error("No volunteer account found — please register first"); }

      // Set session cookie
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/volunteer-session", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("resq-volunteer-id", cred.user.uid);
      localStorage.setItem("resq-volunteer-name", volDoc.data()?.name || email.split("@")[0]);

      router.push("/volunteer/dashboard");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      const volDoc = await getDoc(doc(db, "volunteers", cred.user.uid));
      if (volDoc.exists()) {
        const idToken = await cred.user.getIdToken();
        await fetch("/api/auth/volunteer-session", {
          method: "POST", body: JSON.stringify({ idToken }),
          headers: { "Content-Type": "application/json" },
        });
        localStorage.setItem("resq-volunteer-id", cred.user.uid);
        localStorage.setItem("resq-volunteer-name", volDoc.data()?.name || cred.user.displayName || "");
        router.push("/volunteer/dashboard");
      } else {
        setName(cred.user.displayName || "");
        setEmail(cred.user.email || "");
        setTab("register");
        setError("Please complete your profile to continue");
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Google sign-in failed"); }
    finally { setLoading(false); }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 py-10">
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4">
              <ResQLogo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-google-grey-900 font-display">ResQ Volunteer</h1>
            <p className="text-google-grey-600 text-sm mt-1">Join the network. Make a difference.</p>
          </div>

        <div className="bg-white border border-google-grey-200 rounded-2xl overflow-hidden shadow-md3-2">
          {/* Tabs */}
          <div className="flex border-b border-google-grey-200">
            {(["register", "login"] as AuthTab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-medium transition-all ${tab === t ? "bg-white text-google-blue border-b-2 border-google-blue" : "text-google-grey-500 hover:text-google-grey-700"}`}>
                {t === "register" ? "Register" : "Login"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {isDemoMode && (
              <div className="mb-5 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-google-yellow text-xs text-center">
                ⚡ Demo mode — any email/password works
              </div>
            )}

            {tab === "register" ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-google-grey-700 text-xs">Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" required className="border-google-grey-300 text-google-grey-900 placeholder:text-google-grey-400 focus:border-google-blue h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-google-grey-700 text-xs">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="border-google-grey-300 text-google-grey-900 placeholder:text-google-grey-400 focus:border-google-blue h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-google-grey-700 text-xs">Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" required className="border-google-grey-300 text-google-grey-900 placeholder:text-google-grey-400 focus:border-google-blue h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-google-grey-700 text-xs">Password</Label>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="border-google-grey-300 text-google-grey-900 placeholder:text-google-grey-400 focus:border-google-blue h-10 pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-google-grey-400 hover:text-google-grey-700">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-google-grey-700 text-xs">Skills</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SKILL_OPTIONS.map((s) => (
                      <label key={s} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${skills.includes(s) ? "bg-blue-50 border-google-blue/30 text-google-blue" : "bg-white border-google-grey-200 text-google-grey-600 hover:border-google-grey-300"}`}>
                        <Checkbox checked={skills.includes(s)} onCheckedChange={() => toggleSkill(s)} className="border-google-grey-300 data-[state=checked]:bg-google-blue data-[state=checked]:border-google-blue" />
                        <span className="text-xs">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{border:'1px solid #E8EAED', borderRadius:12, padding:20, margin:'16px 0'}}>
                  <h3 style={{color:'#3C4043', marginBottom:16, fontSize:16, fontWeight:500}}>
                    📍 Your Location
                  </h3>

                  {/* City input */}
                  <div style={{marginBottom:16}}>
                    <label style={{display:'block', color:'#5F6368', fontSize:13, marginBottom:6, fontWeight:500}}>
                      City / Town / Village *
                    </label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value)
                        // Auto-lookup coordinates as user types
                        const coords = getCoordsFromCity(e.target.value)
                        if (coords) {
                          setLat(coords.lat)
                          setLng(coords.lng)
                        }
                      }}
                      placeholder="e.g. Mumbai, Patna, Coimbatore..."
                      required
                      style={{
                        width:'100%',
                        padding:'12px 16px',
                        border:'1px solid #E8EAED',
                        borderRadius:8,
                        fontSize:16,
                        outline:'none',
                        boxSizing:'border-box',
                        transition:'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor='#1A73E8'}
                      onBlur={(e) => e.target.style.borderColor='#E8EAED'}
                    />
                  </div>

                  {/* State dropdown */}
                  <div style={{marginBottom:16}}>
                    <label style={{display:'block', color:'#5F6368', fontSize:13, marginBottom:6, fontWeight:500}}>
                      State *
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      required
                      style={{
                        width:'100%',
                        padding:'12px 16px',
                        border:'1px solid #E8EAED',
                        borderRadius:8,
                        fontSize:16,
                        background:'white',
                        cursor:'pointer',
                        outline:'none',
                        boxSizing:'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor='#1A73E8'}
                      onBlur={(e) => e.target.style.borderColor='#E8EAED'}
                    >
                      <option value=''>-- Select your state --</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pincode */}
                  <div style={{marginBottom:16}}>
                    <label style={{display:'block', color:'#5F6368', fontSize:13, marginBottom:6, fontWeight:500}}>
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setPincode(val)
                        // Fetch coordinates from pincode using internal proxy API
                        if (val.length === 6) {
                          fetch(`/api/geocode?address=${val}`, { cache: 'no-store' })
                            .then(r => r.json())
                            .then(data => {
                              if (data.results?.[0]?.geometry?.location) {
                                const {lat: pLat, lng: pLng} = data.results[0].geometry.location
                                setLat(pLat)
                                setLng(pLng)
                                if (!cityInput) {
                                  const cityComponent = data.results[0].address_components?.find(
                                    (c: any) => c.types.includes('locality')
                                  )
                                  if (cityComponent) setCityInput(cityComponent.long_name)
                                }
                              }
                            })
                            .catch(() => {})
                        }
                      }}
                      placeholder="e.g. 400001"
                      maxLength={6}
                      style={{
                        width:'100%',
                        padding:'12px 16px',
                        border:'1px solid #E8EAED',
                        borderRadius:8,
                        fontSize:16,
                        outline:'none',
                        boxSizing:'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor='#1A73E8'}
                      onBlur={(e) => e.target.style.borderColor='#E8EAED'}
                    />
                    <p style={{margin:'4px 0 0', color:'#9AA0A6', fontSize:12}}>
                      Enter your 6-digit PIN code for precise location
                    </p>
                  </div>

                  {/* Location confirmation box */}
                  {lat && lng && (
                    <div style={{background:'#E6F4EA', borderRadius:8, padding:12, display:'flex', alignItems:'flex-start', gap:10}}>
                      <span style={{fontSize:20}}>✅</span>
                      <div>
                        <p style={{margin:0, color:'#188038', fontWeight:500, fontSize:14}}>Location confirmed</p>
                        <p style={{margin:'4px 0 0', color:'#5F6368', fontSize:13}}>
                          {cityInput}{selectedState ? `, ${selectedState}` : ''}{pincode ? ` — ${pincode}` : ''}
                        </p>
                        <p style={{margin:'2px 0 0', color:'#9AA0A6', fontSize:11}}>
                          Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Helper text when no location yet */}
                  {!lat && !lng && (
                    <div style={{background:'#FFF3E0', borderRadius:8, padding:12, display:'flex', alignItems:'center', gap:8}}>
                      <span>ℹ️</span>
                      <p style={{margin:0, color:'#E65100', fontSize:13}}>
                        Enter your city name or PIN code above to set your location.
                        This helps coordinators assign you to nearby tasks.
                      </p>
                    </div>
                  )}
                </div>

                {error && <p className="text-xs text-google-red">{error}</p>}
                {((!lat || !lng) && tab === "register") && (
                  <p className="text-xs text-google-red text-center font-medium">Please enter your city, state and PIN code to continue</p>
                )}
                <Button type="submit" disabled={loading || !lat || !lng} className="w-full h-10 bg-google-blue hover:bg-google-blue-hover text-white border-0 rounded-full disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {loading ? "Registering…" : "Register"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-google-grey-700 text-xs">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="border-google-grey-300 text-google-grey-900 placeholder:text-google-grey-400 focus:border-google-blue h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-google-grey-700 text-xs">Password</Label>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="border-google-grey-300 text-google-grey-900 placeholder:text-google-grey-400 focus:border-google-blue h-10 pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-google-grey-400 hover:text-google-grey-700">
                      {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-google-red">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full h-10 bg-google-blue hover:bg-google-blue-hover text-white border-0 rounded-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-google-grey-200" /><span className="text-xs text-google-grey-500">or</span><div className="flex-1 h-px bg-google-grey-200" />
                </div>
                <Button type="button" onClick={handleGoogle} disabled={loading || isDemoMode} variant="outline" className="w-full h-10 border-google-grey-300 text-google-grey-700 hover:bg-google-grey-50 rounded-full">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Continue with Google
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VolunteerAuthPage() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={["places", "geometry", "visualization"]}>
      <VolunteerAuthContent />
    </APIProvider>
  );
}
