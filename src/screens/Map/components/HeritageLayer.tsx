import React, { useEffect, useState, useMemo, useRef } from "react";
import { GeoJSON, Marker, Tooltip, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { apiUrl } from "../../../lib/api";
import { createMarkerIcon, createClusterIcon, isWorldHeritage } from "./AssetMarker";
import { categoryColor } from "../../../lib/categories";
import { geometryCenter } from "../../../lib/geometry";

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
    coordinates: number[] | number[][] | number[][][] | number[][][];
  };
  region?: string;
  district?: string;
  community?: string;
  location_description?: string;
  location_accuracy?: string;
  elevation_m?: number | null;
  gps_accuracy_m?: number | null;
  period?: string;
  period_start?: number;
  period_end?: number;
  condition?: string;
  damage_type?: string;
  ownership?: string;
  material?: string;
  secondary_material?: string;
  technique?: string;
  conservation_status?: string;
  estimated_age?: string;
  data_source?: string;
  data_completeness_score?: number | null;
  verification_status?: string;
  media?: Array<{
    id: string;
    mediaType: string;
    filePath: string;
    caption?: string;
    isPrimary?: boolean;
  }>;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPolygonStyle(category?: string, dark = false): L.PathOptions {
  const color = categoryColor(category, dark);
  return {
    color,
    weight: dark ? 2.5 : 2,
    opacity: dark ? 1 : 0.9,
    fillColor: color,
    fillOpacity: dark ? 0.35 : 0.15,
  };
}

function ClusteredPointLayer({
  assets,
  darkMode,
  onSelectAsset,
  skipId,
}: {
  assets: HeritageAsset[];
  darkMode: boolean;
  onSelectAsset: (asset: HeritageAsset) => void;
  skipId?: string | null;
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
        // Tally the category mix beneath the cluster so each head can wear
        // a donut of its children's colours
        const tally: Record<string, number> = {};
        let count = 0;
        cl.getAllChildMarkers().forEach((m: any) => {
          const cat: string | undefined = m._assetCategory;
          tally[cat || "__"] = (tally[cat || "__"] || 0) + 1;
          count += 1;
        });
        const mix = Object.entries(tally).map(([cat, n]) => ({
          color: categoryColor(cat === "__" ? null : cat, darkMode),
          count: n,
        }));
        return createClusterIcon(count, mix, darkMode);
      },
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map, darkMode]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();

    assets.forEach((asset) => {
      // The selected asset is lifted out of the cluster and drawn as a
      // standalone marker so its reticle is never swallowed by a bubble
      if (skipId != null && String(asset.id) === String(skipId)) return;
      const coords = asset.geometry?.coordinates as number[];
      if (!coords || coords.length < 2) return;
      const unesco = isWorldHeritage(asset.conservation_status);
      const icon = createMarkerIcon(asset.asset_category, asset.name || "", false, darkMode, {
        size: 26,
        unesco,
      });
      const marker = L.marker([coords[1], coords[0]], { icon });
      (marker as any)._assetId = asset.id;
      (marker as any)._assetCategory = asset.asset_category;
      marker.on("click", () => onSelectAsset(asset));

      marker.bindTooltip(buildTooltipHtml(asset, darkMode), {
        direction: "top",
        offset: L.point(0, -14),
        className: "custom-map-tooltip",
      });

      cluster.addLayer(marker);
    });
  }, [assets, darkMode, onSelectAsset, skipId]);

  return null;
}

