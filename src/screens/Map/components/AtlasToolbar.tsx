import React, { useEffect, useRef } from "react";
import { LayerManagerBody } from "./LayerManager";
import type { Basemap } from "./MapView";
import type { LayerFlags } from "./LayerManager";
import { cn } from "../../../lib/utils";

interface AtlasToolbarProps {
  basemap: Basemap;
  onBasemapChange: (bm: Basemap) => void;
  layersOpen: boolean;
  onCloseLayers: () => void;
  flags: LayerFlags;
  onToggleFlag: (key: keyof LayerFlags) => void;
  referenceLayers: Array<{ key: string; label: string; active: boolean }>;
  onToggleReference: (key: string) => void;
  legend: {
    categories: Array<{ value: string; count: number; color: string; hidden: boolean }>;
    onToggleCategory: (category: string) => void;
  };
  shareUrl: string;
  onExport: (format: "csv" | "geojson" | "kml") => void;
  hasSelection?: boolean;
  children?: React.ReactNode;
}

const BASEMAP_OPTIONS: Array<{ key: Basemap; label: string }> = [
  { key: "grey", label: "Street" },
  { key: "satellite", label: "Satellite" },
];

export const AtlasToolbar: React.FC<AtlasToolbarProps> = ({
  basemap,
  onBasemapChange,
  layersOpen,
  onCloseLayers,
  flags,
  onToggleFlag,
  referenceLayers,
  onToggleReference,
  legend,
  shareUrl,
  onExport,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layersOpen) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onCloseLayers();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [layersOpen, onCloseLayers]);

  return (
    <div className="relative z-[1004] shrink-0 border-b border-hairline bg-white">
      <div className="shell flex h-12 items-stretch sm:h-14">
        <div className="relative flex min-w-0 flex-1 items-center lg:max-w-[440px] lg:flex-none">
          {children}
        </div>

        <div
          role="radiogroup"
          aria-label="Base map"
          className="ml-auto flex shrink-0 items-center gap-6 pl-4 lg:gap-8"
        >
          {BASEMAP_OPTIONS.map((opt) => {
            const active = basemap === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={active}
                title={opt.label}
                onClick={() => onBasemapChange(opt.key)}
                className={cn(
                  "transition-colors duration-250 ease-house",
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                )}
              >
                <span className="f-body-2">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {layersOpen && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Layers"
            className="map-chrome absolute right-3 top-full z-[1015] max-h-[min(72vh,640px)] w-[300px] overflow-y-auto border border-hairline bg-white sm:right-4 lg:right-6 xl:right-8"
          >
            <LayerManagerBody
              basemap={basemap}
              onBasemapChange={onBasemapChange}
              flags={flags}
              onToggleFlag={onToggleFlag}
              referenceLayers={referenceLayers}
              onToggleReference={onToggleReference}
              legend={legend}
              shareUrl={shareUrl}
              onExport={onExport}
            />
          </div>
        )}
      </div>
    </div>
  );
};

AtlasToolbar.displayName = "AtlasToolbar";
