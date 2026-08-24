import React, { useState } from "react";
import type { Basemap } from "./MapView";
import { categoryColor } from "../../../lib/categories";
import { cn } from "../../../lib/utils";

export interface LayerFlags {
  assets: boolean;
  boundaries: boolean;
  zones: boolean;
  density: boolean;
}

export interface LegendCategory {
  value: string;
  count: number;
  color: string;
  hidden: boolean;
}

interface LayerManagerProps {
  basemap: Basemap;
  onBasemapChange: (bm: Basemap) => void;
  flags: LayerFlags;
  onToggleFlag: (key: keyof LayerFlags) => void;
  referenceLayers: Array<{ key: string; label: string; active: boolean }>;
  onToggleReference: (key: string) => void;
  legend: {
    categories: LegendCategory[];
    onToggleCategory: (category: string) => void;
  };
  shareUrl: string;
  onExport: (format: "csv" | "geojson" | "kml") => void;
}

const BASEMAPS: Array<{ key: Basemap; label: string }> = [
  { key: "grey", label: "Grey" },
  { key: "satellite", label: "Satellite" },
];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="f-caption px-4 pb-2 uppercase tracking-[0.16em] text-ink-soft">
    {children}
  </p>
);

function ToggleRow({
  label,
  active,
  dot,
  onToggle,
}: {
  label: string;
  active: boolean;
  dot?: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className="group flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-200 ease-house hover:bg-ground-deep"
    >
      <span
        aria-hidden="true"
        className={cn(
          "block h-2.5 w-2.5 shrink-0 rounded-full border transition-colors duration-200 ease-house",
          dot ? "" : active ? "border-ink bg-ink" : "border-ink-soft group-hover:border-ink"
        )}
        style={dot ? { backgroundColor: active ? dot : "transparent", borderColor: dot } : undefined}
      />
      <span
        className={cn(
          "f-caption flex-1 truncate transition-colors duration-200 ease-house",
          active ? "text-ink" : "text-ink-soft group-hover:text-ink"
        )}
      >
        {label}
      </span>
    </button>
  );
}

/** Legend symbol: flat colour swatch — a different class from the marker. */
function StampIcon({ category, hidden }: { category: string; hidden: boolean }) {
  const color = categoryColor(category);
  return (
    <span
      aria-hidden="true"
      className="block shrink-0"
      style={{
        width: 13,
        height: 13,
        background: color,
        border: "1px solid rgba(25,22,19,.5)",
        opacity: hidden ? 0.35 : 1,
      }}
    />
  );
}

function KeyRow({ cat, onToggle }: { cat: LegendCategory; onToggle: (c: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(cat.value)}
      aria-pressed={!cat.hidden}
      title={cat.hidden ? `Show ${cat.value}` : `Hide ${cat.value}`}
      className="group flex w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150 ease-house hover:bg-ground-deep"
    >
      <span aria-hidden="true" className="flex shrink-0 items-center justify-center">
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
  );
}

export const LayerManagerBody: React.FC<LayerManagerProps> = ({
  basemap,
  onBasemapChange,
  flags,
  onToggleFlag,
  referenceLayers,
  onToggleReference,
  legend,
  shareUrl,
  onExport,
}) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <section aria-label="Base map" className="border-b border-hairline py-3">
        <SectionLabel>Base map</SectionLabel>
        {BASEMAPS.map((opt) => (
          <ToggleRow
            key={opt.key}
            label={opt.label}
            active={basemap === opt.key}
            onToggle={() => onBasemapChange(opt.key)}
          />
        ))}
      </section>

      <section aria-label="Map layers" className="border-b border-hairline py-3">
        <SectionLabel>Layers</SectionLabel>
        <ToggleRow label="Heritage assets" active={flags.assets} onToggle={() => onToggleFlag("assets")} />
        <ToggleRow label="Site boundaries" active={flags.boundaries} onToggle={() => onToggleFlag("boundaries")} />
        <ToggleRow label="Proximity zones" active={flags.zones} onToggle={() => onToggleFlag("zones")} />
        <ToggleRow label="Density field" active={flags.density} onToggle={() => onToggleFlag("density")} />
        {referenceLayers.map((layer) => (
          <ToggleRow
            key={layer.key}
            label={layer.label}
            active={layer.active}
            onToggle={() => onToggleReference(layer.key)}
          />
        ))}
      </section>

      {legend.categories.length > 0 && (
        <section aria-label="Key" className="border-b border-hairline py-3">
          <SectionLabel>Key</SectionLabel>
          {legend.categories.map((cat) => (
            <KeyRow key={cat.value} cat={cat} onToggle={legend.onToggleCategory} />
          ))}
          <div className="space-y-2 px-4 pb-1 pt-3">
            {flags.density && (
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-4 shrink-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(228,0,43,0.05), rgba(228,0,43,0.65))",
                  }}
                />
                <span className="f-caption text-ink-soft">Density</span>
              </div>
            )}
            {flags.zones && (
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-4 shrink-0 border border-dashed border-ink-soft bg-ground-deep"
                />
                <span className="f-caption text-ink-soft">750 m zone</span>
              </div>
            )}
            {flags.boundaries && (
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-0 w-4 shrink-0 border-t-2 border-ink-soft" />
                <span className="f-caption text-ink-soft">Site boundary</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex shrink-0 items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" fill="#E4002B" />
                  <rect x="3" y="3" width="18" height="18" fill="none" stroke="#1A1A1A" strokeWidth="1" />
                  <rect x="0.5" y="0.5" width="23" height="23" fill="none" stroke="#C2913B" strokeWidth="1.4" />
                </svg>
              </span>
              <span className="f-caption text-ink-soft">World Heritage</span>
            </div>
          </div>
        </section>
      )}

      <section aria-label="Data" className="py-3">
        <SectionLabel>Data</SectionLabel>
        <button
          type="button"
          onClick={copyLink}
          className="group flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors duration-150 ease-house hover:bg-ground-deep"
        >
          <span className="f-caption text-ink">
            {copied ? "Link copied" : "Share this view"}
          </span>
          <span className="f-number text-ink-soft">{copied ? "\u2713" : "\u2197"}</span>
        </button>
        {(
          [
            ["csv", "Export CSV"],
            ["geojson", "Export GeoJSON"],
            ["kml", "Export KML"],
          ] as const
        ).map(([format, label]) => (
          <button
            key={format}
            type="button"
            onClick={() => onExport(format)}
            className="group flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors duration-150 ease-house hover:bg-ground-deep"
          >
            <span className="f-caption text-ink">{label}</span>
            <span aria-hidden="true" className="f-number text-ink-soft">{"\u2193"}</span>
          </button>
        ))}
      </section>
    </>
  );
};

LayerManagerBody.displayName = "LayerManagerBody";
