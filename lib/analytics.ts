// Firebase Analytics event wrappers
// All calls are no-ops when analytics is not available (demo mode / SSR)

async function getAnalytics() {
  try {
    const { getAnalyticsInstance } = await import("./firebase");
    return await getAnalyticsInstance();
  } catch {
    return null;
  }
}

async function logEvent(eventName: string, params?: Record<string, unknown>) {
  const analytics = await getAnalytics();
  if (!analytics) return;
  try {
    const { logEvent: fbLogEvent } = await import("firebase/analytics");
    fbLogEvent(analytics, eventName, params);
  } catch {
    // Silently fail in demo/SSR
  }
}

export async function logNeedReported(source: string, urgencyScore: number) {
  await logEvent("need_reported", { source, urgency_score: urgencyScore });
}

export async function logVolunteerMatched(needType: string, distanceKm: number) {
  await logEvent("volunteer_matched", { need_type: needType, distance_km: distanceKm });
}

export async function logTaskCompleted(volunteerId: string, timeToCompleteMinutes: number) {
  await logEvent("task_completed", { volunteer_id: volunteerId, time_to_complete_minutes: timeToCompleteMinutes });
}

export async function logOcrUsed(confidence: number) {
  await logEvent("ocr_used", { confidence });
}

export async function logVoiceUsed(language: string) {
  await logEvent("voice_report_used", { language });
}

export async function logTranslationUsed(targetLang: string) {
  await logEvent("translation_used", { target_lang: targetLang });
}
