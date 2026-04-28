"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Need } from "@/types/database";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";

// ─── Urgency helpers ──────────────────────────────────────────────────────────
function urgencyColor(score: number) {
  if (score > 75) return "#D93025";
  if (score >= 40) return "#F29900";
  return "#188038";
}

function pinSize(affectedCount: number) {
  return Math.max(28, Math.min(56, 28 + affectedCount / 20));
}

// ─── Custom SVG Pin ───────────────────────────────────────────────────────────
function UrgencyPin({ score, affectedCount }: { score: number; affectedCount: number }) {
  const color = urgencyColor(score);
  const size = pinSize(affectedCount);
  return (
    <div style={{ width: size, height: size, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: color, border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", cursor: "pointer", transition: "transform 0.15s ease" }} />
  );
}

// ─── Heatmap Layer (uses native Maps JS API) ───────────────────────────────────
function HeatmapLayer({ needs }: { needs: Need[] }) {
  const map = useMap();
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !window.google?.maps?.visualization) return;
    const points = needs
      .filter((n) => n.lat && n.lng)
      .map((n) => ({
        location: new google.maps.LatLng(n.lat!, n.lng!),
        weight: (n.urgency_score * n.affected_count) / 100,
      }));
    if (heatmapRef.current) {
      heatmapRef.current.setData(points);
    } else {
      heatmapRef.current = new google.maps.visualization.HeatmapLayer({ data: points, map, radius: 60, opacity: 0.8 });
    }
    return () => { heatmapRef.current?.setMap(null); heatmapRef.current = null; };
  }, [map, needs]);

  return null;
}

// ─── Cluster Markers Layer ────────────────────────────────────────────────────
function MarkerLayer({ needs, selectedNeed, onSelectNeed }: { needs: Need[]; selectedNeed: Need | null; onSelectNeed: (n: Need | null) => void }) {
  return (
    <>
      {needs.filter((n) => n.lat && n.lng).map((need) => (
        <AdvancedMarker key={need.id} position={{ lat: need.lat!, lng: need.lng! }} onClick={() => onSelectNeed(need)}>
          <UrgencyPin score={need.urgency_score} affectedCount={need.affected_count} />
        </AdvancedMarker>
      ))}
      {selectedNeed && selectedNeed.lat && selectedNeed.lng && (
        <InfoWindow position={{ lat: selectedNeed.lat, lng: selectedNeed.lng }} onCloseClick={() => onSelectNeed(null)}>
          <div style={{ fontFamily: "Inter, sans-serif", minWidth: 200, padding: "4px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ background: urgencyColor(selectedNeed.urgency_score), color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                {selectedNeed.urgency_score} · {selectedNeed.need_type}
              </span>
            </div>
            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 13, color: "#202124" }}>{selectedNeed.location_name}</p>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "#5F6368" }}>{selectedNeed.affected_count} affected · {selectedNeed.status}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#5F6368", lineHeight: 1.4 }}>{selectedNeed.description?.slice(0, 100)}…</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// ─── Main MapView ─────────────────────────────────────────────────────────────
interface MapViewProps {
  needs: Need[];
  selectedNeed: Need | null;
  onSelectNeed: (need: Need | null) => void;
}

export default function MapView({ needs, selectedNeed, onSelectNeed }: MapViewProps) {
  const [viewMode, setViewMode] = useState<"cluster" | "heatmap">("cluster");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const legend = [
    { label: "Critical (>75)", color: "#D93025" },
    { label: "Moderate (40-75)", color: "#F29900" },
    { label: "Low (<40)", color: "#188038" },
  ];

  if (!apiKey) {
    // Fallback map placeholder for demo mode
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="text-slate-400 text-sm">🗺️ Google Maps API key not configured</div>
        <div className="grid grid-cols-3 gap-3 px-6">
          {needs.filter((n) => n.lat && n.lng).map((need) => (
            <button key={need.id} onClick={() => onSelectNeed(need)}
              className={`text-left p-3 rounded-lg border transition-all ${selectedNeed?.id === need.id ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: urgencyColor(need.urgency_score) }} />
                <span className="text-xs font-medium text-white">{need.need_type}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{need.location_name}</p>
              <p className="text-[10px] text-slate-500">{need.affected_count} affected</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <APIProvider apiKey={apiKey} libraries={["visualization", "places", "geometry"]}>
        <Map
          defaultCenter={{ lat: 20.5937, lng: 78.9629 }}
          defaultZoom={5}
          mapId="resq-dark-map"
          gestureHandling="cooperative"
          disableDefaultUI={false}
          style={{ width: "100%", height: "100%" }}
        >
          {viewMode === "cluster" ? (
            <MarkerLayer needs={needs} selectedNeed={selectedNeed} onSelectNeed={onSelectNeed} />
          ) : (
            <HeatmapLayer needs={needs} />
          )}
        </Map>
      </APIProvider>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-lg p-3">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Urgency Level</p>
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-[11px] text-slate-300">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Toggle button */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {(["cluster", "heatmap"] as const).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${viewMode === mode ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
              {mode === "cluster" ? "📍 Cluster" : "🔥 Heatmap"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
