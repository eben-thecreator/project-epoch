import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { apiUrl } from "../../../lib/api";
import { cn } from "../../../lib/utils";
import { assetPoint, formatDistance, haversineKm } from "../lib/atlas";
import { isWorldHeritage } from "./AssetMarker";

type ResultAsset = {
  id: string;
  name: string;
  alternative_name?: string | null;
  asset_category?: string | null;
  period?: string | null;
  region?: string | null;
  conservation_status?: string | null;
};

interface SearchPanelProps {
  onSelectResult: (asset: { id: string }) => void;
  onQueryChange?: (query: string) => void;
  initialQuery?: string;
  referencePoint?: [number, number] | null;
  onFrameBounds?: (bounds: L.LatLngBounds) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  onSelectResult,
  onQueryChange,
  initialQuery = "",
  referencePoint = null,
  onFrameBounds,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ResultAsset[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onQueryChange?.(query.trim());
  }, [query, onQueryChange]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        setTotal(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const params = new URLSearchParams({ limit: "40", page: "1" });
      params.set("search", query.trim());
      fetch(apiUrl(`/api/heritage-assets?${params.toString()}`), {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((payload: unknown) => {
          const body = payload as {
            data?: ResultAsset[];
            pagination?: { total?: number };
          };
          setResults(Array.isArray(body?.data) ? body.data : []);
          setTotal(typeof body?.pagination?.total === "number" ? body.pagination.total : null);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if ((err as Error)?.name === "AbortError") return;
          setResults([]);
          setTotal(null);
          setLoading(false);
        });
    }, 280);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const shown = results.slice(0, 8);

  useEffect(() => setActiveIndex(-1), [results.length]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const choose = (asset: ResultAsset) => {
    setFocused(false);
    onSelectResult(asset);
  };

  const frameResults = () => {
    const pts = results
      .map((a) => assetPoint(a as never))
      .filter((p): p is [number, number] => p !== null);
    if (pts.length === 0) return;
    const bounds = L.latLngBounds(pts.map(([lat, lng]) => L.latLng(lat, lng)));
    onFrameBounds?.(bounds);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (query) setQuery("");
      else inputRef.current?.blur();
      setFocused(false);
      return;
    }
    if (!shown.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(true);
      setActiveIndex((i) => Math.min(i + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0 && shown[activeIndex]) {
      e.preventDefault();
      choose(shown[activeIndex]);
    }
  };

  const hasQuery = query.trim().length > 0;
  const open = hasQuery && (focused || results.length > 0);

  return (
    <div ref={rootRef} className="map-chrome pointer-events-auto relative w-full">
      <div className="relative flex h-9 items-center gap-2.5 sm:h-11">
        <svg
          className="h-4 w-4 shrink-0 text-ink-soft"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6.5" />
          <path strokeLinecap="round" d="M14 14l4.5 4.5" />
        </svg>
        <input
          ref={inputRef}
          id="atlas-search-input"
          type="search"
          value={query}
          maxLength={80}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder={"Search the atlas\u2026"}
          aria-label="Search the atlas"
          role="combobox"
          aria-expanded={open && shown.length > 0}
          aria-controls="atlas-search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `atlas-result-${activeIndex}` : undefined
          }
          className="f-body-2 min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-0 focus:border-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex h-5 w-5 shrink-0 items-center justify-center text-ink-soft transition-colors duration-200 ease-house hover:text-ink"
          >
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-[1015] border-b border-hairline bg-white">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
            <span className="f-caption tabular-nums text-ink-soft">
              {loading
                ? "Searching\u2026"
                : `${total !== null ? total.toLocaleString() : results.length} record${total === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={frameResults}
              className="f-caption text-ink transition-opacity duration-200 hover:opacity-60"
            >
              Frame on map
            </button>
          </div>

          {!loading && results.length === 0 && (
            <p className="f-caption px-4 py-6 text-ink-soft">
              {`Nothing matches \u201c${query.trim()}\u201d. Try a shorter term or a place name.`}
            </p>
          )}

          <ul id="atlas-search-results" role="listbox" aria-label="Search results" className="max-h-[400px] overflow-y-auto">
            {shown.map((asset, i) => {
              const unesco = isWorldHeritage(asset.conservation_status);
              const pt = referencePoint ? assetPoint(asset as never) : null;
              const dist =
                pt && referencePoint
                  ? formatDistance(haversineKm(referencePoint, pt))
                  : null;
              return (
                <li key={asset.id} id={`atlas-result-${i}`} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => choose(asset)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-hairline px-4 py-3 text-left transition-colors duration-150 last:border-b-0",
                      i === activeIndex ? "bg-ground-deep" : "bg-white"
                    )}
                  >
                    <span className="f-body-2 min-w-0 flex-1 truncate text-ink">
                      {asset.name || asset.alternative_name || "Untitled"}
                      {unesco && (
                        <span aria-label="World Heritage" title="World Heritage" className="ml-1.5 text-brand">&#9733;</span>
                      )}
                    </span>
                    <span className="f-caption shrink-0 tabular-nums text-ink-soft">
                      {[dist, asset.region].filter(Boolean).join(" \u00b7 ")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {results.length > shown.length && (
            <p className="f-caption border-t border-hairline px-4 py-2 text-center text-ink-soft">
              Refine the query to see all {total?.toLocaleString() ?? results.length} records
            </p>
          )}
        </div>
      )}
    </div>
  );
};

SearchPanel.displayName = "SearchPanel";
