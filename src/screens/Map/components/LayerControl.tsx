import React, { useState } from "react";

interface LayerItem {
  key: string;
  label: string;
  active: boolean;
}

interface FilterSection {
  key: string;
  label: string;
  options: string[];
}

const filterSections: FilterSection[] = [
  {
    key: "asset_category",
    label: "Asset Type",
    options: [
      "Museum",
      "Monument",
      "Shrine",
      "Palace",
      "Fort",
      "Castle",
      "Artifact",
      "Archaeological Site",
      "Sacred Grove",
      "Historic Building",
      "Traditional Palace",
      "Festival",
      "Textile",
    ],
  },
  {
    key: "period",
    label: "Historical Era",
    options: [
      "Colonial",
      "Pre-colonial",
      "Contemporary",
      "Pre-independence",
      "Post-independence",
      "Medieval",
      "Ancient",
    ],
  },
  {
    key: "condition",
    label: "Condition",
    options: ["Excellent", "Good", "Fair", "Poor", "Critical"],
  },
  {
    key: "ownership",
    label: "Ownership",
    options: ["Government", "Community", "Private"],
  },
  {
    key: "conservation_status",
    label: "UNESCO Status",
    options: ["World Heritage", "Tentative", "National Monument"],
  },
  {
    key: "material",
    label: "Material",
    options: [
      "Clay",
      "Stone",
      "Wood",
      "Metal",
      "Textile",
      "Concrete",
      "Brick",
    ],
  },
  {
    key: "cultural_group",
    label: "Cultural Tradition",
    options: [
      "Akan",
      "Ga",
      "Ewe",
      "Dagomba",
      "Mamprusi",
      "Gonja",
      "Fante",
      "Ashanti",
      "Frafra",
      "Dagaaba",
    ],
  },
];

interface LayerControlProps {
  layers: LayerItem[];
  onToggle: (key: string) => void;
  filters: Record<string, string>;
  onFilterChange: (filters: Record<string, string>) => void;
  darkMode?: boolean;
}

export const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  onToggle,
  filters,
  onFilterChange,
  darkMode = false,
}) => {
  const [layersOpen, setLayersOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/15" : "border-black/15";
  const text = darkMode ? "text-white" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const labelText = darkMode ? "text-white/80" : "text-black/80";
  const hoverBg = darkMode ? "hover:bg-white/[0.04]" : "hover:bg-black/[0.03]";
  const divider = darkMode ? "border-white/10" : "border-black/10";

  const toggleFilter = (sectionKey: string, value: string) => {
    const current = filters[sectionKey] ? filters[sectionKey].split(",") : [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [sectionKey]: next.join(",") });
  };

  const clearAllFilters = () => {
    const cleared: Record<string, string> = {};
    Object.keys(filters).forEach((k) => (cleared[k] = ""));
    onFilterChange(cleared);
  };

  return (
    <div
      className={`${bg} border ${border} shadow-md flex flex-col w-full transition-all`}
      style={{ width: 240, maxHeight: "calc(100vh - 220px)" }}
    >
      {/* Layers Accordion Header */}
      <div className={`flex-shrink-0 border-b ${divider}`}>
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase font-bold tracking-wider ${text} ${hoverBg} transition-colors`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>Cartographic Layers</span>
          </div>
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${layersOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {layersOpen && (
          <div className="px-3 pb-2 pt-1 space-y-1">
            {layers.map((layer) => (
              <label
                key={layer.key}
                className="flex items-center justify-between py-1 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layer.active}
                    onChange={() => onToggle(layer.key)}
                    className={`w-3 h-3 border rounded-none cursor-pointer ${darkMode ? "border-white/30 accent-[#FF6B6B]" : "border-black/30 accent-[#E4002B]"}`}
                  />
                  <span
                    className={`text-[10px] uppercase font-semibold ${layer.active ? text : muted} group-hover:${text}`}
                  >
                    {layer.label}
                  </span>
                </div>
                {layer.key === "__heritage__" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4002B]" />
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filters Accordion Header */}
      <div className={`flex-shrink-0 border-b ${divider}`}>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase font-bold tracking-wider ${text} ${hoverBg} transition-colors`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Attribute Filters</span>
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="bg-[#E4002B] text-white text-[9px] font-mono px-1.5 py-0.5 font-bold">
                {activeFilterCount}
              </span>
            )}
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Scrollable Filter List */}
      {filtersOpen && (
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-white/5">
          {activeFilterCount > 0 && (
            <div className="px-3 py-1.5 flex justify-between items-center bg-red-500/5">
              <span className="text-[9px] uppercase font-mono text-[#E4002B]">
                {activeFilterCount} FILTER{activeFilterCount > 1 ? "S" : ""} ACTIVE
              </span>
              <button
                onClick={clearAllFilters}
                className={`text-[9px] uppercase font-bold tracking-wider ${darkMode ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"} underline transition-colors`}
              >
                Clear all
              </button>
            </div>
          )}

          {filterSections.map((section) => {
            const isExpanded = expandedFilter === section.key;
            const selectedValues = filters[section.key]
              ? filters[section.key].split(",")
              : [];

            return (
              <div key={section.key} className={`border-b ${divider} last:border-0`}>
                <button
                  onClick={() =>
                    setExpandedFilter(isExpanded ? null : section.key)
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 ${hoverBg} transition-colors`}
                >
                  <span className={`text-[10px] uppercase font-semibold ${selectedValues.length > 0 ? (darkMode ? "text-[#FF6B6B]" : "text-[#E4002B]") : labelText}`}>
                    {section.label}
                  </span>
                  {selectedValues.length > 0 ? (
                    <span className="text-[9px] font-mono font-bold bg-[#E4002B] text-white px-1.5 py-0.5">
                      {selectedValues.length}
                    </span>
                  ) : (
                    <span className={`text-[10px] ${muted}`}>
                      {isExpanded ? "−" : "+"}
                    </span>
                  )}
                </button>
                {isExpanded && (
                  <div className="px-3 pb-2 pt-1 space-y-1">
                    {section.options.map((opt) => {
                      const selected = selectedValues.includes(opt);
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-2 py-0.5 cursor-pointer select-none group"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleFilter(section.key, opt)}
                            className={`w-3 h-3 border rounded-none cursor-pointer ${darkMode ? "border-white/30 accent-[#FF6B6B]" : "border-black/30 accent-[#E4002B]"}`}
                          />
                          <span
                            className={`text-[10px] font-medium ${selected ? text : muted} group-hover:${text}`}
                          >
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

LayerControl.displayName = "LayerControl";
