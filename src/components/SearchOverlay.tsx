import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl, mediaUrl } from "../lib/api";
import { useFocusTrap } from "../lib/useFocusTrap";
import { cn } from "../lib/utils";

/**
 * Full-screen search panel in the reference anatomy: a giant borderless
 * field above pill filter chips grouped into Collection / Region bands,
 * with live catalogue results streaming beneath. Pills are outlined
 * hairline at rest, filled ink when live.
 */

const COLLECTION_SCOPES = [
  { label: "Objects", value: "artifacts" },
  { label: "Heritage Sites", value: "museums" },
  { label: "Textiles", value: "textiles" },
  { label: "Documents & Media", value: "documents" },
];

/** Ghana's sixteen administrative regions, alphabetical. */
const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

type AssetMedia = {
  mediaType: string;
  filePath: string;
  isPrimary?: boolean | null;
};

type SearchResultAsset = {
  id: string;
  name: string;
  alternative_name?: string | null;
  asset_category?: string | null;
  asset_type?: string | null;
  period?: string | null;
  region?: string | null;
  media?: AssetMedia[];
};

const previewImage = (media?: AssetMedia[]): string => {
  if (!media || media.length === 0) return "";
  const image =
    media.find((m) => m.isPrimary && m.mediaType === "image") ||
    media.find((m) => m.mediaType === "image") ||
    media[0];
  return image ? mediaUrl(image.filePath) : "";
};

/**
 * Resolve the best destination for a record. Artifact and site records
 * have detail routes; textile and document records currently resolve to
 * their collection grids.
 */
const routeFor = (asset: SearchResultAsset): string => {
  const category = asset.asset_category ?? "";
  if (["Museum", "Fort", "Castle", "Monument"].includes(category)) {
    return `/case-studies/museums/${asset.id}`;
  }
  if (category === "Textile (Kente, etc.)") return "/case-studies/textiles";
  if ((asset.asset_type ?? "").startsWith("Document")) {
    return "/case-studies/documents";
  }
  return `/case-studies/artifacts/${asset.id}`;
};

const metaLine = (asset: SearchResultAsset): string =>
  [asset.region, asset.period, asset.asset_category]
    .filter(Boolean)
    .join(" \u00b7 ");

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

/** The filter pill: hairline outline at rest, filled ink when live. */
const FilterChip = ({ label, selected, onClick }: FilterChipProps): JSX.Element => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      "f-caption inline-flex items-center rounded-full border px-3.5 py-1.5 transition-colors duration-200 ease-house focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink",
      selected
        ? "border-ink bg-ink text-paper"
        : "border-hairline bg-transparent text-ink-soft hover:border-ink hover:text-ink"
    )}
  >
    {label}
  </button>
);

