import React, { useMemo } from "react";
import type L from "leaflet";
import { categoryColor } from "../../../lib/categories";
import { cn } from "../../../lib/utils";
import type { LegendCategory } from "./LayerManager";

interface MapLegendProps {
  categories: LegendCategory[];
  onToggleCategory: (category: string) => void;
  flags: { density: boolean; zones: boolean; boundaries: boolean };
  darkMode?: boolean;
  mapRef: React.MutableRefObject<L.Map | null>;
}

/** The atlas key carries six voices at most -- the rest live in Layers. */
const MAX_LEGEND_CATEGORIES = 6;

/**
 * Legend symbol: the flat swatch. Deliberately a different symbol class
 * from the map marker — a key binds colour → word, it does not restate the
 * symbol. Pure category patch, one hairline, nothing else. Matches the
 * dot-bullet chip language used across the search overlay.
 */
function StampIcon({ category, hidden }: { category: string; hidden: boolean }) {
  const color = categoryColor(category);
  return (
    <span
      aria-hidden="true"
      className="block shrink-0"
      style={{
        width: 12,
        height: 12,
        background: color,
        border: "1px solid rgba(25,22,19,.5)",
        opacity: hidden ? 0.35 : 1,
      }}
    />
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-150 ease-house hover:bg-ground-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
    >
      {children}
    </button>
  );
}

export const MapLegend: React.FC<MapLegendProps> = ({
  categories,
  onToggleCategory,
  flags,
  mapRef,
}) => {
  /** Rank by presence on the canvas; the key speaks for the loudest six. */
  const ranked = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count),
    [categories]
  );
  const shown = useMemo(
    () => ranked.slice(0, MAX_LEGEND_CATEGORIES),
    [ranked]
  );
  const truncated = ranked.length > shown.length;

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  const hasContent =
    shown.length > 0 || flags.density || flags.zones || flags.boundaries;

  if (!hasContent) return null;

  return (
    <div className="absolute bottom-0 left-0 z-map-widget select-none font-sans">
      <div className="w-[680px] bg-white">
        <div className="px-4 pb-3 pt-3">
          {/* Header row */}
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="f-caption tracking-[0.04em] text-ink-soft">Key</p>
            {truncated && (
              <p className="f-caption text-ink-soft/60 tabular-nums">
                {shown.length} of {ranked.length} shown
              </p>
            )}
          </div>

          <div className="flex items-start gap-4">
            {/* Category grid: three across, two rows deep */}
            <div className="grid flex-1 grid-cols-3 gap-x-2">
              {shown.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onToggleCategory(cat.value)}
                  aria-pressed={!cat.hidden}
                  className="group flex w-full items-center gap-2.5 py-[5px] text-left transition-colors duration-150 ease-house hover:bg-ground-deep"
                >
                  <span
                    aria-hidden="true"
                    className="flex shrink-0 items-center justify-center"
                  >
                    <StampIcon category={cat.value} hidden={cat.hidden} />
                  </span>
                  <span
                    className={cn(
                      "f-caption flex-1 truncate transition-colors duration-200",
                      cat.hidden ? "text-ink-soft/50 line-through" : "text-ink"
                    )}
                  >
                    {cat.value}
                  </span>
                  <span className="f-number shrink-0 tabular-nums text-ink-soft">
                    {cat.count.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            {/* Surface overlays, stacked beside the grid */}
            {(flags.density || flags.zones) && (
              <div className="shrink-0 space-y-2 border-l border-hairline pl-3 pt-[6px]">
                {flags.density && (
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-3.5 shrink-0"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(228,0,43,0.05), rgba(228,0,43,0.65))",
                      }}
                    />
                    <span className="f-caption whitespace-nowrap text-ink-soft">
                      Density
                    </span>
                  </div>
                )}
                {flags.zones && (
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-3.5 shrink-0 border border-dashed border-ink-soft bg-ground-deep"
                    />
                    <span className="f-caption whitespace-nowrap text-ink-soft">
                      750 m zone
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer: site boundary left, zoom controls right */}
          <div className="mt-2.5 flex items-center justify-between border-t border-hairline/60 pt-2.5">
            {flags.boundaries ? (
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-0 w-3.5 shrink-0 border-t-2 border-ink-soft"
                />
                <span className="f-caption text-ink-soft">Site boundary</span>
              </div>
            ) : (
              <span aria-hidden="true" />
            )}

            <div className="flex items-stretch">
              <ZoomButton label="Zoom in" onClick={zoomIn}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </ZoomButton>
              <span aria-hidden="true" className="w-px bg-hairline" />
              <ZoomButton label="Zoom out" onClick={zoomOut}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M2 7h10" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </ZoomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MapLegend.displayName = "MapLegend";
