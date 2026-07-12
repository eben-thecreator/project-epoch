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
  { key: "rivers", label: "Rivers", color: "#999", weight: 1, fillOpacity: 0, fillColor: "transparent", darkColor: "rgba(100,160,220,0.4)", darkFillColor: "transparent" },
  { key: "protected_areas", label: "Protected Areas", color: "#1a5a2a", weight: 1, fillOpacity: 0.06, fillColor: "#1a5a2a", darkColor: "rgba(68,170,85,0.5)", darkFillColor: "rgba(68,170,85,0.08)" },
];

interface ReferenceLayerProps {
  activeLayers: string[];
  darkMode?: boolean;
}

export const ReferenceLayers: React.FC<ReferenceLayerProps> = ({ activeLayers, darkMode = false }) => {
  const cacheRef = useRef<Record<string, GeoJSONData>>({});
  const [cache, setCache] = useState<Record<string, GeoJSONData>>({});

  useEffect(() => {
    activeLayers.forEach((key) => {
      if (cacheRef.current[key]) return;
      fetch(apiUrl(`/api/map/reference/${key}`))
        .then((r) => {
          if (!r.ok) throw new Error("Layer not available");
          return r.json();
        })
        .then((data: GeoJSONData) => {
          cacheRef.current[key] = data;
          setCache((prev) => ({ ...prev, [key]: data }));
        })
        .catch(() => {
          const empty: GeoJSONData = { type: "FeatureCollection", features: [] };
          cacheRef.current[key] = empty;
          setCache((prev) => ({ ...prev, [key]: empty }));
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
              key={`${cfg.key}-${darkMode ? "dark" : "light"}`}
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
