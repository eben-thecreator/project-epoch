import React from "react";

interface CompassControlProps {
  darkMode?: boolean;
  onToggleTheme?: () => void;
}

export const CompassControl: React.FC<CompassControlProps> = ({ darkMode = false, onToggleTheme }) => {
  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/10" : "border-black/10";
  const text = darkMode ? "text-white/90" : "text-black";
  const muted = darkMode ? "text-white/30" : "text-black/30";

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-center gap-2">
      {/* Compass */}
      <div className={`${bg} border ${border} shadow-sm w-9 h-9 flex items-center justify-center`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15 10H9L12 2Z" fill={darkMode ? "#ffffff" : "#000000"} />
          <path d="M12 22L9 14H15L12 22Z" fill={darkMode ? "#444444" : "#cccccc"} />
          <text x="12" y="4" textAnchor="middle" fill={darkMode ? "#ffffff" : "#000000"} fontSize="5" fontWeight="700" fontFamily="Helvetica, Arial, sans-serif">N</text>
        </svg>
      </div>

      {/* Theme Toggle */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className={`${bg} border ${border} shadow-sm w-9 h-9 flex items-center justify-center ${darkMode ? "hover:bg-white/5" : "hover:bg-black/[0.03]"} transition-colors`}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg className={`w-4 h-4 ${text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className={`w-4 h-4 ${text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

CompassControl.displayName = "CompassControl";