export const SearchOverlay = ({
  open,
  onClose,
  onSelectResult,
}: {
  open: boolean;
  onClose: () => void;
  /** When supplied, results are handed to the host (e.g. fly-to on the
   * atlas) instead of routing to catalogue pages. */
  onSelectResult?: (asset: SearchResultAsset) => void;
}): JSX.Element => {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResultAsset[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useFocusTrap(panelRef, open, onClose);

  /** Lock body scroll while the panel is up */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /** Fresh start on every opening */
  useEffect(() => {
    if (!open) {
      setQuery("");
      setScope(null);
      setRegions([]);
      setResults([]);
      setTotal(null);
      setIsLoading(false);
    }
  }, [open]);

  /* Debounced live query against the catalogue API */
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: "12", page: "1" });
      const q = query.trim();
      if (q) params.set("search", q);
      if (scope) params.set("collection", scope);
      if (regions.length > 0) params.set("region", regions.join(","));
      fetch(apiUrl(`/api/heritage-assets?${params.toString()}`), {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((payload: unknown) => {
          const body = payload as {
            data?: SearchResultAsset[];
            pagination?: { total?: number };
          };
          setResults(Array.isArray(body?.data) ? body.data : []);
          setTotal(
            typeof body?.pagination?.total === "number"
              ? body.pagination.total
              : null
          );
          setIsLoading(false);
        })
        .catch((err: unknown) => {
          if ((err as Error)?.name === "AbortError") return;
          setResults([]);
          setTotal(null);
          setIsLoading(false);
        });
    }, 280);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, query, scope, regions]);

  const toggleRegion = (region: string) =>
    setRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );

  const hasFilters =
    query.trim().length > 0 || scope !== null || regions.length > 0;
  const activeFilterCount = (scope !== null ? 1 : 0) + regions.length;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search the archive"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[1045] overflow-y-auto bg-white transition-opacity duration-300 ease-house",
        open ? "top-0 opacity-100 pointer-events-auto" : "top-0 opacity-0 pointer-events-none"
      )}
    >
      <form
        onSubmit={(e) => e.preventDefault()}
        className="min-h-full px-3 pb-16 pt-[calc(var(--header-h)+28px)] sm:px-4 lg:px-6 xl:px-8"
      >
        {/* The field */}
        <fieldset className="flex items-baseline gap-4 border-b border-hairline pb-4">
          <input
            type="search"
            name="query"
            value={query}
            maxLength={60}
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find work by name, region, category, period"
            aria-label="Search the archive"
            className="f-heading-4 min-w-0 flex-1 border-0 bg-transparent text-ink placeholder:text-ink/35 focus:outline-none focus:ring-0"
          />
          <span
            aria-hidden="true"
            className="f-heading-4 hidden shrink-0 items-center text-ink-soft md:flex"
          >
            {isLoading ? "Searching\u2026" : "Search"}
          </span>
        </fieldset>

        {/* Filters */}
        <div className="mt-8 grid gap-y-10 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-x-0">
          <div>
            <h3 className="f-number uppercase tracking-[0.14em] text-ink-soft">
              Collection
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {COLLECTION_SCOPES.map((c) => (
                <FilterChip
                  key={c.value}
                  label={c.label}
                  selected={scope === c.value}
                  onClick={() => setScope((p) => (p === c.value ? null : c.value))}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 md:border-l md:border-hairline md:pl-10 lg:pl-16">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="f-number uppercase tracking-[0.14em] text-ink-soft">
                Region
              </h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setScope(null);
                    setRegions([]);
                  }}
                  className="f-caption shrink-0 text-ink-soft underline underline-offset-4 transition-colors duration-200 ease-house hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {GHANA_REGIONS.map((region) => (
                <FilterChip
                  key={region}
                  label={region}
                  selected={regions.includes(region)}
                  onClick={() => toggleRegion(region)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-14">
          <div className="flex items-baseline justify-between">
            <h2 className="f-heading-4 text-ink">
              {hasFilters ? "Results" : "Latest records"}
            </h2>
            <span className="f-number text-ink-soft">
              ({total ?? "\u2014"})
            </span>
          </div>

          {isLoading && results.length === 0 ? (
            <p className="f-caption py-16 text-ink/35">
              Opening the archive
            </p>
          ) : results.length === 0 ? (
            <p className="f-caption py-16 text-ink-soft">
              No records match. Clear a filter or try a shorter term.
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
              {results.map((asset) => {
                const image = previewImage(asset.media);
                const meta = metaLine(asset);
                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onSelectResult) {
                          onSelectResult(asset);
                        } else {
                          navigate(routeFor(asset));
                        }
                      }}
                      className="group block w-full text-left"
                    >
                      <span className="relative block aspect-[8/5] w-full overflow-hidden bg-ground-deep">
                        {image ? (
                          <img
                            src={image}
                            alt={asset.name}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center f-caption text-ink/25">
                            No media
                          </span>
                        )}
                      </span>
                      <span className="f-heading-5 mt-2.5 block min-h-[2.5em] text-ink">
                        <span className="line-clamp-2">{asset.name}</span>
                      </span>
                      {meta && (
                        <span className="f-caption mt-1 block text-ink-soft">
                          <span className="line-clamp-1">{meta}</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Mobile close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className={cn(
            "absolute right-3 top-[calc(var(--header-h)-44px)] flex h-9 w-9 items-center justify-center text-ink md:hidden",
            !open && "pointer-events-none opacity-0"
          )}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>
      </form>
    </div>
  );
};
