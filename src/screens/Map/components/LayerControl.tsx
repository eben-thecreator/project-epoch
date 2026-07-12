import React from "react";

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
  { key: "asset_category", label: "Asset Type", options: ["Museum", "Monument", "Shrine", "Palace", "Fort", "Castle", "Artifact", "Archaeological Site", "Sacred Grove", "Historic Building", "Traditional Palace", "Festival", "Textile"] },
  { key: "period", label: "Period", options: ["Colonial", "Pre-colonial", "Contemporary", "Pre-independence", "Post-independence", "Medieval", "Ancient"] },
  { key: "condition", label: "Condition", options: ["Excellent", "Good", "Fair", "Poor", "Critical"] },
  { key: "ownership", label: "Ownership", options: ["Government", "Community", "Private"] },
  { key: "conservation_status", label: "UNESCO Status", options: ["World Heritage", "Tentative", "National Monument"] },
  { key: "material", label: "Material", options: ["Clay", "Stone", "Wood", "Metal", "Textile", "Concrete", "Brick"] },
  { key: "cultural_group", label: "Culture", options: ["Akan", "Ga", "Ewe", "Dagomba", "Mamprusi", "Gonja", "Fante", "Ashanti", "Frafra", "Dagaaba"] },
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
  const [layersOpen, setLayersOpen] = React.useState(true);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [expandedFilter, setExpandedFilter] = React.useState<string | null>(null);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/10" : "border-black/10";
  const text = darkMode ? "text-white/90" : "text-black";
  const muted = darkMode ? "text-white/50" : "text-black/70";
  const hoverBg = darkMode ? "hover:bg-white/5" : "hover:bg-black/[0.02]";
  const divider = darkMode ? "border-white/5" : "border-black/5";

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
      className={`${bg} border ${border} shadow-sm flex flex-col`}
      style={{ width: 220, maxHeight: "calc(100vh - 180px)" }}
    >
      {/* Fixed Header: Layers */}
      <div className={`flex-shrink-0 border-b ${divider}`}>
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase font-bold ${text}`}
        >
          <span>Layers</span>
          <svg
            className={`w-3 h-3 transition-transform ${layersOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {layersOpen && (
          <div className="px-3 pb-2">
            {layers.map((layer) => (
              <label
                key={layer.key}
                className="flex items-center gap-2 py-1 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={layer.active}
                  onChange={() => onToggle(layer.key)}
                  className={`w-3 h-3 border rounded-sm cursor-pointer ${darkMode ? "border-white/30 accent-white" : "border-black/30 accent-black"}`}
                />
                <span className={`text-[10px] uppercase font-medium ${muted}`}>
                  {layer.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Header: Filters */}
      <div className={`flex-shrink-0 border-b ${divider}`}>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase font-bold ${text}`}
        >
          <div className="flex items-center gap-2">
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none`}>
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg
            className={`w-3 h-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filtersOpen && (
          <div>
            {activeFilterCount > 0 && (
              <div className="px-3 pt-2 pb-1">
                <button
                  onClick={clearAllFilters}
                  className={`text-[9px] uppercase ${darkMode ? "text-white/30 hover:text-white/60" : "text-black/40 hover:text-black"} font-medium`}
                >
                  Clear all
                </button>
              </div>
            )}
            {filterSections.map((section) => {
              const isExpanded = expandedFilter === section.key;
              const selectedValues = filters[section.key] ? filters[section.key].split(",") : [];

              return (
                <div key={section.key} className={`border-b ${divider} last:border-0`}>
                  <button
                    onClick={() => setExpandedFilter(isExpanded ? null : section.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 ${hoverBg}`}
                  >
                    <span className={`text-[10px] uppercase font-bold ${text}`}>
                      {section.label}
                    </span>
                    {selectedValues.length > 0 && (
                      <span className={`text-[9px] ${darkMode ? "bg-white/10 text-white/60" : "bg-black/10 text-black"} px-1.5 py-0.5 rounded-full font-bold`}>
                        {selectedValues.length}
                      </span>
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-2">
                      {section.options.map((opt) => {
                        const selected = selectedValues.includes(opt);
                        return (
                          <label
                            key={opt}
                            className="flex items-center gap-2 py-1 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleFilter(section.key, opt)}
                              className={`w-3 h-3 border rounded-sm cursor-pointer ${darkMode ? "border-white/30 accent-white" : "border-black/30 accent-black"}`}
                            />
                            <span className={`text-[10px] ${darkMode ? "text-white/50" : "text-black/60"}`}>{opt}</span>
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

        {!filtersOpen && !layersOpen && (
          <div className="px-3 py-4 text-center">
            <p className={`text-[10px] ${muted}`}>No layers or filters active</p>
          </div>
        )}
      </div>
    </div>
  );
};

LayerControl.displayName = "LayerControl";
