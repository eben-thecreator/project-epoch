import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type L from "leaflet";
import { Header } from "../../components/Header";
import { cn } from "../../lib/utils";
import { categoryColor } from "../../lib/categories";
import { apiUrl } from "../../lib/api";
import {
  geometryCenter,
  geometryBounds,
  type AssetGeometry,
} from "../../lib/geometry";
import { MapView, type Basemap, type FlyToTarget } from "./components/MapView";
import { HeritageLayer, type HeritageAsset } from "./components/HeritageLayer";
import { ReferenceLayers } from "./components/ReferenceLayers";
import { ZoneLayer } from "./components/ZoneLayer";
import { DensityLayer } from "./components/DensityLayer";
import { SearchPanel } from "./components/SearchPanel";
import { FilterDrawer, FilterBody } from "./components/FilterDrawer";
import { LayerManagerBody } from "./components/LayerManager";
import { MapLegend } from "./components/MapLegend";
import { Dossier } from "./components/Dossier";
import { AtlasToolbar } from "./components/AtlasToolbar";
import { BottomSheet } from "./components/MobileSheet";
import {
  parseAtlasState,
  serializeAtlasState,
  type AtlasUrlState,
} from "./urlState";
import {
  exportCSV,
  exportGeoJSON,
  exportKML,
} from "./lib/atlas";
import "./components/map.css";

const HOME_CENTER: [number, number] = [7.9465, -1.0232];
const HOME_ZOOM = 7;

const defaultFilters: Record<string, string> = {
  asset_category: "",
  period: "",
  condition: "",
  ownership: "",
  conservation_status: "",
  material: "",
  cultural_group: "",
  region: "",
  district: "",
};

const REFERENCE_LAYER_CONFIGS = [
  { key: "regions", label: "Regions" },
  { key: "districts", label: "Districts" },
  { key: "roads", label: "Roads" },
  { key: "rivers", label: "Rivers" },
  { key: "protected_areas", label: "Protected Areas" },
];

interface LayerFlagsShape {
  assets: boolean;
  boundaries: boolean;
  zones: boolean;
  density: boolean;
}

const VALID_BASEMAPS: Basemap[] = ["grey", "satellite"];

/** Permalink payload, decoded exactly once per page load. */
const INITIAL_URL_STATE = parseAtlasState(
  typeof window === "undefined" ? "" : window.location.search
);

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

function overlapsYear(a: HeritageAsset, range: [number, number]): boolean {
  const ps = a.period_start ?? -Infinity;
  const pe = a.period_end ?? Infinity;
  return ps <= range[1] && pe >= range[0];
}

function distinctOptions(
  pool: HeritageAsset[],
  key: keyof HeritageAsset
): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of pool) {
    const v = item[key];
    if (v) counts.set(String(v), (counts.get(String(v)) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }));
}

