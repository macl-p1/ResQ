import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function extractNeedFromText(rawText: string) {
  const prompt = `You are a crisis response AI. Extract information from this field report.
Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation:
{
  "location_name": "specific area name",
  "need_type": "one of: Food, Water, Medical, Shelter, Rescue, Sanitation, Logistics, Education",
  "affected_count": number,
  "description": "clear 1-2 sentence summary"
}
Field report: ${rawText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export async function matchVolunteers(need: any, volunteers: any[]) {
  if (!volunteers.length) return { ranked: [], top_reasoning: 'No volunteers available.' };

  const prompt = `You are an emergency response coordinator AI using Gemini 2.5 Flash.

CRISIS NEED:
- Type: ${need.need_type}
- Location: ${need.location_name}
- Urgency: ${need.urgency_score}/100
- People affected: ${need.affected_count}
- Description: ${need.description}

AVAILABLE VOLUNTEERS:
${volunteers.map((v: any, i: number) => `
${i + 1}. ID: ${v.id}
   Name: ${v.name}
   Skills: ${v.skills?.join(', ')}
   Location: ${v.location_name}
   Distance: ${v.distance_km ? v.distance_km.toFixed(1) + ' km away' : 'Unknown'}
   Active tasks: ${v.active_task_count || 0}
`).join('\n')}

Rank ALL volunteers by suitability. SCORING WEIGHTS (strictly follow these):
1. PROXIMITY (50% weight) — THE MOST IMPORTANT FACTOR. Volunteers closest to the crisis location MUST be ranked highest. A volunteer 10km away should score much higher than one 500km away even if the farther one has better skills.
2. SKILL MATCH (30% weight) — does volunteer have skills matching this crisis type?
3. WORKLOAD (20% weight) — prefer volunteers with fewer active tasks

CRITICAL RULE: Always prefer the NEAREST available volunteer. Distance is the dominant factor in emergency response — every minute counts.

Return ONLY valid JSON with NO markdown:
{
  "ranked": [
    {
      "volunteer_id": "exact id string",
      "score": number 0-100,
      "reasoning": "2-3 sentence explanation mentioning their distance, skills and availability"
    }
  ],
  "top_reasoning": "A detailed paragraph explaining why the top volunteer is the best match, emphasizing their proximity to the crisis location, relevant skills, and current availability"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
