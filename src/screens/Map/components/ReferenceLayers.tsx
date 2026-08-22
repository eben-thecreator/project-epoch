import React, { useEffect, useRef, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { apiUrl } from "../../../lib/api";

type GeoJSONData = GeoJSON.FeatureCollection;

interface LayerConfig {
  key: string;
  label: string;
  color: string;
  weight: number;
  dashArray?: string;
  fillOpacity: number;
  fillColor: string;
  darkColor: string;
  darkFillColor: string;
}

const layerConfigs: LayerConfig[] = [
  { key: "regions", label: "Regions", color: "#000", weight: 1.5, fillOpacity: 0, fillColor: "transparent", darkColor: "rgba(255,255,255,0.5)", darkFillColor: "transparent" },
  { key: "districts", label: "Districts", color: "#000", weight: 0.5, dashArray: "4,4", fillOpacity: 0, fillColor: "transparent", darkColor: "rgba(255,255,255,0.3)", darkFillColor: "transparent" },
  { key: "roads", label: "Roads", color: "#888", weight: 1, fillOpacity: 0, fillColor: "transparent", darkColor: "rgba(255,255,255,0.25)", darkFillColor: "transparent" },
  { key: "rivers", label: "Rivers", color: "#4caae9ff", weight: 1.5, fillOpacity: 0, fillColor: "transparent", darkColor: "rgba(100,160,220,0.4)", darkFillColor: "transparent" },
  { key: "protected_areas", label: "Protected Areas", color: "#095c1dff", weight: 1, fillOpacity: 0.5, fillColor: "#08b132ff", darkColor: "rgba(68,170,85,0.5)", darkFillColor: "rgba(68,170,85,0.08)" },
];

interface ReferenceLayerProps {
  activeLayers: string[];
  darkMode?: boolean;
}

export const ReferenceLayers: React.FC<ReferenceLayerProps> = ({ activeLayers, darkMode = false }) => {
  const cacheRef = useRef<Record<string, GeoJSONData>>({});
  const failedRef = useRef<Set<string>>(new Set());
  const [cache, setCache] = useState<Record<string, GeoJSONData>>({});

  useEffect(() => {
    activeLayers.forEach((key) => {
      if (cacheRef.current[key]) return;
      // A previous transient failure should not permanently disable the layer:
      // retry on subsequent activation passes (e.g. after a toggle or manual retry).
      if (failedRef.current.has(key)) {
        failedRef.current.delete(key);
      }
      fetch(apiUrl(`/api/map/reference/${key}`))
        .then((r) => {
          if (!r.ok) throw new Error("Layer not available");
          return r.json();
        })
        .then((data: GeoJSONData) => {
          cacheRef.current[key] = data;
          setCache((prev) => ({ ...prev, [key]: data }));
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Mark as failed but do NOT cache an empty collection — the layer
          // stays eligible for retry.
          failedRef.current.add(key);
        });
    });
  }, [activeLayers]);

  return (
    <>
      {layerConfigs
        .filter((cfg) => activeLayers.includes(cfg.key))
        .map((cfg) => {
          const data = cache[cfg.key];
          if (!data || data.features.length === 0) return null;
          return (
            <GeoJSON
              key={`${cfg.key}-${darkMode ? "dark" : "light"}-${data.features.length}`}
              data={data}
              style={{
                color: darkMode ? cfg.darkColor : cfg.color,
                weight: cfg.weight,
                fillColor: darkMode ? cfg.darkFillColor : cfg.fillColor,
                fillOpacity: darkMode ? Math.min(cfg.fillOpacity + 0.02, 0.15) : cfg.fillOpacity,
                dashArray: cfg.dashArray,
                opacity: 0.8,
              }}
              interactive={false}
            />
          );
        })}
    </>
  );
};

ReferenceLayers.displayName = "ReferenceLayers";
