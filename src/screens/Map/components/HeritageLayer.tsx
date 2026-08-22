import React, { useEffect, useState, useMemo, useRef } from "react";
import { GeoJSON, Marker, Tooltip, useMap } from "react-leaflet";
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPolygonStyle(category?: string, dark = false): L.PathOptions {
  const color = category
    ? dark
      ? darkCategoryColors[category] || "#ffffff"
      : categoryColors[category] || "#000000"
    : dark
    ? "#ffffff"
    : "#000000";
  return {
    color,
    weight: 2,
    opacity: 0.9,
    fillColor: color,
    fillOpacity: dark ? 0.2 : 0.15,
  };
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

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).L) {
      (window as any).L = L;
    }
    const createClusterGroup =
      (L as any).markerClusterGroup || (window as any).L?.markerClusterGroup;
    if (!createClusterGroup) return;

    const cluster = createClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
      chunkedLoading: true,
      iconCreateFunction: (cl: any) => {
        const count = cl.getChildCount();
        let size = 32;
        if (count >= 50) {
          size = 48;
        } else if (count >= 10) {
          size = 40;
        }
        return L.divIcon({
          html: `<span>${count}</span>`,
          className: "custom-cluster",
          iconSize: L.point(size, size),
        });
      },
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();

    assets.forEach((asset) => {
      const coords = asset.geometry?.coordinates as number[];
      if (!coords || coords.length < 2) return;
      const icon = createMarkerIcon(
        asset.asset_category,
        asset.name || "",
        false,
        darkMode,
        26
      );
      const marker = L.marker([coords[1], coords[0]], { icon });
      (marker as any)._assetId = asset.id;
      marker.on("click", () => onSelectAsset(asset));

      const catColor = darkMode
        ? darkCategoryColors[asset.asset_category || ""] || "#FF6B6B"
        : categoryColors[asset.asset_category || ""] || "#E4002B";

      const tooltipContent = `
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:7px;height:7px;border-radius:50%;background-color:${catColor};display:inline-block;flex-shrink:0;"></span>
          <span style="font-weight:700;font-size:11px;">${escapeHtml(asset.name || "")}</span>
          ${asset.asset_category ? `<span style="font-size:10px;opacity:0.65;">(${escapeHtml(asset.asset_category)})</span>` : ""}
        </div>
      `;
      marker.bindTooltip(tooltipContent, {
        direction: "top",
        offset: L.point(0, -14),
        className: "custom-map-tooltip",
      });

      cluster.addLayer(marker);
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
  onAssetCountChange,
}) => {
  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    const qs = params.toString();
    // Temporal (yearRange) slicing is intentionally client-side: the catalogue
    // is fetched once and sliced in-browser so the time slider can animate
    // without network churn.
    fetch(apiUrl(`/api/heritage-assets${qs ? `?${qs}` : ""}`))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        setAssets(Array.isArray(data) ? (data as HeritageAsset[]) : []);
        setError(false);
      })
      .catch(() => {
        setAssets([]);
        setError(true);
      })
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

  const showLabels = false;

  if (!visible) return null;

  return (
    <>
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
        const catColor = darkMode
          ? darkCategoryColors[asset.asset_category || ""] || "#FF6B6B"
          : categoryColors[asset.asset_category || ""] || "#E4002B";
        return (
          <React.Fragment key={`poly-group-${asset.id}`}>
            <GeoJSON
              key={`poly-${asset.id}`}
              data={{
                type: "Feature",
                geometry: asset.geometry,
                properties: { asset_category: asset.asset_category },
              } as GeoJSON.Feature}
              style={() => getPolygonStyle(asset.asset_category, darkMode)}
              eventHandlers={{
                click: () => onSelectAsset(asset),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: darkMode ? 0.45 : 0.35,
                    weight: 3,
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle(getPolygonStyle(asset.asset_category, darkMode));
                },
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
                  26
                )}
                eventHandlers={{
                  click: () => onSelectAsset(asset),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -14]}
                  className="custom-map-tooltip"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="font-bold text-[11px]">{asset.name}</span>
                    {asset.asset_category && (
                      <span className="text-[10px] opacity-60">
                        ({asset.asset_category})
                      </span>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            )}
          </React.Fragment>
        );
      })}

      {lineAssets.map((asset) => {
        const midpoint = getLineMidpoint(asset.geometry!);
        const catColor = darkMode
          ? darkCategoryColors[asset.asset_category || ""] || "#FF6B6B"
          : categoryColors[asset.asset_category || ""] || "#E4002B";
        return (
          <React.Fragment key={`line-group-${asset.id}`}>
            <GeoJSON
              key={`line-${asset.id}`}
              data={{
                type: "Feature",
                geometry: asset.geometry,
                properties: { asset_category: asset.asset_category },
              } as GeoJSON.Feature}
              style={{
                color: catColor,
                weight: 2.5,
                opacity: 0.85,
              }}
              eventHandlers={{
                click: () => onSelectAsset(asset),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 4.5,
                    opacity: 1,
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    color: catColor,
                    weight: 2.5,
                    opacity: 0.85,
                  });
                },
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
                  26
                )}
                eventHandlers={{
                  click: () => onSelectAsset(asset),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -14]}
                  className="custom-map-tooltip"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="font-bold text-[11px]">{asset.name}</span>
                    {asset.asset_category && (
                      <span className="text-[10px] opacity-60">
                        ({asset.asset_category})
                      </span>
                    )}
                  </div>
                </Tooltip>
              </Marker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

HeritageLayer.displayName = "HeritageLayer";

