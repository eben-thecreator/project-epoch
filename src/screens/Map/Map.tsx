import React, { useState, useCallback, useEffect } from "react";
import { Header } from "../../components/Header";
import { MapView } from "./components/MapView";
import { HeritageLayer, HeritageAsset } from "./components/HeritageLayer";
import { ReferenceLayers } from "./components/ReferenceLayers";
import { LayerControl } from "./components/LayerControl";
import { SearchBar } from "./components/SearchBar";
import { SidePanel } from "./components/SidePanel";
import { TimeSlider } from "./components/TimeSlider";
import { Legend } from "./components/Legend";
import { CompassControl } from "./components/CompassControl";
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
  const [selectedAsset, setSelectedAsset] =
    useState<HeritageAsset | null>(null);
  const [filters, setFilters] =
    useState<Record<string, string>>(defaultFilters);
  const [yearRange, setYearRange] = useState<[number, number]>([1100, 2026]);
  const [activeRefLayers, setActiveRefLayers] = useState<string[]>([
    "regions",
  ]);
  const [heritageVisible, setHeritageVisible] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<
    Record<string, number>
  >({});
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("schis-map-theme") === "dark";
  });
  const [periodRange, setPeriodRange] = useState({ min: 1100, max: 2026 });
  const [flyTo, setFlyTo] = useState<{
    center: [number, number];
    zoom: number;
  } | null>(null);
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
      .catch(() => {});
  }, []);

  const handleSelectAsset = useCallback((asset: HeritageAsset) => {
    setSelectedAsset(asset);
    if (asset.geometry?.coordinates) {
      const coords = asset.geometry.coordinates;
      if (
        asset.geometry.type === "Point" &&
        coords.length >= 2
      ) {
        setFlyTo({
          center: [coords[1] as number, coords[0] as number],
          zoom: 14,
        });
      } else if (
        asset.geometry.type === "Polygon" &&
        Array.isArray(coords[0]) &&
        coords[0].length > 0
      ) {
        const ring = coords[0] as number[][];
        let lngSum = 0,
          latSum = 0;
        ring.forEach((c) => {
          lngSum += c[0];
          latSum += c[1];
        });
        setFlyTo({
          center: [latSum / ring.length, lngSum / ring.length],
          zoom: 13,
        });
      } else if (
        asset.geometry.type === "MultiPolygon" &&
        Array.isArray(coords[0]) &&
        Array.isArray(coords[0][0])
      ) {
        const firstPoly = coords[0] as number[][][];
        const ring = firstPoly[0];
        let lngSum = 0,
          latSum = 0;
        ring.forEach((c) => {
          lngSum += c[0];
          latSum += c[1];
        });
        setFlyTo({
          center: [latSum / ring.length, lngSum / ring.length],
          zoom: 13,
        });
      }
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedAsset(null);
  }, []);

  const handleToggleRefLayer = useCallback((key: string) => {
    setActiveRefLayers((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
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

  const handleZoomToAsset = useCallback(
    (asset: HeritageAsset) => {
      if (asset.geometry?.coordinates) {
        const coords = asset.geometry.coordinates;
        if (
          asset.geometry.type === "Point" &&
          coords.length >= 2
        ) {
          setFlyTo({
            center: [coords[1] as number, coords[0] as number],
            zoom: 14,
          });
        } else if (
          (asset.geometry.type === "Polygon" ||
            asset.geometry.type === "MultiPolygon") &&
          Array.isArray(coords[0])
        ) {
          const ring = Array.isArray(coords[0][0])
            ? (coords[0] as number[][][])[0][0]
            : (coords[0] as number[][]);
          let lngSum = 0,
            latSum = 0;
          ring.forEach((c: number[]) => {
            lngSum += c[0];
            latSum += c[1];
          });
          setFlyTo({
            center: [latSum / ring.length, lngSum / ring.length],
            zoom: 14,
          });
        }
      }
    },
    []
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const isYearRangeFiltered =
    yearRange[0] !== periodRange.min || yearRange[1] !== periodRange.max;

  const bgColor = darkMode ? "bg-[#0a0a0a]" : "bg-white";

  return (
    <div className={`${bgColor} w-full h-screen flex flex-col`}>
      <Header hideRollingBanner />

      <div
        className="flex-1 relative"
        style={{ marginTop: 48 }}
      >
        <MapView darkMode={darkMode} flyTo={flyTo}>
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
          <ReferenceLayers
            activeLayers={activeRefLayers}
            darkMode={darkMode}
          />
        </MapView>

        <div
          className="absolute top-4 left-4 sm:left-6 lg:left-8 z-[1000] flex flex-col items-start gap-2"
          style={{ marginTop: 64 }}
        >
          <SearchBar
            onSelectAsset={handleSelectAsset}
            darkMode={darkMode}
          />
          <LayerControl
            layers={layerItems}
            onToggle={handleToggleLayer}
            filters={filters}
            onFilterChange={setFilters}
            darkMode={darkMode}
          />
        </div>

        {(hasActiveFilters || isYearRangeFiltered) && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]"
            style={{ marginTop: 64 }}
          >
            <div
              className={`${darkMode ? "bg-[#0d0d0d]" : "bg-white"} border ${darkMode ? "border-white/10" : "border-black/10"} shadow-sm px-3 py-1.5 flex items-center gap-3`}
            >
              <span
                className={`text-[10px] uppercase tracking-wider font-bold ${darkMode ? "text-white/60" : "text-black/60"}`}
              >
                {assetCount} asset{assetCount !== 1 ? "s" : ""} shown
              </span>
              {(hasActiveFilters || isYearRangeFiltered) && (
                <button
                  onClick={handleResetMap}
                  className={`text-[9px] uppercase tracking-wider font-bold ${darkMode ? "text-[#E4002B] hover:text-[#FF6B6B]" : "text-[#E4002B] hover:text-[#C0392B]"} transition-colors`}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        <CompassControl
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          onReset={handleResetMap}
        />
        <TimeSlider
          yearRange={yearRange}
          onChange={setYearRange}
          dataMin={periodRange.min}
          dataMax={periodRange.max}
          darkMode={darkMode}
        />
        <Legend
          visibleCategories={visibleCategories}
          categoryCounts={categoryCounts}
          darkMode={darkMode}
        />
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
