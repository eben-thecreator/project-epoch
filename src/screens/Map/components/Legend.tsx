import React, { useState } from "react";
import { categoryColor } from "../../../lib/categories";

const paths: Record<string, string> = {
  museum:
    "M4 10v10h2V10H4zm6 0v10h2V10h-2zm6 0v10h2V10h-2zM2 22h20v-2H2v2zm11-18L3 8h18L13 4z",
  castle:
    "M21 7v13H3V7h3v2h2V7h2v2h2V7h2v2h2V7h5zM9 14H7v3h2v-3zm6 0h-2v3h2v-3z",
  monument: "M9 22h6v-2H9v2zm1-2h4V6l-2-4-2 4v14z",
  shrine:
    "M4 22h2v-8c0-3.31 2.69-6 6-6s6 2.69 6 6v8h2v-8c0-4.42-3.58-8-8-8s-8 3.58-8 8v8z",
  palace:
    "M3 22h18v-4H3v4zm2-6h2V6L5 8v8zm5 0h4V4l-2-2-2 2v12zm5 0h2V8l-2-2v10z",
  artifact:
    "M16 4h-8L6 9v2c0 2 1.5 3.5 3 4v5h6v-5c1.5-.5 3-2 3-4V9l-2-5z",
  jewelry: "M12 2L2 9l10 13 10-13L12 2zm0 3.5l4 4.5H8l4-4.5z",
  site: "M15.5 2.5l6 6-4 4-2-2-6 6v4h-4v-4l6-6-2-2 4-4z",
  grove:
    "M12 2C7 2 4 6 4 10c0 3 2 5.5 4.5 6.5V22h7v-5.5C18 15.5 20 13 20 10c0-4-3-8-8-8z",
  building:
    "M12 3L2 12h3v8h14v-8h3L12 3zm-2 15H7v-5h3v5zm7 0h-3v-5h3v5z",
  festival: "M7 4h10v16H7V4zm2 2v2h6V6H9zm0 10v2h6v-2H9z",
  textile:
    "M4 4h2v16H4V4zm4 0h2v16H8V4zm4 0h2v16h-2V4zm4 0h2v16h-2V4z M2 6h20v2H2V6zm0 4h20v2H2v-2zm0 4h20v2H2v-2zm0 4h20v2H2v-2z",
  media:
    "M20 6h-4l-2-2H10L8 6H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1.9-2 2-2zm-8 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  audio:
    "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
  circle:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
};

/** Glyph shape per category — mirrors the map marker icons. */
const CATEGORY_SHAPES: Record<string, string> = {
  Museum: "museum",
  Fort: "castle",
  Castle: "castle",
  Monument: "monument",
  Shrine: "shrine",
  Palace: "palace",
  "Traditional Palace": "palace",
  Artifact: "artifact",
  "Jewelry / Beadwork": "jewelry",
  "Archaeological Site": "site",
  "Sacred Grove": "grove",
  "Historic Building": "building",
  Festival: "festival",
  Textile: "textile",
  "Textile (Kente, etc.)": "textile",
  "Photograph / Digital Media": "media",
  "Audio / Music": "audio",
};

function renderShape(shape: string, size: number = 10) {
  const pathD = paths[shape] || paths.circle;
  return (
    <g transform={`scale(${size / 24})`}>
      <path d={pathD} fill="#fff" />
    </g>
  );
}

interface LegendProps {
  visibleCategories: string[];
  categoryCounts?: Record<string, number>;
  darkMode?: boolean;
}

export const Legend: React.FC<LegendProps> = ({
  visibleCategories,
  categoryCounts = {},
  darkMode = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (visibleCategories.length === 0) return null;

  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/15" : "border-black/15";
  const text = darkMode ? "text-white" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const hoverBg = darkMode ? "hover:bg-white/5" : "hover:bg-black/5";

  return (
    <div
      className={`absolute bottom-4 right-4 z-[1000] ${bg} border ${border} shadow-md transition-all select-none`}
      style={{ maxWidth: 240 }}
    >
      {/* Header Button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-[12px] uppercase font-bold tracking-wider ${text} ${hoverBg} transition-colors`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span>MAP LEGEND</span>
          <span className={`text-[9px] font-mono ${muted}`}>
            ({visibleCategories.length})
          </span>
        </div>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable Category List */}
      {!collapsed && (
        <div className="px-3.5 pb-3 pt-1.5 space-y-2 border-t border-black/5 max-h-56 overflow-y-auto">
          {visibleCategories.map((cat) => {
            const color = categoryColor(cat, darkMode);
            const shape = CATEGORY_SHAPES[cat] || "circle";
            const count = categoryCounts[cat];
            return (
              <div key={cat} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Swatch mirrors real map symbology: coloured disc + white glyph */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="shrink-0 rounded-full border border-black/10 dark:border-white/20"
                    style={{ backgroundColor: color }}
                  >
                    {renderShape(shape)}
                  </svg>
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wider ${darkMode ? "text-white/80" : "text-black/80"} truncate`}
                  >
                    {cat}
                  </span>
                </div>
                {count !== undefined && (
                  <span className={`text-[11px] font-mono ${muted} tabular-nums`}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

Legend.displayName = "Legend";
