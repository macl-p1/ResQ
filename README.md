# ResQ — AI-Powered Crisis Resource Allocation

**Allocate resources. Save lives.**

## The Problem
When disasters strike, emergency response coordination is often chaotic, relying on manual matching of volunteers to needs across fragmented communication channels. Essential soft factors—like matching a Tamil-speaking volunteer to a local elder, or dispatching someone with sanitation training instead of just anyone nearby—are nearly impossible to process at scale. Additionally, field reports come in via scattered formats like WhatsApp audio, paper surveys, or text messages, creating a bottleneck for coordinators who must manually parse, translate, and prioritize them.

## Google Cloud Services Integration

| Service | Purpose | Why it's essential |
|---|---|---|
| **Google Maps Platform** | Real-time heatmap & routing | Visualizes crisis zones instantly and provides accurate Distance Matrix ETAs for volunteers. |
| **Google Cloud Vision** | OCR for paper surveys | Allows rapid digitization of hand-written field reports from areas without internet access. |
| **Google Cloud STT & TTS** | Voice reporting & audio playback | Enables illiterate or distressed individuals to report needs via WhatsApp audio; reads needs aloud for multitasking coordinators. |
| **Google Cloud Translate** | 5-language support | Breaks language barriers automatically translating regional reports (Hindi, Tamil, Telugu, Bengali) to English for centralized coordination. |
| **Firebase** | Realtime DB, Auth, FCM | Provides secure role-based access, instant UI updates across the country, and push notifications to volunteers without managing WebSockets. |
| **Google Analytics 4** | Event tracking | Measures platform impact: tracking average response times, matching efficiency, and resource utilization. |

## Architecture

```
User (WhatsApp/Voice/Web) 
       │
       ▼
[ Next.js 14 API Routes ] ──► [ Google Cloud STT/Vision/Translate ]
       │
       ▼
[ Gemini 2.5 Flash ] ──► (Extracts JSON + Ranks Volunteers)
       │
       ▼
[ Firebase Firestore ] ◄──► [ React/Next.js Frontends (Coordinator & Volunteer) ]
       │
       ▼
[ Google Maps Platform ] (Visualizes data, routes volunteers)
```

## Why AI is Essential Here
Rule-based matching systems cannot handle the complex, "soft" factors inherent in human crises. A volunteer with medical training is far more valuable for a dengue outbreak than a generic volunteer who happens to be 2km closer. A Tamil-speaking coordinator cannot process voice reports in Telugu without intelligent, context-aware translation. Only AI can parse messy, unstructured real-world data (like "bridge collapsed, need help fast") and instantly extract structured location, urgency, and skill requirements, drastically reducing the "time-to-dispatch."

## Scalability
ResQ is designed for massive scale during sudden disasters. Deployed on **Google Cloud Run**, it automatically scales from zero to thousands of instances during a crisis spike, ensuring the platform remains responsive. **Firebase Firestore** effortlessly handles millions of concurrent reads for real-time dashboard updates, while the **Firebase CDN** caches and serves the frontend globally.

---

## Setup Guide

### Environment Variables (`.env.local`)

```env
# Firebase Client (Get from Firebase Console -> Project Settings -> General)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-ABCDEF"

# Firebase Admin (Get from Project Settings -> Service Accounts -> Generate new private key)
# IMPORTANT: Replace actual newlines in the private key with \n
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...=\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-abc@your-project.iam.gserviceaccount.com"

# Google Cloud APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..." # Requires Maps JS API, Places API, Distance Matrix API
GOOGLE_GEMINI_API_KEY="AIzaSy..."           # Gemini 2.5 Flash for NLP extraction & matching
GOOGLE_CLOUD_TRANSLATE_KEY="AIzaSy..."

# Google Cloud Service Account (for Vision, TTS, STT)
GOOGLE_CLOUD_CLIENT_EMAIL="your-sa@your-project.iam.gserviceaccount.com"
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Twilio (Optional: for WhatsApp webhook)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="..."
```

#### Common Setup Errors
**Firebase Admin Key Formatting:**
If your server crashes on startup with Firebase Admin errors, ensure your `FIREBASE_ADMIN_PRIVATE_KEY` is a single continuous string in `.env.local` where all physical newlines are replaced with the literal characters `\n`.

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Seed the database:**
   *(Ensure your `.env.local` is configured first)*
   ```bash
   npx ts-node firebase/seed.ts
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   *Note: Firebase Cloud Messaging (FCM) requires HTTPS. In dev mode, push notifications will silently fail and log a warning.*

### Cloud Run Deployment

Build and push using Docker:

```bash
# Build image
docker build -t gcr.io/YOUR_PROJECT/resq-app .

# Push and deploy
gcloud run deploy resq-app \
  --image gcr.io/YOUR_PROJECT/resq-app \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 1Gi
```

---

## 5-Minute Demo Script

1. **Landing Page:** Show the animated role-selection screen highlighting the dual-sided nature of the platform.
2. **Coordinator Login:** Click Coordinator, use the seeded admin credentials (`admin@resq.org` / `ResQ2026!`) to log in.
3. **The Dashboard:** Showcase the live Google Map with clustered urgency pins. Toggle to Heatmap view to show crisis density.
4. **Ingest a Need (Voice):** Open the "Report a Need" drawer. Use the Voice tab to record a simulated emergency in Hindi/Tamil. Watch as STT transcribes it, and Gemini AI extracts the location, assigns an urgency score, and translates the description.
5. **AI Matching:** Click "Find Volunteer" on a critical need. Show the Gemini AI loading animation as it analyzes candidates. Explain the Distance Matrix ETA and the "reasoning" paragraph where Gemini explains *why* it picked the top volunteer (e.g., matching medical skills). Click Assign.
6. **Volunteer View:** Switch to the Volunteer mobile layout (or log in on a phone). Show the task appearing in "My Tasks". Walk through the Accept -> Start -> Complete lifecycle.
7. **Analytics:** Finally, navigate to the Analytics page to see the real-time Google-styled charts reflecting the newly completed task and updated average response times.
