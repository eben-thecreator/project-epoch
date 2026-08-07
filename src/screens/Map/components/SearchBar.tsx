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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
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
        .then((r) => r.json())
        .then((data: HeritageAsset[]) => {
          setResults(data.slice(0, 12));
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
  const border = darkMode ? "border-white/10" : "border-black/10";
  const text = darkMode ? "text-white" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const hoverBg = darkMode
    ? "hover:bg-white/[0.03]"
    : "hover:bg-black/[0.03]";
  const divider = darkMode ? "border-white/5" : "border-black/5";

  return (
    <div ref={wrapperRef} className="w-full relative">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`group relative ${bg} border ${border} shadow-sm font-bold px-4 py-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest w-full transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-black/[0.02]"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className={`w-3.5 h-3.5 shrink-0 ${text}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className={text}>Search Assets</span>
        </button>
      )}

      {open && (
        <div
          className={`relative ${bg} border ${border} shadow-sm px-4 py-3 flex items-center gap-2 w-full`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
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
            placeholder="Search assets..."
            className={`flex-1 text-[10px] uppercase tracking-widest font-medium ${text} placeholder:${muted} outline-none bg-transparent`}
          />
          {loading && (
            <div
              className={`w-3 h-3 border ${darkMode ? "border-white/20 border-t-white/60" : "border-black/20 border-t-black/60"} rounded-full animate-spin shrink-0`}
            />
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 ${bg} border ${border} shadow-sm max-h-[320px] overflow-y-auto z-[1001]`}
        >
          {results.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleSelect(asset)}
              className={`w-full text-left px-3 py-2.5 ${hoverBg} border-b ${divider} last:border-0 transition-colors`}
            >
              <div
                className={`text-[10px] uppercase font-bold ${text} truncate`}
              >
                {asset.name ||
                  asset.alternative_name ||
                  "Untitled"}
              </div>
              <div
                className={`text-[9px] uppercase ${muted} mt-0.5`}
              >
                {[
                  asset.asset_category,
                  asset.district,
                  asset.region,
                ]
                  .filter(Boolean)
                  .join(" \u00B7 ")}
              </div>
            </button>
          ))}
        </div>
      )}

      {open &&
        query.trim().length >= 2 &&
        results.length === 0 &&
        !loading && (
          <div
            className={`absolute top-full left-0 right-0 mt-1 ${bg} border ${border} shadow-sm px-3 py-4 text-center z-[1001]`}
          >
            <p
              className={`text-[10px] uppercase ${muted}`}
            >
              No results found
            </p>
          </div>
        )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";
