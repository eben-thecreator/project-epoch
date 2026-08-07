import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { GeoJSON, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { apiUrl } from "../../../lib/api";
import { createMarkerIcon } from "./AssetMarker";

export type HeritageAsset = {
  id: string | number;
  name: string;
  alternative_name?: string;
  description?: string;
  asset_type?: string;
  asset_category?: string;
  cultural_group?: string;
  geometry?: {
    type: string;
    coordinates: number[] | number[][] | number[][][] | number[][][][];
  };
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
  Fort: "#D35400",
  Castle: "#C0392B",
  Monument: "#8E44AD",
  Shrine: "#27AE60",
  Palace: "#F39C12",
  "Traditional Palace": "#E67E22",
  Artifact: "#2980B9",
  "Jewelry / Beadwork": "#1ABC9C",
  "Archaeological Site": "#7F8C8D",
  "Sacred Grove": "#2ECC71",
  "Historic Building": "#9B59B6",
  Festival: "#E74C3C",
  Textile: "#3498DB",
  "Textile (Kente, etc.)": "#2980B9",
  "Photograph / Digital Media": "#16A085",
  "Audio / Music": "#D4AC0D",
};

const darkCategoryColors: Record<string, string> = {
  Museum: "#FF6B6B",
  Fort: "#FFA071",
  Castle: "#FF7675",
  Monument: "#A29BFE",
  Shrine: "#55EFC4",
  Palace: "#FFEAA7",
  "Traditional Palace": "#FDCB6E",
  Artifact: "#74B9FF",
  "Jewelry / Beadwork": "#00CEC9",
  "Archaeological Site": "#B2BEC3",
  "Sacred Grove": "#00B894",
  "Historic Building": "#A29BFE",
  Festival: "#FF7675",
  Textile: "#81ECEC",
  "Textile (Kente, etc.)": "#74B9FF",
  "Photograph / Digital Media": "#55EFC4",
  "Audio / Music": "#FFEAA7",
};

function getPolygonStyle(feature?: GeoJSON.Feature, dark = false) {
  const cat = feature?.properties?.asset_category;
  const color = cat
    ? dark
      ? darkCategoryColors[cat] || "#ffffff"
      : categoryColors[cat] || "#000000"
    : dark
    ? "#ffffff"
    : "#000000";
  return {
    color,
    weight: 2,
    opacity: 0.9,
    fillColor: color,
    fillOpacity: dark ? 0.2 : 0.15,
    dashArray: undefined as string | undefined,
  };
}

function ZoomTracker({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();
  useEffect(() => {
    onZoomChange(map.getZoom());
    const handler = () => onZoomChange(map.getZoom());
    map.on("zoomend", handler);
    return () => {
      map.off("zoomend", handler);
    };
  }, [map, onZoomChange]);
  return null;
}

function ClusteredPointLayer({
  assets,
  darkMode,
  onSelectAsset,
}: {
  assets: HeritageAsset[];
  darkMode: boolean;
  onSelectAsset: (asset: HeritageAsset) => void;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const renderedIdsRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
      chunkedLoading: true,
      iconCreateFunction: (cl) => {
        const count = cl.getChildCount();
        let size = 36;
        let cls = "marker-cluster marker-cluster-small";
        if (count >= 50) {
          size = 56;
          cls = "marker-cluster marker-cluster-large";
        } else if (count >= 10) {
          size = 44;
          cls = "marker-cluster marker-cluster-medium";
        }
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: cls,
          iconSize: L.point(size, size),
        });
      },
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
      renderedIdsRef.current.clear();
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    const currentIds = new Set(assets.map((a) => a.id));

    renderedIdsRef.current.forEach((id) => {
      if (!currentIds.has(id)) {
        cluster.eachLayer((layer) => {
          if ((layer as any)._assetId === id) {
            cluster.removeLayer(layer);
          }
        });
        renderedIdsRef.current.delete(id);
      }
    });

    assets.forEach((asset) => {
      if (renderedIdsRef.current.has(asset.id)) return;
      const coords = asset.geometry?.coordinates as number[];
      if (!coords || coords.length < 2) return;
      const icon = createMarkerIcon(
        asset.asset_category,
        asset.name || "",
        false,
        darkMode,
        24
      );
      const marker = L.marker([coords[1], coords[0]], { icon });
      (marker as any)._assetId = asset.id;
      marker.on("click", () => onSelectAsset(asset));
      cluster.addLayer(marker);
      renderedIdsRef.current.add(asset.id);
    });
  }, [assets, darkMode, onSelectAsset]);

  return null;
}

const getPolygonCentroid = (
  geometry: { type: string; coordinates: any }
): [number, number] | null => {
  try {
    let ring: number[][];
    if (geometry.type === "Polygon") {
      ring = geometry.coordinates[0];
    } else if (geometry.type === "MultiPolygon") {
      ring = geometry.coordinates[0][0];
    } else {
      return null;
    }
    if (!ring || ring.length === 0) return null;
    let lngSum = 0,
      latSum = 0;
    ring.forEach((c: number[]) => {
      lngSum += c[0];
      latSum += c[1];
    });
    return [latSum / ring.length, lngSum / ring.length];
  } catch {
    return null;
  }
};

