import { useEffect, useState } from "react";
import { apiUrl } from "../../lib/api";
import { adminFetch } from "../../lib/adminAuth";
import type { AssetSummary } from "./types";

export const StatsDashboard = (): JSX.Element => {
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await adminFetch(apiUrl("/api/heritage-assets/summary"));
        if (cancelled) return;
        if (res.ok) setSummary(await res.json());
        else setFailed(true);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = summary
    ? [
        { label: "Total Assets", value: summary.total_assets, color: "text-brand" },
        { label: "With Geometry", value: summary.assets_with_geometry, color: "text-emerald-500" },
        { label: "Point Features", value: summary.point_assets, color: "text-blue-400" },
        { label: "Line Features", value: summary.line_assets, color: "text-amber-400" },
        { label: "Polygon Features", value: summary.polygon_assets, color: "text-purple-400" },
      ]
    : [];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-[#111]">Dashboard</h2>
          <p className="text-xs text-black/50 mt-0.5">Overview of heritage asset records</p>
        </div>
        {summary?.newest_updated_at && (
          <p className="text-[10px] uppercase font-bold text-black/40">
            Last updated {new Date(summary.newest_updated_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-black/5 p-5 animate-pulse">
                <div className="h-3 w-16 bg-black/5 rounded mb-3" />
                <div className="h-7 w-12 bg-black/5 rounded" />
              </div>
            ))
          : failed
            ? (
              <div className="col-span-full bg-white rounded-xl border border-black/5 p-5 text-xs text-black/50">
                Statistics are unavailable right now — the summary endpoint could not be reached.
              </div>
            )
            : cards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-black/5 p-5 hover:shadow-md transition-shadow">
                <p className="text-[10px] uppercase font-bold text-black/40 mb-2">{card.label}</p>
                <p className={`text-3xl font-black ${card.color}`}>{card.value.toLocaleString()}</p>
              </div>
            ))}
      </div>
    </div>
  );
};
