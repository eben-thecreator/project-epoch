import React, { useEffect, useState, useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { apiUrl } from "../../../lib/api";
import { AssetMarker } from "./AssetMarker";

export type HeritageAsset = {
  id: string | number;
  name: string;
  alternative_name?: string;
  description?: string;
  asset_type?: string;
  asset_category?: string;
  cultural_group?: string;
  geometry?: { type: string; coordinates: number[] | number[][] };
  region?: string;
  district?: string;
  community?: string;
  period?: string;
  period_start?: number;
  period_end?: number;
  condition?: string;
  ownership?: string;
  material?: string;
  conservation_status?: string;
  current_location?: string;
  location_description?: string;
  media?: Array<{
    id: string;
    mediaType: string;
    filePath: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
};

const categoryColors: Record<string, string> = {
  Museum: "#E4002B",
  Fort: "#E4002B",
  Castle: "#E4002B",
  Monument: "#E4002B",
  Shrine: "#E4002B",
  Palace: "#E4002B",
  "Traditional Palace": "#E4002B",
  Artifact: "#E4002B",
  "Jewelry / Beadwork": "#E4002B",
  "Archaeological Site": "#E4002B",
  "Sacred Grove": "#E4002B",
  "Historic Building": "#E4002B",
  Festival: "#E4002B",
  Textile: "#E4002B",
  "Textile (Kente, etc.)": "#E4002B",
  "Photograph / Digital Media": "#E4002B",
  "Audio / Music": "#E4002B",
};

const darkCategoryColors: Record<string, string> = {
  Museum: "#E4002B",
  Fort: "#E4002B",
  Castle: "#E4002B",
  Monument: "#E4002B",
  Shrine: "#E4002B",
  Palace: "#E4002B",
  "Traditional Palace": "#E4002B",
  Artifact: "#E4002B",
  "Jewelry / Beadwork": "#E4002B",
  "Archaeological Site": "#E4002B",
  "Sacred Grove": "#E4002B",
  "Historic Building": "#E4002B",
  Festival: "#E4002B",
  Textile: "#E4002B",
  "Textile (Kente, etc.)": "#E4002B",
  "Photograph / Digital Media": "#E4002B",
  "Audio / Music": "#E4002B",
};

function getPolygonStyle(feature?: GeoJSON.Feature, dark = false) {
  const color = dark ? "#ffffff" : "#000000";
  return {
    color,
    weight: 2,
    opacity: 0.9,
    fillColor: color,
    fillOpacity: dark ? 0.2 : 0.18,
    dashArray: undefined as string | undefined,
  };
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();
  useEffect(() => {
    onZoomChange(map.getZoom());
    const handler = (z: number) => onZoomChange(z);
    map.on("zoomend", () => handler(map.getZoom()));
    return () => { map.off("zoomend"); };
  }, [map, onZoomChange]);
  return null;
}

interface HeritageLayerProps {
  onSelectAsset: (asset: HeritageAsset) => void;
  filters: Record<string, string>;
  yearRange: [number, number];
  visible: boolean;
  darkMode?: boolean;
  onVisibleCategoriesChange: (categories: string[]) => void;
  onCategoryCountsChange?: (counts: Record<string, number>) => void;
  onZoomChange?: (zoom: number) => void;
}

export const HeritageLayer: React.FC<HeritageLayerProps> = ({
  onSelectAsset,
  filters,
  yearRange,
  visible,
  darkMode = false,
  onVisibleCategoriesChange,
  onCategoryCountsChange,
  onZoomChange,
}) => {
  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(7);

  const handleZoomChange = React.useCallback((z: number) => {
    setZoom(z);
    onZoomChange?.(z);
  }, [onZoomChange]);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    const qs = params.toString();
    fetch(apiUrl(`/api/heritage-assets${qs ? `?${qs}` : ""}`))
      .then((r) => r.json())
      .then((data: HeritageAsset[]) => setAssets(data))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [visible, filters]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (!a.geometry) return false;
      const ps = a.period_start ?? -Infinity;
      const pe = a.period_end ?? Infinity;
      return ps <= yearRange[1] && pe >= yearRange[0];
    });
  }, [assets, yearRange]);

  const pointAssets = useMemo(
    () => filteredAssets.filter((a) => a.geometry?.type === "Point"),
    [filteredAssets]
  );

  const polygonAssets = useMemo(
    () => filteredAssets.filter((a) => a.geometry?.type === "Polygon" || a.geometry?.type === "MultiPolygon"),
    [filteredAssets]
  );

  const lineAssets = useMemo(
    () => filteredAssets.filter((a) => a.geometry?.type === "LineString" || a.geometry?.type === "MultiLineString"),
    [filteredAssets]
  );

  // Compute centroid [lat, lng] for a polygon or multipolygon geometry
  const getPolygonCentroid = (geometry: { type: string; coordinates: number[] | number[][] }): [number, number] | null => {
    try {
      let ring: number[][];
      if (geometry.type === "Polygon") {
        ring = (geometry.coordinates as number[][][])[0];
      } else if (geometry.type === "MultiPolygon") {
        // Use the first polygon's outer ring
        ring = (geometry.coordinates as number[][][][])[0][0];
      } else {
        return null;
      }
      if (!ring || ring.length === 0) return null;
      let lngSum = 0, latSum = 0;
      ring.forEach((c) => { lngSum += c[0]; latSum += c[1]; });
      return [latSum / ring.length, lngSum / ring.length];
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const cats = new Set<string>();
    const counts: Record<string, number> = {};
    filteredAssets.forEach((a) => {
      if (a.asset_category) {
        cats.add(a.asset_category);
        counts[a.asset_category] = (counts[a.asset_category] || 0) + 1;
      }
    });
    onVisibleCategoriesChange(Array.from(cats));
    onCategoryCountsChange?.(counts);
  }, [filteredAssets, onVisibleCategoriesChange, onCategoryCountsChange]);

  const showLabels = true;

  if (!visible) return null;

  return (
    <>
      <ZoomTracker onZoomChange={handleZoomChange} />

      {pointAssets.map((asset) => {
        const coords = asset.geometry?.coordinates as number[];
        if (!coords || coords.length < 2) return null;
        return (
          <AssetMarker
            key={asset.id}
            position={[coords[1], coords[0]]}
            category={asset.asset_category}
            name={asset.name || asset.alternative_name || ""}
            showLabel={showLabels}
            darkMode={darkMode}
            onClick={() => onSelectAsset(asset)}
          />
        );
      })}

      {polygonAssets.map((asset) => {
        const centroid = getPolygonCentroid(asset.geometry!);
        return (
          <React.Fragment key={`poly-group-${asset.id}`}>
            <GeoJSON
              key={`poly-${asset.id}`}
              data={asset.geometry as any}
              style={(feature) => getPolygonStyle(feature, darkMode)}
              eventHandlers={{
                click: () => onSelectAsset(asset),
              }}
            />
            {centroid && (
              <AssetMarker
                key={`poly-marker-${asset.id}`}
                position={centroid}
                category={asset.asset_category}
                name={asset.name || asset.alternative_name || ""}
                showLabel={showLabels}
                darkMode={darkMode}
                onClick={() => onSelectAsset(asset)}
              />
            )}
          </React.Fragment>
        );
      })}

      {lineAssets.map((asset) => {
        const cat = asset.asset_category || "";
        const colors = darkMode ? darkCategoryColors : categoryColors;
        const color = colors[cat] || (darkMode ? "#ffffff" : "#000000");
        return (
          <GeoJSON
            key={`line-${asset.id}`}
            data={asset.geometry as any}
            style={{
              color,
              weight: 2,
              opacity: 0.8,
            }}
            eventHandlers={{
              click: () => onSelectAsset(asset),
            }}
          />
        );
      })}
    </>
  );
};

HeritageLayer.displayName = "HeritageLayer";
