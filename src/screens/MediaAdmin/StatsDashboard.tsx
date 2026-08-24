import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../lib/api";
import { adminFetch } from "../../lib/adminAuth";
import type { AssetSummary } from "./types";

const pct = (part: number, whole: number): number =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

export const StatsDashboard = (): JSX.Element => {
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await adminFetch(apiUrl("/api/heritage-assets/summary"));
      if (res.ok) setSummary(await res.json());
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = summary
    ? [
        {
          label: "Total assets",
          value: summary.total_assets.toLocaleString(),
          note: "Catalogue records",
        },
        {
          label: "With geometry",
          value: summary.assets_with_geometry.toLocaleString(),
          note: `${pct(summary.assets_with_geometry, summary.total_assets)}% georeferenced`,
        },
        {
          label: "Point features",
          value: summary.point_assets.toLocaleString(),
          note: `${pct(summary.point_assets, summary.assets_with_geometry)}% of located`,
        },
        {
          label: "Line features",
          value: summary.line_assets.toLocaleString(),
          note: `${pct(summary.line_assets, summary.assets_with_geometry)}% of located`,
        },
        {
          label: "Polygon features",
          value: summary.polygon_assets.toLocaleString(),
          note: `${pct(summary.polygon_assets, summary.assets_with_geometry)}% of located`,
        },
      ]
    : [];

  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[13px] text-ink-soft">Overview</p>
          <h2 className="f-heading-4 text-ink mt-0.5">Dashboard</h2>
        </div>
        {summary?.newest_updated_at && (
          <p className="text-[13px] text-ink-soft tabular-nums">
            Updated {new Date(summary.newest_updated_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-px bg-hairline border border-hairline">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-5 animate-pulse">
                <div className="h-2.5 w-16 bg-paper-deep mb-4" />
                <div className="h-7 w-12 bg-paper-deep" />
              </div>
            ))
          : failed
            ? (
              <div className="col-span-full bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[13px] text-ink-soft leading-relaxed">
                  Statistics are unavailable — the summary endpoint could not be reached.
                </p>
                <button
                  type="button"
                  onClick={load}
                  className="shrink-0 f-caption px-4 py-2 border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house disabled:cursor-not-allowed"
                >
                  Retry
                </button>
              </div>
            )
            : cards.map((card) => (
                <div key={card.label} className="bg-white p-5 min-w-0">
                  <p className="text-[13px] text-ink-soft mb-3 truncate">{card.label}</p>
                  <p className="font-display font-light text-[34px] leading-none tracking-[-0.01em] text-ink tabular-nums">
                    {card.value}
                  </p>
                  <p className="mt-2.5 text-[12px] text-ink/40 tabular-nums truncate">{card.note}</p>
                </div>
              ))}
      </div>
    </div>
  );
};