/** Shared tooltip markup: stamp icon, name, category, UNESCO citation. */
function buildTooltipHtml(asset: HeritageAsset, dark: boolean): string {
  const catColor = categoryColor(asset.asset_category, dark);
  const unescoLine = isWorldHeritage(asset.conservation_status)
    ? `<div style="margin-top:3px;padding-top:3px;border-top:1px solid rgba(128,120,105,0.35);font-size:8px;letter-spacing:0.14em;">&#9733; ${escapeHtml(
        asset.conservation_status || ""
      )}</div>`
    : "";
  return `
    <div>
      <div style="display:flex;align-items:center;gap:6px;">
        <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
          <rect x="1" y="1" width="22" height="22" fill="#1A1A1A"/>
          <rect x="2" y="2" width="20" height="20" fill="none" stroke="${catColor}" stroke-width="2"/>
        </svg>
        <span style="font-weight:700;font-size:11px;">${escapeHtml(asset.name || "")}</span>
        ${asset.asset_category ? `<span style="font-size:10px;opacity:0.65;">(${escapeHtml(asset.asset_category)})</span>` : ""}
      </div>
      ${unescoLine}
    </div>
  `;
}

interface HeritageLayerProps {
  onSelectAsset: (asset: HeritageAsset) => void;
  filters: Record<string, string>;
  yearRange: [number, number];
  visible: boolean;
  darkMode?: boolean;
  /** Categories switched off from the legend; rows persist, markers vanish. */
  hiddenCategories?: string[];
  /** Render site polygons & route lines as boundary outlines. */
  showBoundaries?: boolean;
  /** Currently open profile -- lifted out of clusters, wearing a reticle. */
  selectedId?: string | null;
  onVisibleCategoriesChange: (categories: string[]) => void;
  onCategoryCountsChange?: (counts: Record<string, number>) => void;
  onAssetCountChange?: (count: number) => void;
  onAssetsLoaded?: (assets: HeritageAsset[]) => void;
}

