"use client";

import { useState } from "react";
import { SKILL_OPTIONS, SkillType } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, MapPin, Loader2, CheckCircle2, Phone, User, Navigation } from "lucide-react";

export default function VolunteerPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<SkillType[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkillToggle = (skill: SkillType) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Could not detect location. Please enter manually.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || skills.length === 0) {
      setError("Please fill in name, phone, and select at least one skill.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), skills, lat, lng }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-card border-green-500/20 dark:border-emerald-500/20">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-50 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome aboard!</h2>
            <p className="text-muted-foreground text-sm">
              Thank you, <span className="text-foreground font-semibold">{name}</span>. You&apos;re now registered as a ResQ volunteer. We&apos;ll match you with needs based on your skills and location.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <Card className="relative max-w-lg w-full glass-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl text-foreground">Volunteer Registration</CardTitle>
          <CardDescription className="text-muted-foreground">Join ResQ and help communities in need</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />Full Name
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50" />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-sm flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />Phone Number
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50" />
            </div>

            <div className="space-y-3">
              <Label className="text-foreground text-sm">Skills</Label>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <label key={skill} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${skills.includes(skill) ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground hover:border-muted-foreground/30"}`}>
                    <Checkbox checked={skills.includes(skill)} onCheckedChange={() => handleSkillToggle(skill)} className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <span className="text-xs font-medium">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />Location
              </Label>
              <Button type="button" onClick={detectLocation} disabled={locating} variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                {locating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                {lat && lng ? `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}` : locating ? "Detecting..." : "Auto-detect Location"}
              </Button>
              {!lat && !lng && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="number" step="any" placeholder="Latitude" onChange={(e) => setLat(parseFloat(e.target.value) || null)} className="bg-card border-border text-foreground text-xs placeholder:text-muted-foreground" />
                  <Input type="number" step="any" placeholder="Longitude" onChange={(e) => setLng(parseFloat(e.target.value) || null)} className="bg-card border-border text-foreground text-xs placeholder:text-muted-foreground" />
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/20">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {submitting ? "Registering..." : "Register as Volunteer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
