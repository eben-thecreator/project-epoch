import React, { useState } from "react";
import { Basemap } from "./MapView";

interface CompassControlProps {
  darkMode?: boolean;
  basemap?: Basemap;
  onToggleTheme?: () => void;
  onBasemapChange?: (basemap: Basemap) => void;
  onReset?: () => void;
}

const BASEMAP_OPTIONS: { key: Basemap; label: string; icon: React.ReactNode }[] = [
  {
    key: "light",
    label: "Light Vector",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    key: "dark",
    label: "Dark Vector",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    key: "satellite",
    label: "Satellite Imagery",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

export const CompassControl: React.FC<CompassControlProps> = ({
  darkMode = false,
  basemap,
  onToggleTheme,
  onBasemapChange,
  onReset,
}) => {
  const [showBasemapPicker, setShowBasemapPicker] = useState(false);
  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/15" : "border-black/15";
  const text = darkMode ? "text-white" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const hoverBg = darkMode ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.05]";
  const activeBg = darkMode ? "bg-white/10" : "bg-black/10";
  const divider = darkMode ? "border-white/10" : "border-black/10";

  const activeBasemap = basemap ?? (darkMode ? "dark" : "light");

  return (
    <div className="flex flex-col items-end gap-2 relative z-[1000]">
      {/* Spatial Tool Strip */}
      <div className={`${bg} border ${border} shadow-md flex flex-col divide-y ${divider}`}>
        {/* Basemap Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowBasemapPicker((p) => !p)}
            className={`w-9 h-9 flex items-center justify-center ${hoverBg} transition-colors group`}
            title="Switch Basemap Style"
          >
            <svg
              className={`w-4 h-4 ${text} group-hover:scale-110 transition-transform`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6 3m0 10l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7"
              />
            </svg>
          </button>

          {showBasemapPicker && (
            <div
              className={`absolute right-full top-0 mr-2 ${bg} border ${border} shadow-xl flex flex-col w-44 overflow-hidden z-[1002]`}
            >
              <div className={`px-3 py-1.5 border-b ${divider}`}>
                <span className={`text-[9px] uppercase font-mono tracking-widest ${muted}`}>
                  BASEMAP STYLE
                </span>
              </div>
              {BASEMAP_OPTIONS.map((opt) => {
                const isActive = activeBasemap === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      onBasemapChange?.(opt.key);
                      setShowBasemapPicker(false);
                    }}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 text-left transition-colors
                      ${isActive ? activeBg : hoverBg}
                      ${text}
                    `}
                  >
                    <span className={isActive ? (darkMode ? "text-[#FF6B6B]" : "text-brand") : muted}>
                      {opt.icon}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${isActive ? "font-bold" : ""}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme Mode Switcher */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 flex items-center justify-center ${hoverBg} transition-colors group`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg
                className={`w-4 h-4 ${text} group-hover:rotate-45 transition-transform`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className={`w-4 h-4 ${text} group-hover:-rotate-12 transition-transform`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        )}

        {/* Compass Rosette */}
        <div
          className="w-9 h-9 flex items-center justify-center relative select-none"
          title="Compass Orientation: North Up"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.5 10H8.5L12 2Z"
              fill={darkMode ? "#E4002B" : "#E4002B"}
            />
            <path
              d="M12 22L8.5 14H15.5L12 22Z"
              fill={darkMode ? "#333333" : "#CCCCCC"}
            />
            <text
              x="12"
              y="4.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="4"
              fontWeight="900"
              fontFamily="monospace"
            >
              N
            </text>
          </svg>
        </div>

        {/* Reset Map View */}
        {onReset && (
          <button
            onClick={onReset}
            className={`w-9 h-9 flex items-center justify-center ${hoverBg} transition-colors group`}
            title="Reset Map Bounds"
          >
            <svg
              className={`w-4 h-4 ${text} group-hover:rotate-180 transition-transform duration-300`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

CompassControl.displayName = "CompassControl";
