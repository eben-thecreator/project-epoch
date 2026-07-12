import React, { useState, useCallback, useRef, useEffect } from "react";
import { HeritageAsset } from "./HeritageLayer";
import { apiUrl } from "../../../lib/api";

interface SearchBarProps {
  onSelectAsset: (asset: HeritageAsset) => void;
  darkMode?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectAsset, darkMode = false }) => {
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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
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

  const search = useCallback((term: string) => {
    clearTimeout(timerRef.current);
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(() => {
      setLoading(true);
      fetch(apiUrl(`/api/heritage-assets?search=${encodeURIComponent(term.trim())}`))
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

  return (
    <div ref={wrapperRef} className="w-full relative">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group relative bg-black text-white font-bold px-10 py-4 flex items-center justify-center overflow-hidden text-[10px] uppercase tracking-widest w-full"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-3">
            Search Assets
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="absolute right-8 w-3.5 h-3.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      {open && (
        <div className="relative bg-black px-10 py-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search assets..."
            className="w-full text-[10px] uppercase tracking-[0.15em] font-medium text-white placeholder:text-white/40 outline-none bg-transparent pr-8"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {loading && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white/10 shadow-sm max-h-[320px] overflow-y-auto z-[1001]">
          {results.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleSelect(asset)}
              className="w-full text-left px-3 py-2.5 hover:bg-white/[0.03] border-b border-white/5 last:border-0 transition-colors"
            >
              <div className="text-[10px] uppercase tracking-wider font-bold text-white truncate">
                {asset.name || asset.alternative_name || "Untitled"}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">
                {[asset.asset_category, asset.district, asset.region].filter(Boolean).join(" · ")}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-white/10 shadow-sm px-3 py-4 text-center z-[1001]">
          <p className="text-[10px] uppercase tracking-wider text-white/40">No results found</p>
        </div>
      )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";