export const MapScreen: React.FC = () => {
  const [, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  /* ------------------------------ data ------------------------------ */

  const [selectedAsset, setSelectedAsset] = useState<HeritageAsset | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({
    ...defaultFilters,
    ...(INITIAL_URL_STATE.filters ?? {}),
  });
  const [periodRange, setPeriodRange] = useState({ min: 1100, max: 2026 });
  const [yearRange, setYearRange] = useState<[number, number]>(
    INITIAL_URL_STATE.yearRange ?? [1100, 2026]
  );
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [rawAssets, setRawAssets] = useState<HeritageAsset[]>([]);
  const [widestPool, setWidestPool] = useState<HeritageAsset[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  /* --------------------------- cartography --------------------------- */

  const [basemap, setBasemap] = useState<Basemap>(() => {
    if (INITIAL_URL_STATE.basemap) return INITIAL_URL_STATE.basemap;
    const stored = localStorage.getItem("schis-map-basemap") as Basemap | null;
    if (stored && VALID_BASEMAPS.includes(stored)) return stored;
    return "grey";
  });
  const [layerFlags, setLayerFlags] = useState<LayerFlagsShape>(() => ({
    assets: !(INITIAL_URL_STATE.hiddenLayers ?? []).includes("assets"),
    boundaries: !(INITIAL_URL_STATE.hiddenLayers ?? []).includes("boundaries"),
    zones: (INITIAL_URL_STATE.layers ?? []).includes("zones"),
    density: (INITIAL_URL_STATE.layers ?? []).includes("density"),
  }));
  const [activeRefLayers, setActiveRefLayers] = useState<string[]>(() => {
    const fromUrl = (INITIAL_URL_STATE.layers ?? []).filter((l) =>
      REFERENCE_LAYER_CONFIGS.some((c) => c.key === l)
    );
    return fromUrl.length > 0 ? fromUrl : ["regions", "protected_areas"];
  });

  /* ------------------------------- ui ------------------------------- */

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<"filters" | "layers" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [query, setQuery] = useState(INITIAL_URL_STATE.query ?? "");
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const urlSelectionResolved = useRef(false);

  /** Live viewport mirrored for the permalink writer. */
  const viewportRef = useRef<{ center: [number, number]; zoom: number }>({
    center: INITIAL_URL_STATE.center ?? HOME_CENTER,
    zoom: INITIAL_URL_STATE.zoom ?? HOME_ZOOM,
  });
  const [viewportVersion, setViewportVersion] = useState(0);
  const hydratedRef = useRef(false);

  const handleViewportChange = useCallback(
    (center: [number, number], zoom: number) => {
      viewportRef.current = { center, zoom };
      setViewportVersion((v) => v + 1);
    },
    []
  );

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  /* ---------------------------- side effects ---------------------------- */

  useEffect(() => {
    localStorage.setItem("schis-map-basemap", basemap);
  }, [basemap]);

  useEffect(() => {
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    fetch(apiUrl("/api/heritage-assets/period-range"))
      .then((r) => r.json())
      .then((data) => {
        if (data.min_year && data.max_year) {
          setPeriodRange({ min: data.min_year, max: data.max_year });
          if (!INITIAL_URL_STATE.yearRange) {
            setYearRange([data.min_year, data.max_year]);
          }
        }
      })
      .catch(() => {});
  }, []);

  /* --------------------------- permalink writing --------------------------- */

  const serializedRef = useRef("");
  const [shareQs, setShareQs] = useState(() =>
    new URLSearchParams(window.location.search).toString()
  );
  useEffect(() => {
    if (!hydratedRef.current) return;
    const timer = setTimeout(() => {
      const urlState: AtlasUrlState = {
        center: viewportRef.current.center,
        zoom: viewportRef.current.zoom,
        basemap,
        filters,
        yearRange:
          yearRange[0] !== periodRange.min || yearRange[1] !== periodRange.max
            ? yearRange
            : undefined,
        selectedId: selectedAsset ? String(selectedAsset.id) : null,
        query: query || undefined,
        layers: [
          ...(layerFlags.zones ? ["zones"] : []),
          ...(layerFlags.density ? ["density"] : []),
          ...activeRefLayers,
        ],
        hiddenLayers: [
          ...(!layerFlags.assets ? ["assets"] : []),
          ...(!layerFlags.boundaries ? ["boundaries"] : []),
        ],
      };
      const params = serializeAtlasState(urlState, {
        center: HOME_CENTER,
        zoom: HOME_ZOOM,
      });
      const qs = params.toString();
      if (qs === serializedRef.current) return;
      serializedRef.current = qs;
      setShareQs(qs);
      setSearchParams(params, { replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [
    filters,
    yearRange,
    basemap,
    selectedAsset,
    periodRange.min,
    periodRange.max,
    query,
    layerFlags,
    activeRefLayers,
    viewportVersion,
    setSearchParams,
  ]);

  const shareUrl = useMemo(
    () =>
      `${window.location.origin}${window.location.pathname}${shareQs ? `?${shareQs}` : ""}`,
    [shareQs]
  );

  /* ----------------------------- derived pools ----------------------------- */

  const temporalPool = useMemo(
    () => rawAssets.filter((a) => a.geometry && overlapsYear(a, yearRange)),
    [rawAssets, yearRange]
  );

  const exportPool = useMemo(
    () =>
      temporalPool.filter((a) => !hiddenCategories.includes(a.asset_category ?? "")),
    [temporalPool, hiddenCategories]
  );

  const attributeOptions = useMemo(
    () => ({
      region: distinctOptions(widestPool, "region"),
      condition: distinctOptions(widestPool, "condition"),
      ownership: distinctOptions(widestPool, "ownership"),
      conservation_status: distinctOptions(widestPool, "conservation_status"),
      material: distinctOptions(widestPool, "material").slice(0, 24),
      cultural_group: distinctOptions(widestPool, "cultural_group"),
    }),
    [widestPool]
  );

  const legendCategories = useMemo(() => {
    const order = visibleCategories.length > 0 ? visibleCategories : Object.keys(categoryCounts);
    return order
      .filter((c) => (categoryCounts[c] ?? 0) > 0)
      .map((c) => ({
        value: c,
        count: categoryCounts[c] ?? 0,
        color: categoryColor(c, basemap === "satellite"),
        hidden: hiddenCategories.includes(c),
      }));
  }, [visibleCategories, categoryCounts, hiddenCategories, basemap]);

  /* ----------------------------- selection flow ----------------------------- */

  const flyToAsset = useCallback((asset: HeritageAsset, zoom: number) => {
    const bounds = geometryBounds(asset.geometry as AssetGeometry);
    setSelectedAsset(asset);
    setFlyTo({
      center: geometryCenter(asset.geometry as AssetGeometry) ?? HOME_CENTER,
      zoom,
      bounds,
    });
    setAnnouncement(`${asset.name} profile opened`);
  }, []);

  const handleSelectAsset = useCallback(
    (asset: HeritageAsset) => flyToAsset(asset, 15),
    [flyToAsset]
  );

  const selectById = useCallback(
    (id: string) => {
      const match = rawAssets.find((a) => String(a.id) === String(id));
      if (match) {
        flyToAsset(match, 15);
        return;
      }
      fetch(apiUrl(`/api/heritage-assets/${id}`))
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((a: HeritageAsset) => {
          if (a && a.geometry) flyToAsset(a, 15);
        })
        .catch(() => {});
    },
    [rawAssets, flyToAsset]
  );

  const handleCloseDossier = useCallback(() => setSelectedAsset(null), []);

  const handleAssetsLoaded = useCallback((assets: HeritageAsset[]) => {
    setRawAssets(assets);
    setWidestPool((prev) => (assets.length >= prev.length ? assets : prev));

    if (
      !urlSelectionResolved.current &&
      INITIAL_URL_STATE.selectedId &&
      assets.length > 0
    ) {
      urlSelectionResolved.current = true;
      const match = assets.find(
        (a) => String(a.id) === String(INITIAL_URL_STATE.selectedId)
      );
      if (match) flyToAsset(match, 15);
    }
  }, [flyToAsset]);

  /* ------------------------------- actions ------------------------------- */

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
    setHiddenCategories([]);
    setYearRange([periodRange.min, periodRange.max]);
  }, [periodRange]);

  const handleToggleCategoryVisibility = useCallback((category: string) => {
    setHiddenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleToggleFlag = useCallback((key: keyof LayerFlagsShape) => {
    setLayerFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleToggleRefLayer = useCallback((key: string) => {
    setActiveRefLayers((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  }, []);

  /** Toggle one value inside one multi-valued attribute filter. */
  const handleToggleFilterValue = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      const current = prev[key] ? prev[key].split(",").filter(Boolean) : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next.join(",") };
    });
  }, []);

  const handleFrameBounds = useCallback((bounds: L.LatLngBounds) => {
    mapRef.current?.fitBounds(bounds, { padding: [56, 56], maxZoom: 14 });
  }, []);

  const handleExport = useCallback(
    (format: "csv" | "geojson" | "kml") => {
      if (format === "csv") exportCSV(exportPool);
      else if (format === "geojson") exportGeoJSON(exportPool);
      else exportKML(exportPool);
    },
    [exportPool]
  );

  /* ------------------------------- shortcuts ------------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("atlas-search-input")?.focus();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        document.getElementById("atlas-search-input")?.focus();
      } else if (!typing && e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (isMobile) {
          setMobileSheet((p) => (p === "filters" ? null : "filters"));
        } else {
          setFiltersOpen((p) => !p);
        }
      } else if (!typing && e.key.toLowerCase() === "l") {
        e.preventDefault();
        if (isMobile) {
          setMobileSheet((p) => (p === "layers" ? null : "layers"));
        } else {
          setLayersOpen((p) => !p);
        }
      } else if (e.key === "Escape") {
        setLayersOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile]);

  /* --------------------------------- render --------------------------------- */

  const filterBodyProps = {
    categories: legendCategories.map(({ value, count }) => ({ value, count })),
    hiddenCategories,
    onToggleCategory: handleToggleCategoryVisibility,
    categoryColorOf: (c: string) => categoryColor(c, false),
    attributeOptions,
    filters,
    onToggleFilterValue: handleToggleFilterValue,
    periodBounds: periodRange,
    yearRange,
    onYearRangeChange: setYearRange,
    onClearAll: clearAllFilters,
  };

  const layerManagerProps = {
    basemap,
    onBasemapChange: setBasemap,
    flags: layerFlags,
    onToggleFlag: handleToggleFlag,
    referenceLayers: REFERENCE_LAYER_CONFIGS.map((cfg) => ({
      key: cfg.key,
      label: cfg.label,
      active: activeRefLayers.includes(cfg.key),
    })),
    onToggleReference: handleToggleRefLayer,
    legend: {
      categories: legendCategories,
      onToggleCategory: handleToggleCategoryVisibility,
    },
    shareUrl,
    onExport: handleExport,
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <Header />

      <main className="relative flex min-h-0 flex-1 flex-col pt-[var(--header-h)]">
        <AtlasToolbar
          basemap={basemap}
          onBasemapChange={setBasemap}
          layersOpen={layersOpen}
          onCloseLayers={() => setLayersOpen(false)}
          flags={layerFlags}
          onToggleFlag={handleToggleFlag}
          referenceLayers={REFERENCE_LAYER_CONFIGS.map((cfg) => ({
            key: cfg.key,
            label: cfg.label,
            active: activeRefLayers.includes(cfg.key),
          }))}
          onToggleReference={handleToggleRefLayer}
          legend={{
            categories: legendCategories,
            onToggleCategory: handleToggleCategoryVisibility,
          }}
          shareUrl={shareUrl}
          onExport={handleExport}
          hasSelection={!!selectedAsset}
        >
          <SearchPanel
            onSelectResult={(a) => selectById(a.id)}
            onQueryChange={setQuery}
            initialQuery={query}
            referencePoint={viewportRef.current.center}
            onFrameBounds={handleFrameBounds}
          />
        </AtlasToolbar>

        <div className={cn("relative min-h-0 flex-1", selectedAsset && "dim-others")}>
          <div className="absolute inset-0">
            <MapView
              basemap={basemap}
              flyTo={flyTo}
              center={INITIAL_URL_STATE.center ?? HOME_CENTER}
              zoom={INITIAL_URL_STATE.zoom ?? HOME_ZOOM}
              onViewportChange={handleViewportChange}
              onMapReady={handleMapReady}
            >
              <HeritageLayer
                onSelectAsset={handleSelectAsset}
                filters={filters}
                yearRange={yearRange}
                visible={layerFlags.assets}
                darkMode={basemap === "satellite"}
                hiddenCategories={hiddenCategories}
                showBoundaries={layerFlags.boundaries}
                selectedId={selectedAsset ? String(selectedAsset.id) : null}
                onVisibleCategoriesChange={setVisibleCategories}
                onCategoryCountsChange={setCategoryCounts}
                onAssetsLoaded={handleAssetsLoaded}
              />
              <ZoneLayer
                assets={temporalPool.filter(
                  (a) =>
                    a.geometry?.type === "Point" &&
                    !hiddenCategories.includes(a.asset_category ?? "")
                )}
                visible={layerFlags.zones}
                darkTiles={basemap === "satellite"}
              />
              <DensityLayer
                assets={
                  layerFlags.density
                    ? temporalPool.filter(
                        (a) => !hiddenCategories.includes(a.asset_category ?? "")
                      )
                    : []
                }
                visible={layerFlags.density}
              />
              <ReferenceLayers
                activeLayers={activeRefLayers}
                darkMode={basemap === "satellite"}
              />
            </MapView>
          </div>

          <MapLegend
            categories={legendCategories}
            onToggleCategory={handleToggleCategoryVisibility}
            flags={layerFlags}
            darkMode={basemap === "satellite"}
            mapRef={mapRef}
          />

          <Dossier
            asset={selectedAsset}
            pool={rawAssets}
            onClose={handleCloseDossier}
            onZoomTo={(a) => flyToAsset(a, 16)}
            onJumpTo={(a) => flyToAsset(a, 15)}
            variant={isMobile ? "sheet" : "side"}
          />

          {isMobile && (
            <>
              <BottomSheet
                open={mobileSheet === "filters"}
                onClose={() => setMobileSheet(null)}
                label="Filters"
                snaps={[64, 92]}
              >
                <FilterBody {...filterBodyProps} onDone={() => setMobileSheet(null)} />
              </BottomSheet>
              <BottomSheet
                open={mobileSheet === "layers"}
                onClose={() => setMobileSheet(null)}
                label="Layers"
                snaps={[70]}
              >
                <LayerManagerBody {...layerManagerProps} />
              </BottomSheet>
            </>
          )}

          <div role="status" aria-live="polite" className="sr-only">
            {announcement}
          </div>

          {!isMobile && (
            <FilterDrawer
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              {...filterBodyProps}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default MapScreen;
