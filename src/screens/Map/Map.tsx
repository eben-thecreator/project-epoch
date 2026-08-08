import React, { useState, useCallback, useEffect } from "react";
import { Header } from "../../components/Header";
import { MapView, Basemap } from "./components/MapView";
import { HeritageLayer, HeritageAsset } from "./components/HeritageLayer";
import { ReferenceLayers } from "./components/ReferenceLayers";
import { LayerControl } from "./components/LayerControl";
import { SearchBar } from "./components/SearchBar";
import { SidePanel } from "./components/SidePanel";
import { Legend } from "./components/Legend";
import { CompassControl } from "./components/CompassControl";
import { CoordinateDisplay } from "./components/CoordinateDisplay";
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
  const [activeRefLayers, setActiveRefLayers] = useState<string[]>(["regions"]);
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
    if (bm === "dark") setDarkMode(true);
    if (bm === "light") setDarkMode(false);
  }, []);

  const [periodRange, setPeriodRange] = useState({ min: 1100, max: 2026 });
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [assetCount, setAssetCount] = useState(0);

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
    if (asset.geometry?.coordinates) {
      const coords = asset.geometry.coordinates;
      if (asset.geometry.type === "Point" && Array.isArray(coords) && coords.length >= 2) {
        const lat = coords[1] as number;
        const lng = coords[0] as number;
        if (!isNaN(lat) && !isNaN(lng)) {
          setFlyTo({
            center: [lat, lng],
            zoom: 14,
          });
        }
      } else if (
        asset.geometry.type === "Polygon" &&
        Array.isArray(coords[0]) &&
        coords[0].length > 0
      ) {
        const ring = coords[0] as number[][];
        let lngSum = 0,
          latSum = 0,
          validCount = 0;
        ring.forEach((c) => {
          if (Array.isArray(c) && c.length >= 2) {
            lngSum += c[0];
            latSum += c[1];
            validCount++;
          }
        });
        if (validCount > 0) {
          setFlyTo({
            center: [latSum / validCount, lngSum / validCount],
            zoom: 13,
          });
        }
      } else if (
        asset.geometry.type === "MultiPolygon" &&
        Array.isArray(coords[0]) &&
        Array.isArray(coords[0][0])
      ) {
        const firstPoly = coords[0] as number[][][];
        const ring = firstPoly[0];
        let lngSum = 0,
          latSum = 0,
          validCount = 0;
        ring.forEach((c) => {
          if (Array.isArray(c) && c.length >= 2) {
            lngSum += c[0];
            latSum += c[1];
            validCount++;
          }
        });
        if (validCount > 0) {
          setFlyTo({
            center: [latSum / validCount, lngSum / validCount],
            zoom: 13,
          });
        }
      }
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedAsset(null);
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
    setActiveRefLayers(["regions"]);
    setHeritageVisible(true);
    setSelectedAsset(null);
    setFlyTo({ center: [7.9465, -1.0232], zoom: 7 });
  }, [periodRange]);

  const handleZoomToAsset = useCallback((asset: HeritageAsset) => {
    if (asset.geometry?.coordinates) {
      const coords = asset.geometry.coordinates;
      if (asset.geometry.type === "Point" && Array.isArray(coords) && coords.length >= 2) {
        const lat = coords[1] as number;
        const lng = coords[0] as number;
        if (!isNaN(lat) && !isNaN(lng)) {
          setFlyTo({
            center: [lat, lng],
            zoom: 14,
          });
        }
      } else if (
        (asset.geometry.type === "Polygon" || asset.geometry.type === "MultiPolygon") &&
        Array.isArray(coords[0])
      ) {
        const ring = Array.isArray(coords[0][0])
          ? (coords[0] as number[][][])[0][0]
          : (coords[0] as number[][]);
        if (Array.isArray(ring)) {
          let lngSum = 0,
            latSum = 0,
            validCount = 0;
          ring.forEach((c: number[]) => {
            if (Array.isArray(c) && c.length >= 2) {
              lngSum += c[0];
              latSum += c[1];
              validCount++;
            }
          });
          if (validCount > 0) {
            setFlyTo({
              center: [latSum / validCount, lngSum / validCount],
              zoom: 14,
            });
          }
        }
      }
    }
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
      <Header hideRollingBanner />

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
          />
          <ReferenceLayers activeLayers={activeRefLayers} darkMode={darkMode} />
        </MapView>

        {/* ZONE 1: TOP-LEFT COMMAND DOCK (SEARCH & FILTERS) */}
        <div className="absolute top-4 left-4 sm:left-6 z-[1000] flex flex-col items-start gap-2.5 w-[240px]">
          <SearchBar onSelectAsset={handleSelectAsset} darkMode={darkMode} />
          <LayerControl
            layers={layerItems}
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4002B]" />
                <span
                  className={`text-[10px] font-mono uppercase font-bold tracking-wider ${badgeText}`}
                >
                  {assetCount} ASSET{assetCount !== 1 ? "S" : ""} MATCHED
                </span>
              </div>
              <button
                onClick={handleResetMap}
                className="text-[9px] uppercase font-mono font-bold tracking-wider text-[#E4002B] hover:text-[#FF4D4D] border-l border-white/10 pl-3 transition-colors"
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
