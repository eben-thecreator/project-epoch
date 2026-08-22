import React, { useState, useCallback, useRef, useEffect } from "react";
import { HeritageAsset } from "./HeritageLayer";
import { apiUrl } from "../../../lib/api";

interface SearchBarProps {
  onSelectAsset: (asset: HeritageAsset) => void;
  darkMode?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectAsset,
  darkMode = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HeritageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const search = useCallback((term: string) => {
    clearTimeout(timerRef.current);
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(() => {
      setLoading(true);
      fetch(
        apiUrl(
          `/api/heritage-assets?search=${encodeURIComponent(
            term.trim()
          )}`
        )
      )
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data: unknown) => {
          setResults(Array.isArray(data) ? (data as HeritageAsset[]).slice(0, 12) : []);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  const handleSelect = (asset: HeritageAsset) => {
    onSelectAsset(asset);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/15" : "border-black/15";
  const text = darkMode ? "text-white" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const hoverBg = darkMode
    ? "hover:bg-white/[0.05]"
    : "hover:bg-black/[0.04]";
  const divider = darkMode ? "border-white/10" : "border-black/10";

  return (
    <div ref={wrapperRef} className="w-full relative">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`group relative ${bg} border ${border} shadow-md font-semibold px-3 py-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest w-full transition-colors ${darkMode ? "hover:border-white/30" : "hover:border-black/30"}`}
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`w-3.5 h-3.5 shrink-0 ${darkMode ? "text-white/70" : "text-black/70"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className={text}>Search Assets</span>
          </div>
          <kbd
            className={`text-[9px] font-mono font-medium px-1.5 py-0.5 border ${border} ${darkMode ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"}`}
          >
            ⌘K
          </kbd>
        </button>
      )}

      {open && (
        <div
          className={`relative ${bg} border ${border} shadow-md px-3 py-2 flex items-center gap-2 w-full`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className={`w-3.5 h-3.5 shrink-0 ${muted} pointer-events-none`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="TYPE ASSET NAME OR PLACE..."
            className={`flex-1 text-[10px] uppercase tracking-wider font-semibold ${text} placeholder:${muted} outline-none bg-transparent`}
          />
          {loading ? (
            <div
              className={`w-3 h-3 border ${darkMode ? "border-white/20 border-t-white" : "border-black/20 border-t-black"} rounded-full animate-spin shrink-0`}
            />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className={`text-[10px] ${muted} hover:${text}`}
            >
              ✕
            </button>
          ) : (
            <span className={`text-[9px] font-mono ${muted}`}>ESC</span>
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 ${bg} border ${border} shadow-lg max-h-[300px] overflow-y-auto z-[1001]`}
        >
          {results.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleSelect(asset)}
              className={`w-full text-left px-3 py-2 ${hoverBg} border-b ${divider} last:border-0 transition-colors flex items-center justify-between`}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div
                  className={`text-[10px] uppercase font-bold ${text} truncate`}
                >
                  {asset.name ||
                    asset.alternative_name ||
                    "Untitled"}
                </div>
                <div
                  className={`text-[9px] uppercase tracking-wider ${muted} mt-0.5 truncate`}
                >
                  {[
                    asset.asset_category,
                    asset.district,
                    asset.region,
                  ]
                    .filter(Boolean)
                    .join(" \u00B7 ")}
                </div>
              </div>
              <span className={`text-[9px] font-mono uppercase ${darkMode ? "text-[#FF6B6B]" : "text-[#E4002B]"}`}>
                VIEW ↗
              </span>
            </button>
          ))}
        </div>
      )}

      {open &&
        query.trim().length >= 2 &&
        results.length === 0 &&
        !loading && (
          <div
            className={`absolute top-full left-0 right-0 mt-1 ${bg} border ${border} shadow-md px-3 py-4 text-center z-[1001]`}
          >
            <p
              className={`text-[10px] uppercase font-mono ${muted}`}
            >
              No matching assets
            </p>
          </div>
        )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";
