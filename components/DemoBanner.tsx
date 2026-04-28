"use client";

export default function DemoBanner() {
  const isDemo = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!isDemo) return null;
  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2 text-amber-400 text-xs font-medium">
      <span>⚡</span>
      Running in demo mode — connect Firebase to enable live features
    </div>
  );
}
