import React, { useState, useCallback, useEffect } from "react";
import { Header } from "../../components/Header";
import { MapView, Basemap, FlyToTarget } from "./components/MapView";
import { HeritageLayer, HeritageAsset } from "./components/HeritageLayer";
import { ReferenceLayers } from "./components/ReferenceLayers";
import { LayerControl } from "./components/LayerControl";
import { SearchBar } from "./components/SearchBar";
import { SidePanel } from "./components/SidePanel";
import { Legend } from "./components/Legend";
import { CompassControl } from "./components/CompassControl";
import { TimeSlider } from "./components/TimeSlider";
import { geometryCenter, geometryBounds } from "../../lib/geometry";
import { apiUrl } from "../../lib/api";
import "./components/map.css";

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

const referenceLayerConfigs = [
  { key: "regions", label: "Regions" },
  { key: "districts", label: "Districts" },
  { key: "roads", label: "Roads" },
  { key: "rivers", label: "Rivers" },
  { key: "protected_areas", label: "Protected Areas" },
];

export const MapScreen: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<HeritageAsset | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>(defaultFilters);
  const [yearRange, setYearRange] = useState<[number, number]>([1100, 2026]);
  const [activeRefLayers, setActiveRefLayers] = useState<string[]>(["regions", "protected_areas"]);
  const [heritageVisible, setHeritageVisible] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("schis-map-theme") === "dark";
  });
  const [basemap, setBasemap] = useState<Basemap>(() => {
    const stored = localStorage.getItem("schis-map-basemap") as Basemap | null;
    return stored ?? (localStorage.getItem("schis-map-theme") === "dark" ? "dark" : "light");
  });

    const handleBasemapChange = useCallback((bm: Basemap) => {
      setBasemap(bm);
      localStorage.setItem("schis-map-basemap", bm);
    }, []);

  const [periodRange, setPeriodRange] = useState({ min: 1100, max: 2026 });
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);
  const [assetCount, setAssetCount] = useState(0);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    localStorage.setItem("schis-map-theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    fetch(apiUrl("/api/heritage-assets/period-range"))
      .then((r) => r.json())
      .then((data) => {
        if (data.min_year && data.max_year) {
          setPeriodRange({ min: data.min_year, max: data.max_year });
          setYearRange([data.min_year, data.max_year]);
        }
      })
      .catch(() => { });
  }, []);

  const handleSelectAsset = useCallback((asset: HeritageAsset) => {
    setSelectedAsset(asset);
    const bounds = geometryBounds(asset.geometry);
    setFlyTo({
      center: geometryCenter(asset.geometry) ?? [7.9465, -1.0232],
      zoom: 14,
      bounds,
    });
  }, []);
  const handleClosePanel = useCallback(() => {
    setSelectedAsset(null);
  }, []);

  /** Derive dynamic filter options from the loaded catalogue. */
  const handleAssetsLoaded = useCallback((assets: HeritageAsset[]) => {
    const fields = [
      "region",
      "district",
      "period",
      "condition",
      "ownership",
      "conservation_status",
      "material",
      "cultural_group",
    ] as const;
    const next: Record<string, string[]> = {};
    for (const field of fields) {
      const values = new Set<string>();
      for (const a of assets) {
        const v = a[field];
        if (typeof v === "string" && v.trim()) values.add(v.trim());
      }
      if (values.size > 0) next[field] = [...values].sort();
    }
    setDynamicOptions(next);
  }, []);

  const handleToggleRefLayer = useCallback((key: string) => {
    setActiveRefLayers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const layerItems = [
    {
      key: "__heritage__",
      label: "Heritage Sites",
      active: heritageVisible,
    },
    ...referenceLayerConfigs.map((cfg) => ({
      key: cfg.key,
      label: cfg.label,
      active: activeRefLayers.includes(cfg.key),
    })),
  ];

  const handleToggleLayer = useCallback(
    (key: string) => {
      if (key === "__heritage__") {
        setHeritageVisible((prev) => !prev);
      } else {
        handleToggleRefLayer(key);
      }
    },
    [handleToggleRefLayer]
  );

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const handleResetMap = useCallback(() => {
    setFilters(defaultFilters);
    setYearRange([periodRange.min, periodRange.max]);
    setActiveRefLayers(["regions", "protected_areas"]);
    setHeritageVisible(true);
    setSelectedAsset(null);
    setFlyTo({ center: [7.9465, -1.0232], zoom: 7 });
  }, [periodRange]);

  const handleZoomToAsset = useCallback((asset: HeritageAsset) => {
    const bounds = geometryBounds(asset.geometry);
    setFlyTo({
      center: geometryCenter(asset.geometry) ?? [7.9465, -1.0232],
      zoom: 14,
      bounds,
    });
  }, []);

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const isYearRangeFiltered =
    yearRange[0] !== periodRange.min || yearRange[1] !== periodRange.max;

  const bgColor = darkMode ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]";
  const border = darkMode ? "border-white/15" : "border-black/15";
  const badgeBg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const badgeText = darkMode ? "text-white" : "text-black";

  return (
    <div className={`${bgColor} w-full h-screen flex flex-col overflow-hidden`}>
      <Header />

      {/* Main Map Spatial Canvas — Positioned directly below 64px fixed header */}
      <div className="flex-1 relative mt-[64px] w-full h-[calc(100vh-64px)]">
        <MapView darkMode={darkMode} basemap={basemap} flyTo={flyTo}>
          <HeritageLayer
            onSelectAsset={handleSelectAsset}
            filters={filters}
            yearRange={yearRange}
            visible={heritageVisible}
            darkMode={darkMode}
            onVisibleCategoriesChange={setVisibleCategories}
            onCategoryCountsChange={setCategoryCounts}
            onAssetCountChange={setAssetCount}
            onAssetsLoaded={handleAssetsLoaded}
          />
          <ReferenceLayers activeLayers={activeRefLayers} darkMode={darkMode} />
        </MapView>

        {/* ZONE 1: TOP-LEFT COMMAND DOCK (SEARCH & FILTERS) */}
        <div className="absolute top-4 left-4 sm:left-6 z-[1000] flex flex-col items-start gap-2.5 w-[200px] sm:w-[240px]">
          <SearchBar onSelectAsset={handleSelectAsset} darkMode={darkMode} />
          <LayerControl
            layers={layerItems}
            dynamicOptions={dynamicOptions}
            onToggle={handleToggleLayer}
            filters={filters}
            onFilterChange={setFilters}
            darkMode={darkMode}
          />
        </div>

        {/* ZONE 2: TOP-CENTER ACTIVE FILTER / COUNT READOUT */}
        {(hasActiveFilters || isYearRangeFiltered) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
            <div
              className={`${badgeBg} border ${border} shadow-md px-3.5 py-1.5 flex items-center gap-3 select-none`}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span
                  className={`text-[10px] font-mono uppercase font-bold tracking-wider ${badgeText}`}
                >
                  {assetCount} ASSET{assetCount !== 1 ? "S" : ""} MATCHED
                </span>
              </div>
              <button
                onClick={handleResetMap}
                className="text-[9px] uppercase font-mono font-bold tracking-wider text-brand hover:text-[#FF4D4D] border-l border-white/10 pl-3 transition-colors"
              >
                RESET ALL
              </button>
            </div>
          </div>
        )}

        {/* ZONE 3: TOP-RIGHT SPATIAL TOOL STRIP */}
        <div className="absolute top-4 right-4 sm:right-6 z-[1000]">
          <CompassControl
            darkMode={darkMode}
            basemap={basemap}
            onToggleTheme={toggleTheme}
            onBasemapChange={handleBasemapChange}
            onReset={handleResetMap}
          />
        </div>

        {/* ZONE 5: BOTTOM-RIGHT LEGEND DOCK */}
        <Legend
          visibleCategories={visibleCategories}
          categoryCounts={categoryCounts}
          darkMode={darkMode}
        />

        {/* ZONE 5b: BOTTOM-CENTER TEMPORAL CONTROL */}
        <TimeSlider
          yearRange={yearRange}
          onChange={setYearRange}
          dataMin={periodRange.min}
          dataMax={periodRange.max}
          darkMode={darkMode}
        />

        {/* ZONE 6: RIGHT INSPECTOR DRAWER */}
        <SidePanel
          asset={selectedAsset}
          onClose={handleClosePanel}
          onZoomTo={handleZoomToAsset}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

MapScreen.displayName = "MapScreen";
