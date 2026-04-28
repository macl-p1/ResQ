// ─── Firestore Document Types ────────────────────────────────────────────────

export type NeedType =
  | "Rescue" | "Medical" | "Food" | "Water" | "Shelter"
  | "Clothing" | "Sanitation" | "Education" | "Infrastructure" | "Other";

export type NeedStatus = "pending" | "assigned" | "resolved";
export type NeedSource = "web" | "whatsapp" | "voice" | "ocr";

export type AssignmentStatus = "pending" | "accepted" | "in_progress" | "completed";

export const SKILL_OPTIONS = [
  "Medical", "Construction", "Food Distribution", "Education",
  "Logistics", "Tech", "Rescue", "Sanitation",
] as const;
export type SkillType = (typeof SKILL_OPTIONS)[number];

export interface Need {
  id: string;
  raw_text: string;
  location_name: string;
  lat: number | null;
  lng: number | null;
  need_type: NeedType | string;
  urgency_score: number;
  affected_count: number;
  status: NeedStatus;
  report_count: number;
  description: string;
  source: NeedSource;
  created_at: string;
  embedding?: number[];
  translated_text?: {
    hi?: string;
    ta?: string;
    te?: string;
    bn?: string;
  };
  assigned_volunteer_id?: string | null;
  ai_reasoning?: string | null;
  suggested_skills?: SkillType[];
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  skills: SkillType[];
  lat: number | null;
  lng: number | null;
  location_name?: string;
  is_available: boolean;
  active_task_count: number;
  fcm_token?: string | null;
  created_at: string;
  uid?: string;
  completed_tasks?: number;
}

export interface Assignment {
  id: string;
  need_id: string;
  volunteer_id: string;
  volunteer_name?: string;
  need_title?: string;
  matched_at: string;
  status: AssignmentStatus;
  ai_reasoning?: string | null;
  completed_at: string | null;
  volunteer_rating?: number | null;
}

export interface Admin {
  id: string;
  uid: string;
  email: string;
  name: string;
  created_at: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface AnalyticsData {
  total_needs: number;
  pending_needs: number;
  assigned_needs: number;
  resolved_needs: number;
  active_volunteers: number;
  total_assignments: number;
  avg_response_time_minutes: number;
  needs_by_type: Record<string, number>;
}

// ─── AI Extraction & Matching Types ─────────────────────────────────────────
export interface ExtractedNeed {
  location_name: string;
  lat: number;
  lng: number;
  need_type: NeedType;
  urgency_score: number;
  affected_count: number;
  description: string;
  suggested_skills: SkillType[];
}

export interface UrgencyResult {
  urgency_score: number;
  reasoning: string;
}

export interface VolunteerMatch {
  volunteer_id: string;
  score: number;
  reasoning: string;
}

export interface MatchResult {
  ranked: VolunteerMatch[];
  top_reasoning: string;
}
