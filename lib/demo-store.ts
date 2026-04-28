import { Need, Volunteer, Assignment, NeedType, SkillType } from "@/types/database";

// ─── Demo Mode Detection ──────────────────────────────────────────────────────
export function isDemoMode(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  return !key || key.trim() === "";
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedNeeds: Need[] = [
  { id: "n1", raw_text: "Severe flooding in Andheri East, Mumbai. 200 families stranded on rooftops.", location_name: "Andheri East, Mumbai", lat: 19.1197, lng: 72.8464, need_type: "Rescue", urgency_score: 95, affected_count: 200, status: "pending", report_count: 1, description: "Severe flooding with 200+ families stranded on rooftops. Urgent rescue and medical assistance needed.", source: "whatsapp", created_at: new Date(Date.now() - 3600000).toISOString(), suggested_skills: ["Rescue", "Medical"] },
  { id: "n2", raw_text: "Medical camp urgently needed in Velachery, Chennai. Dengue outbreak.", location_name: "Velachery, Chennai", lat: 12.9815, lng: 80.2180, need_type: "Medical", urgency_score: 88, affected_count: 150, status: "pending", report_count: 1, description: "Dengue outbreak affecting 150 residents with no nearby hospital access.", source: "web", created_at: new Date(Date.now() - 7200000).toISOString(), suggested_skills: ["Medical"] },
  { id: "n3", raw_text: "Food supplies exhausted at relief camp in Patna. 500 displaced persons.", location_name: "Kankarbagh, Patna", lat: 25.5940, lng: 85.1376, need_type: "Food", urgency_score: 92, affected_count: 500, status: "pending", report_count: 1, description: "Relief camp food supplies exhausted. 500 displaced including children and elderly without food for 24 hours.", source: "voice", created_at: new Date(Date.now() - 1800000).toISOString(), suggested_skills: ["Food Distribution", "Logistics"] },
  { id: "n4", raw_text: "Clean water shortage in Bhopal slum. 300 families on contaminated well.", location_name: "Jehangirabad, Bhopal", lat: 23.2599, lng: 77.4126, need_type: "Water", urgency_score: 85, affected_count: 300, status: "pending", report_count: 1, description: "Water contamination in slum area with cholera cases. 300 families affected.", source: "web", created_at: new Date(Date.now() - 5400000).toISOString(), suggested_skills: ["Logistics", "Medical"] },
  { id: "n5", raw_text: "School building partially collapsed in Guwahati earthquake.", location_name: "Dispur, Guwahati", lat: 26.1445, lng: 91.7362, need_type: "Shelter", urgency_score: 72, affected_count: 80, status: "assigned", report_count: 1, description: "School collapse from earthquake. 80 students need shelter and education continuity.", source: "ocr", created_at: new Date(Date.now() - 86400000).toISOString(), assigned_volunteer_id: "v2", suggested_skills: ["Construction", "Education"] },
  { id: "n6", raw_text: "Clothing and blankets needed in Shimla. Cold wave, 120 homeless.", location_name: "Mall Road, Shimla", lat: 31.1048, lng: 77.1734, need_type: "Clothing", urgency_score: 68, affected_count: 120, status: "pending", report_count: 1, description: "Cold wave emergency. 120 homeless persons need warm clothing and blankets.", source: "web", created_at: new Date(Date.now() - 10800000).toISOString(), suggested_skills: ["Logistics"] },
  { id: "n7", raw_text: "Sanitation destroyed by cyclone in Puri. 400 residents at risk.", location_name: "Grand Road, Puri", lat: 19.8135, lng: 85.8312, need_type: "Sanitation", urgency_score: 65, affected_count: 400, status: "pending", report_count: 1, description: "Cyclone-destroyed sanitation. 400 residents at health risk.", source: "whatsapp", created_at: new Date(Date.now() - 14400000).toISOString(), suggested_skills: ["Sanitation", "Construction"] },
  { id: "n8", raw_text: "Bridge collapsed on NH-44 near Hyderabad. 50 vehicles stranded.", location_name: "Shamshabad, Hyderabad", lat: 17.2403, lng: 78.4294, need_type: "Infrastructure", urgency_score: 78, affected_count: 50, status: "pending", report_count: 1, description: "Bridge collapse on national highway. 50 vehicles stranded.", source: "web", created_at: new Date(Date.now() - 9000000).toISOString(), suggested_skills: ["Construction", "Logistics"] },
  { id: "n9", raw_text: "Tribal village in Kerala cut off after landslide. 60 families need drops.", location_name: "Wayanad, Kerala", lat: 11.6854, lng: 76.1320, need_type: "Food", urgency_score: 90, affected_count: 60, status: "pending", report_count: 1, description: "Landslide-isolated tribal village. 60 families need aerial supply drops.", source: "voice", created_at: new Date(Date.now() - 4500000).toISOString(), suggested_skills: ["Logistics", "Rescue"] },
  { id: "n10", raw_text: "Education support needed in Kolkata. 200 children out of school.", location_name: "Salt Lake, Kolkata", lat: 22.5726, lng: 88.4497, need_type: "Education", urgency_score: 42, affected_count: 200, status: "resolved", report_count: 1, description: "Post-flood education disruption. 200 children need temporary schooling.", source: "web", created_at: new Date(Date.now() - 172800000).toISOString(), suggested_skills: ["Education"] },
];

const seedVolunteers: Volunteer[] = [
  { id: "v1", name: "Dr. Priya Sharma", phone: "+919876543210", email: "priya@example.com", skills: ["Medical", "Education"], lat: 19.0760, lng: 72.8777, location_name: "Mumbai", is_available: true, active_task_count: 0, created_at: new Date().toISOString(), completed_tasks: 12 },
  { id: "v2", name: "Rajesh Kumar", phone: "+919876543211", email: "rajesh@example.com", skills: ["Construction", "Logistics"], lat: 28.6139, lng: 77.2090, location_name: "Delhi", is_available: true, active_task_count: 1, created_at: new Date().toISOString(), completed_tasks: 7 },
  { id: "v3", name: "Ananya Reddy", phone: "+919876543212", email: "ananya@example.com", skills: ["Food Distribution", "Logistics"], lat: 17.3850, lng: 78.4867, location_name: "Hyderabad", is_available: true, active_task_count: 0, created_at: new Date().toISOString(), completed_tasks: 15 },
  { id: "v4", name: "Mohammed Irfan", phone: "+919876543213", email: "irfan@example.com", skills: ["Medical", "Tech"], lat: 13.0827, lng: 80.2707, location_name: "Chennai", is_available: true, active_task_count: 0, created_at: new Date().toISOString(), completed_tasks: 4 },
  { id: "v5", name: "Sunita Devi", phone: "+919876543214", email: "sunita@example.com", skills: ["Food Distribution", "Education", "Logistics"], lat: 25.6093, lng: 85.1376, location_name: "Patna", is_available: true, active_task_count: 0, created_at: new Date().toISOString(), completed_tasks: 9 },
  { id: "v6", name: "Arun Nair", phone: "+919876543215", email: "arun@example.com", skills: ["Rescue", "Medical", "Logistics"], lat: 10.8505, lng: 76.2711, location_name: "Kerala", is_available: false, active_task_count: 2, created_at: new Date().toISOString(), completed_tasks: 22 },
  { id: "v7", name: "Kavitha Iyer", phone: "+919876543216", email: "kavitha@example.com", skills: ["Sanitation", "Construction"], lat: 12.9716, lng: 77.5946, location_name: "Bengaluru", is_available: true, active_task_count: 0, created_at: new Date().toISOString(), completed_tasks: 5 },
  { id: "v8", name: "Deepak Mishra", phone: "+919876543217", email: "deepak@example.com", skills: ["Education", "Tech", "Logistics"], lat: 22.5726, lng: 88.3639, location_name: "Kolkata", is_available: true, active_task_count: 0, created_at: new Date().toISOString(), completed_tasks: 3 },
];

// ─── Demo Store Class ─────────────────────────────────────────────────────────
class DemoStore {
  needs: Need[] = [...seedNeeds];
  volunteers: Volunteer[] = [...seedVolunteers];
  assignments: Assignment[] = [
    { id: "a1", need_id: "n5", volunteer_id: "v2", volunteer_name: "Rajesh Kumar", need_title: "Shelter — Dispur, Guwahati", matched_at: new Date(Date.now() - 43200000).toISOString(), status: "in_progress", ai_reasoning: "Rajesh Kumar has Construction skills critical for the earthquake-damaged school building and is based in Delhi with good logistics access to Guwahati.", completed_at: null },
    { id: "a2", need_id: "n10", volunteer_id: "v8", volunteer_name: "Deepak Mishra", need_title: "Education — Salt Lake, Kolkata", matched_at: new Date(Date.now() - 172800000).toISOString(), status: "completed", ai_reasoning: "Deepak Mishra has Education and Tech skills ideal for setting up temporary digital classrooms in Kolkata.", completed_at: new Date(Date.now() - 86400000).toISOString() },
  ];

  addNeed(need: Omit<Need, "id" | "created_at">): Need {
    const n: Need = { ...need, id: `n${Date.now()}`, created_at: new Date().toISOString() };
    this.needs.unshift(n);
    return n;
  }

  addVolunteer(vol: Omit<Volunteer, "id" | "created_at">): Volunteer {
    const v: Volunteer = { ...vol, id: `v${Date.now()}`, created_at: new Date().toISOString() };
    this.volunteers.push(v);
    return v;
  }

  addAssignment(a: Omit<Assignment, "id" | "matched_at">): Assignment {
    const asgn: Assignment = { ...a, id: `a${Date.now()}`, matched_at: new Date().toISOString() };
    this.assignments.push(asgn);
    return asgn;
  }

  getNeedById(id: string) { return this.needs.find((n) => n.id === id); }
  getVolunteerById(id: string) { return this.volunteers.find((v) => v.id === id); }
  getAssignmentById(id: string) { return this.assignments.find((a) => a.id === id); }

  updateNeedStatus(id: string, status: Need["status"], volunteerId?: string) {
    const n = this.needs.find((x) => x.id === id);
    if (n) { n.status = status; if (volunteerId) n.assigned_volunteer_id = volunteerId; }
  }

  updateVolunteerAvailability(id: string, isAvailable: boolean) {
    const v = this.volunteers.find((x) => x.id === id);
    if (v) v.is_available = isAvailable;
  }

  updateAssignment(id: string, updates: Partial<Assignment>) {
    const a = this.assignments.find((x) => x.id === id);
    if (a) Object.assign(a, updates);
    return a;
  }

  getAvailableVolunteers() { return this.volunteers.filter((v) => v.is_available); }

  getAnalytics() {
    const needs_by_type: Record<string, number> = {};
    this.needs.forEach((n) => { const t = (n.need_type as string) || "Other"; needs_by_type[t] = (needs_by_type[t] || 0) + 1; });
    const completed = this.assignments.filter((a) => a.status === "completed");
    let avg = 0;
    if (completed.length > 0) {
      const times = completed.map((a) => { const n = this.getNeedById(a.need_id); if (!n || !a.completed_at) return 0; return (new Date(a.completed_at).getTime() - new Date(n.created_at).getTime()) / 60000; }).filter((t) => t > 0);
      if (times.length) avg = Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10;
    }
    return { total_needs: this.needs.length, pending_needs: this.needs.filter((n) => n.status === "pending").length, assigned_needs: this.needs.filter((n) => n.status === "assigned").length, resolved_needs: this.needs.filter((n) => n.status === "resolved").length, active_volunteers: this.volunteers.filter((v) => v.is_available).length, total_assignments: this.assignments.length, avg_response_time_minutes: avg, needs_by_type };
  }

  // Simple keyword-based extraction fallback
  simpleExtract(text: string): Omit<Need, "id" | "created_at" | "report_count" | "status"> {
    const lower = text.toLowerCase();
    const typeMap: Record<string, NeedType> = { flood: "Rescue", rescue: "Rescue", medical: "Medical", dengue: "Medical", food: "Food", water: "Water", shelter: "Shelter", cloth: "Clothing", sanit: "Sanitation", school: "Education", bridge: "Infrastructure", earthquake: "Rescue", cyclone: "Rescue", fire: "Rescue", landslide: "Rescue" };
    let need_type: NeedType = "Other";
    for (const [kw, t] of Object.entries(typeMap)) { if (lower.includes(kw)) { need_type = t; break; } }
    const numMatch = text.match(/(\d+)\s*(families|people|persons|residents|students|children)/i);
    const affected_count = numMatch ? parseInt(numMatch[1]) : 50;
    const locationPatterns = [/in\s+([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)/, /at\s+([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)/, /near\s+([A-Z][a-zA-Z\s]+)/];
    let location_name = "India";
    for (const p of locationPatterns) { const m = text.match(p); if (m) { location_name = m[1].trim(); break; } }
    const urgencyKeywords = ["stranded", "dying", "critical", "emergency", "immediate", "urgent", "collapse"];
    let urgency_score = 50;
    for (const kw of urgencyKeywords) { if (lower.includes(kw)) { urgency_score = Math.min(95, urgency_score + 15); } }
    const lat = 20.5 + (Math.random() * 10 - 5);
    const lng = 78.9 + (Math.random() * 10 - 5);
    return { raw_text: text, location_name, lat, lng, need_type, urgency_score, affected_count, description: text.slice(0, 200), source: "web", suggested_skills: [] };
  }

  // Simple volunteer matching fallback
  simpleMatch(need: Need, candidates: Volunteer[]) {
    const skillMap: Record<string, SkillType[]> = { Medical: ["Medical"], Rescue: ["Rescue", "Medical", "Logistics"], Food: ["Food Distribution", "Logistics"], Water: ["Logistics"], Shelter: ["Construction", "Logistics"], Clothing: ["Logistics"], Sanitation: ["Sanitation"], Education: ["Education"], Infrastructure: ["Construction", "Logistics", "Tech"] };
    const relevantSkills = skillMap[need.need_type as string] || [];
    return candidates.map((v) => {
      let score = 30;
      const matched = v.skills.filter((s) => relevantSkills.includes(s));
      score += matched.length * 25;
      score -= v.active_task_count * 10;
      if (need.lat && need.lng && v.lat && v.lng) { const dist = Math.sqrt(Math.pow(need.lat - v.lat, 2) + Math.pow(need.lng - v.lng, 2)); score -= Math.min(20, dist * 2); }
      score = Math.max(0, Math.min(100, Math.round(score)));
      return { volunteer_id: v.id, score, reasoning: `${v.name} has relevant skills [${matched.join(", ") || "general"}] for this ${need.need_type} need. Currently handling ${v.active_task_count} active task(s).` };
    }).sort((a, b) => b.score - a.score).slice(0, 5);
  }
}

// Singleton persisted across hot reloads
const g = global as unknown as { __demoStore?: DemoStore };
if (!g.__demoStore) g.__demoStore = new DemoStore();
export const demoStore = g.__demoStore;