const getLineMidpoint = (
  geometry: { type: string; coordinates: any }
): [number, number] | null => {
  try {
    let coords: number[][];
    if (geometry.type === "LineString") {
      coords = geometry.coordinates;
    } else if (geometry.type === "MultiLineString") {
      coords = geometry.coordinates[0];
    } else {
      return null;
    }
    if (!coords || coords.length === 0) return null;
    const mid = Math.floor(coords.length / 2);
    return [coords[mid][1], coords[mid][0]];
  } catch {
    return null;
  }
};

interface HeritageLayerProps {
  onSelectAsset: (asset: HeritageAsset) => void;
  filters: Record<string, string>;
  yearRange: [number, number];
  visible: boolean;
  darkMode?: boolean;
  onVisibleCategoriesChange: (categories: string[]) => void;
  onCategoryCountsChange?: (counts: Record<string, number>) => void;
  onZoomChange?: (zoom: number) => void;
  onAssetCountChange?: (count: number) => void;
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
  onAssetCountChange,
}) => {
  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(7);

  const handleZoomChange = useCallback(
    (z: number) => {
      setZoom(z);
      onZoomChange?.(z);
    },
    [onZoomChange]
  );

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    if (yearRange[0] !== 1100)
      params.set("period_start", String(yearRange[0]));
    if (yearRange[1] !== 2026)
      params.set("period_end", String(yearRange[1]));
    const qs = params.toString();
    fetch(apiUrl(`/api/heritage-assets${qs ? `?${qs}` : ""}`))
      .then((r) => r.json())
      .then((data: HeritageAsset[]) => {
        setAssets(data);
        setError(false);
      })
      .catch(() => {
        setAssets([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [visible, filters, yearRange]);

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
    () =>
      filteredAssets.filter(
        (a) =>
          a.geometry?.type === "Polygon" ||
          a.geometry?.type === "MultiPolygon"
      ),
    [filteredAssets]
  );

  const lineAssets = useMemo(
    () =>
      filteredAssets.filter(
        (a) =>
          a.geometry?.type === "LineString" ||
          a.geometry?.type === "MultiLineString"
      ),
    [filteredAssets]
  );

  useEffect(() => {
    const cats = new Set<string>();
    const counts: Record<string, number> = {};
    filteredAssets.forEach((a) => {
      if (a.asset_category) {
        cats.add(a.asset_category);
        counts[a.asset_category] =
          (counts[a.asset_category] || 0) + 1;
      }
    });
    onVisibleCategoriesChange(Array.from(cats));
    onCategoryCountsChange?.(counts);
    onAssetCountChange?.(filteredAssets.length);
  }, [
    filteredAssets,
    onVisibleCategoriesChange,
    onCategoryCountsChange,
    onAssetCountChange,
  ]);

  const showLabels = zoom >= 11;

  if (!visible) return null;

  return (
    <>
      <ZoomTracker onZoomChange={handleZoomChange} />

      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1002] pointer-events-none">
          <div className="bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-sm px-4 py-2.5 shadow-lg border border-black/10 dark:border-white/10 flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 border-2 border-black/15 dark:border-white/15 border-t-[#E4002B] rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-black/60 dark:text-white/60">
              Loading assets...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1002] pointer-events-none">
          <div className="bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-sm px-4 py-2.5 shadow-lg border border-red-200 dark:border-red-800">
            <span className="text-[10px] uppercase tracking-wider font-bold text-red-600 dark:text-red-400">
              Failed to load assets. Check API connection.
            </span>
          </div>
        </div>
      )}

      {pointAssets.length > 0 && (
        <ClusteredPointLayer
          assets={pointAssets}
          darkMode={darkMode}
          onSelectAsset={onSelectAsset}
        />
      )}

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
              <Marker
                key={`poly-marker-${asset.id}`}
                position={centroid}
                icon={createMarkerIcon(
                  asset.asset_category,
                  asset.name || "",
                  showLabels,
                  darkMode,
                  24
                )}
                eventHandlers={{
                  click: () => onSelectAsset(asset),
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      {lineAssets.map((asset) => {
        const midpoint = getLineMidpoint(asset.geometry!);
        return (
          <React.Fragment key={`line-group-${asset.id}`}>
            <GeoJSON
              key={`line-${asset.id}`}
              data={asset.geometry as any}
              style={{
                color: darkMode
                  ? darkCategoryColors[asset.asset_category || ""] ||
                    "#ffffff"
                  : categoryColors[asset.asset_category || ""] ||
                    "#000000",
                weight: 2,
                opacity: 0.8,
              }}
              eventHandlers={{
                click: () => onSelectAsset(asset),
              }}
            />
            {midpoint && (
              <Marker
                key={`line-marker-${asset.id}`}
                position={midpoint}
                icon={createMarkerIcon(
                  asset.asset_category,
                  asset.name || "",
                  showLabels,
                  darkMode,
                  24
                )}
                eventHandlers={{
                  click: () => onSelectAsset(asset),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

HeritageLayer.displayName = "HeritageLayer";