export const HeritageLayer: React.FC<HeritageLayerProps> = ({
  onSelectAsset,
  filters,
  yearRange,
  visible,
  darkMode = false,
  hiddenCategories = [],
  showBoundaries = true,
  selectedId = null,
  onVisibleCategoriesChange,
  onCategoryCountsChange,
  onAssetCountChange,
  onAssetsLoaded,
}) => {
  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    const qs = params.toString();
    const controller = new AbortController();
    // Temporal (yearRange) slicing is intentionally client-side: the catalogue
    // is fetched once and sliced in-browser so the time slider can animate
    // without network churn.
    fetch(apiUrl(`/api/heritage-assets${qs ? `?${qs}` : ""}`), {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        const list = Array.isArray(data) ? (data as HeritageAsset[]) : [];
        setAssets(list);
        onAssetsLoaded?.(list);
        setError(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setAssets([]);
        setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [visible, filters, attempt, onAssetsLoaded]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (!a.geometry) return false;
      const ps = a.period_start ?? -Infinity;
      const pe = a.period_end ?? Infinity;
      return ps <= yearRange[1] && pe >= yearRange[0];
    });
  }, [assets, yearRange]);

  // Legend toggles remove categories from the canvas without touching the
  // server-side filter query — the key keeps every row it has ever shown.
  const shownAssets = useMemo(() => {
    if (hiddenCategories.length === 0) return filteredAssets;
    const hidden = new Set(hiddenCategories);
    return filteredAssets.filter((a) => !hidden.has(a.asset_category || ""));
  }, [filteredAssets, hiddenCategories]);

  const pointAssets = useMemo(
    () => shownAssets.filter((a) => a.geometry?.type === "Point"),
    [shownAssets]
  );

  const polygonAssets = useMemo(
    () =>
      shownAssets.filter(
        (a) =>
          a.geometry?.type === "Polygon" ||
          a.geometry?.type === "MultiPolygon"
      ),
    [shownAssets]
  );

  const lineAssets = useMemo(
    () =>
      shownAssets.filter(
        (a) =>
          a.geometry?.type === "LineString" ||
          a.geometry?.type === "MultiLineString"
      ),
    [shownAssets]
  );

  // Stable GeoJSON feature objects: react-leaflet tears down and rebuilds a
  // vector layer whenever the `data` prop identity changes, so these must be
  // memoised or every parent re-render (e.g. each zoom gesture) would redraw
  // the entire layer.
  const polygonFeatures = useMemo(
    () =>
      polygonAssets.map((asset) => ({
        asset,
        feature: {
          type: "Feature",
          geometry: asset.geometry,
          properties: { asset_category: asset.asset_category },
        } as GeoJSON.Feature,
      })),
    [polygonAssets]
  );

  const lineFeatures = useMemo(
    () =>
      lineAssets.map((asset) => ({
        asset,
        feature: {
          type: "Feature",
          geometry: asset.geometry,
          properties: { asset_category: asset.asset_category },
        } as GeoJSON.Feature,
      })),
    [lineAssets]
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
    // The matched-assets readout reflects what is actually on the canvas
    onAssetCountChange?.(shownAssets.length);
  }, [
    filteredAssets,
    shownAssets,
    onVisibleCategoriesChange,
    onCategoryCountsChange,
    onAssetCountChange,
  ]);

  const showLabels = false;

  /** The standalone selected marker (point geometry only). */
  const selectedPointAsset = useMemo(() => {
    if (!selectedId) return null;
    return (
      pointAssets.find((a) => String(a.id) === String(selectedId)) ??
      assets.find(
        (a) =>
          String(a.id) === String(selectedId) &&
          a.geometry?.type === "Point" &&
          !hiddenCategories.includes(a.asset_category || "")
      ) ??
      null
    );
  }, [selectedId, pointAssets, assets, hiddenCategories]);

  if (!visible) return null;

  return (
    <>
      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] pointer-events-none">
          <div className={`flex items-center gap-2.5 border px-4 py-2 backdrop-blur-sm ${
            darkMode
              ? "bg-[#131110]/95 border-paper/15 text-paper/70"
              : "bg-paper/95 border-ink/15 text-ink/70"
          }`}>
            <div
              className={`w-3 h-3 rounded-full border-2 animate-spin ${
                darkMode ? "border-paper/20 border-t-paper" : "border-ink/20 border-t-ink"
              }`}
            />
            <span className="f-caption uppercase tracking-[0.16em]">
              Plotting the collection…
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001]">
          <div className={`flex items-center gap-3 border px-4 py-2 backdrop-blur-sm ${
            darkMode
              ? "bg-[#131110]/95 border-paper/15 text-paper/80"
              : "bg-paper/95 border-ink/15 text-ink/80"
          }`}>
            <span className="f-caption uppercase tracking-[0.16em] text-brand dark:text-[#FF7061]">
              Survey failed to load
            </span>
            <button
              onClick={() => setAttempt((n) => n + 1)}
              className="f-caption uppercase tracking-[0.16em] underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {selectedPointAsset && selectedPointAsset.geometry && (
        <SelectedReticle
          position={[
            (selectedPointAsset.geometry.coordinates as number[])[1],
            (selectedPointAsset.geometry.coordinates as number[])[0],
          ]}
          dark={darkMode}
        />
      )}

      <ClusteredPointLayer
        assets={pointAssets}
        darkMode={darkMode}
        onSelectAsset={onSelectAsset}
        skipId={selectedId}
      />

      {/* The profile's point asset, redrawn above the cluster field */}
      {selectedPointAsset && (
        <Marker
          key={`selected-point-${selectedPointAsset.id}`}
          position={[
            (selectedPointAsset.geometry!.coordinates as number[])[1],
            (selectedPointAsset.geometry!.coordinates as number[])[0],
          ]}
          zIndexOffset={1000}
          icon={createMarkerIcon(
            selectedPointAsset.asset_category,
            selectedPointAsset.name || "",
            showLabels,
            darkMode,
            {
              size: 28,
              selected: true,
              unesco: isWorldHeritage(selectedPointAsset.conservation_status),
            }
          )}
          eventHandlers={{ click: () => onSelectAsset(selectedPointAsset) }}
        >
          <Tooltip direction="top" offset={[0, -14]} className="custom-map-tooltip" content={buildTooltipHtml(selectedPointAsset, darkMode)} />
        </Marker>
      )}

      {showBoundaries && polygonFeatures.map(({ asset, feature }) => {
        // Area-weighted centroid (shoelace) — the same centre fly-to uses,
        // so the icon always sits where the camera lands. For MultiPolygon
        // assets it resolves to the largest part's centroid.
        const centroid = geometryCenter(asset.geometry);
        const isSelected = selectedId != null && String(asset.id) === String(selectedId);
        return (
          <React.Fragment key={`poly-group-${asset.id}`}>
            <GeoJSON
              key={`poly-${asset.id}-${isSelected ? "sel" : "base"}`}
              data={feature}
              style={() => {
                const base = getPolygonStyle(asset.asset_category, darkMode);
                return isSelected
                  ? { ...base, weight: 3.5, fillOpacity: darkMode ? 0.38 : 0.3 }
                  : base;
              }}
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
            {centroid && isSelected && <SelectedReticle position={centroid} dark={darkMode} />}
            {centroid && (
              <Marker
                key={`poly-marker-${asset.id}`}
                position={centroid}
                zIndexOffset={isSelected ? 1000 : 0}
                icon={createMarkerIcon(
                  asset.asset_category,
                  asset.name || "",
                  showLabels,
                  darkMode,
                  {
                    size: 26,
                    selected: isSelected,
                    unesco: isWorldHeritage(asset.conservation_status),
                  }
                )}
                eventHandlers={{
                  click: () => onSelectAsset(asset),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -14]}
                  className="custom-map-tooltip"
                  content={buildTooltipHtml(asset, darkMode)}
                />
              </Marker>
            )}
          </React.Fragment>
        );
      })}

      {showBoundaries && lineFeatures.map(({ asset, feature }) => {
        // Length-weighted midpoint along the line, shared with fly-to
        const midpoint = geometryCenter(asset.geometry);
        const isSelected = selectedId != null && String(asset.id) === String(selectedId);
        const catColor = categoryColor(asset.asset_category, darkMode);
        return (
          <React.Fragment key={`line-group-${asset.id}`}>
            <GeoJSON
              key={`line-${asset.id}-${isSelected ? "sel" : "base"}`}
              data={feature}
              style={
                isSelected
                  ? { color: catColor, weight: 5, opacity: 1 }
                  : { color: catColor, weight: 2.5, opacity: 0.85 }
              }
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
                  layerReset(e, asset.asset_category, darkMode);
                },
              }}
            />
            {midpoint && isSelected && <SelectedReticle position={midpoint} dark={darkMode} />}
            {midpoint && (
              <Marker
                key={`line-marker-${asset.id}`}
                position={midpoint}
                zIndexOffset={isSelected ? 1000 : 0}
                icon={createMarkerIcon(
                  asset.asset_category,
                  asset.name || "",
                  showLabels,
                  darkMode,
                  {
                    size: 26,
                    selected: isSelected,
                    unesco: isWorldHeritage(asset.conservation_status),
                  }
                )}
                eventHandlers={{
                  click: () => onSelectAsset(asset),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -14]}
                  className="custom-map-tooltip"
                  content={buildTooltipHtml(asset, darkMode)}
                />
              </Marker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

function layerReset(
  e: L.LeafletMouseEvent,
  category: string | undefined,
  darkMode: boolean
) {
  const layer = e.target;
  layer.setStyle({
    color: categoryColor(category, darkMode),
    weight: 2.5,
    opacity: 0.85,
  });
}

/**
 * Survey reticle: a fixed brand-red target that marks the selected asset's
 * anchor point regardless of marker symbology. Purely decorative — pointer
 * events pass through to the map.
 */
const SelectedReticle: React.FC<{ position: [number, number]; dark: boolean }> = ({
  position,
  dark,
}) => (
  <CircleMarker
    center={position}
    radius={17}
    pathOptions={{
      color: dark ? "#FF7061" : "#E4002B",
      weight: 1.25,
      dashArray: "4 4",
      fillColor: dark ? "#FF7061" : "#E4002B",
      fillOpacity: 0.06,
    }}
    interactive={false}
  />
);

HeritageLayer.displayName = "HeritageLayer";
