import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { HeritageAsset } from "./HeritageLayer";
import { mediaUrl } from "../../../lib/api";
import { categoryColor } from "../../../lib/categories";
import { useFocusTrap } from "../../../lib/useFocusTrap";
import { cn } from "../../../lib/utils";
import {
  computeNearby,
  computeRelated,
  RELATION_LABELS,
  type RelationKind,
} from "../lib/relations";
import { formatDistance } from "../lib/atlas";

interface DossierProps {
  asset: HeritageAsset | null;
  /** Full loaded collection — the pool nearby/related records resolve from. */
  pool: HeritageAsset[];
  onClose: () => void;
  onZoomTo?: (asset: HeritageAsset) => void;
  onJumpTo: (asset: HeritageAsset) => void;
  /** "sheet" docks the profile to the bottom on small screens. */
  variant?: "side" | "sheet";
}

function firstImage(asset: HeritageAsset): string | null {
  if (!asset.media || asset.media.length === 0) return null;
  const images = asset.media.filter((m) => m.mediaType === "image");
  if (images.length === 0) return null;
  const primary = images.find((m) => m.isPrimary);
  return mediaUrl((primary ?? images[0]).filePath);
}

const SectionLabel = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <p className="f-body-2 tracking-[0.02em] text-ink-soft">{children}</p>
);

const MetaRow = ({
  label,
  value,
  tabular = false,
}: {
  label: string;
  value?: string | null;
  tabular?: boolean;
}): JSX.Element | null => {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-hairline py-2.5 last:border-b-0">
      <dt className="f-body-2 shrink-0 text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "f-body-2 min-w-0 break-words text-right text-ink",
          tabular && "tabular-nums"
        )}
      >
        {value}
      </dd>
    </div>
  );
};

function Thumb({ asset }: { asset: HeritageAsset }) {
  const src = firstImage(asset);
  return (
    <span className="h-9 w-12 shrink-0 overflow-hidden border border-hairline bg-ground-deep">
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : null}
    </span>
  );
}

function RelRow({
  rel,
  km,
  padded = true,
  onJumpTo,
}: {
  rel: HeritageAsset;
  km?: number;
  padded?: boolean;
  onJumpTo: (a: HeritageAsset) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onJumpTo(rel)}
      className={cn(
        "flex w-full items-center gap-3 border-t border-hairline py-2 text-left transition-colors duration-150 hover:bg-ground-deep",
        padded ? "px-4" : "px-0"
      )}
    >
      <Thumb asset={rel} />
      <span className="min-w-0 flex-1">
        <span className="f-body-2 block truncate text-ink">{rel.name}</span>
        <span className="f-body-2 mt-0.5 block truncate text-ink-soft">
          {rel.asset_category || "Unclassified"}
        </span>
      </span>
      {km !== undefined && (
        <span className="f-body-2 shrink-0 tabular-nums text-ink-soft">
          {formatDistance(km)}
        </span>
      )}
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" className="shrink-0 text-ink-soft">
        <path d="M4 2l4 4-4 4" />
      </svg>
    </button>
  );
}

interface SheetProps extends Omit<DossierProps, "asset"> {
  asset: HeritageAsset;
}const DossierSheet: React.FC<SheetProps> = ({
  asset,
  pool,
  onClose,
  onZoomTo,
  onJumpTo,
  variant = "side",
}) => {
  const sheet = variant === "sheet";
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openRelation, setOpenRelation] = useState<RelationKind | null>("nearby");
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, onClose);

  useEffect(() => {
    setActiveImageIndex(0);
    setOpenRelation("nearby");
  }, [asset.id]);

  const shareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("sel", String(asset.id));
    navigator.clipboard?.writeText(url.toString()).catch(() => {});
  };

  const images = useMemo(() => {
    if (!asset.media || asset.media.length === 0) return [];
    const imgs = asset.media.filter((m) => m.mediaType === "image");
    const primary = imgs.find((m) => m.isPrimary);
    const sorted = primary
      ? [primary, ...imgs.filter((m) => m.id !== primary.id)]
      : imgs;
    return sorted.map((m) => mediaUrl(m.filePath));
  }, [asset]);

  const catColor = categoryColor(asset.asset_category, false);
  const safeIndex = Math.min(activeImageIndex, Math.max(images.length - 1, 0));

  const detailRouteFor = (a: HeritageAsset): string => {
    const category = a.asset_category || "";

    // Museums & heritage buildings → individual detail pages
    if (["Museum", "Fort", "Castle", "Monument", "Historic Building"].includes(category)) {
      return `/case-studies/museums/${a.id}`;
    }

    // Sacred / ceremonial sites → individual detail pages
    if (["Shrine", "Palace", "Traditional Palace", "Sacred Grove", "Archaeological Site"].includes(category)) {
      return `/case-studies/artifacts/${a.id}`;
    }

    // Textiles → listing page (no individual routes)
    if (category === "Textile" || category === "Textile (Kente, etc.)") {
      return "/case-studies/textiles";
    }

    // Documents & media → listing page (no individual routes)
    if (["Photograph / Digital Media", "Audio / Music"].includes(category)) {
      return "/case-studies/documents";
    }

    // Festivals, jewelry, and everything else → artifact detail
    return `/case-studies/artifacts/${a.id}`;
  };

  const pointCoordinate = (() => {
    if (!asset.geometry || asset.geometry.type !== "Point") return null;
    const c = asset.geometry.coordinates;
    if (Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number") {
      return { lat: c[1], lng: c[0] };
    }
    return null;
  })();

  const formatDMS = (value: number, isLat: boolean): string => {
    const hemi = isLat ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(1);
    return `${deg}\u00b0 ${min}' ${sec}" ${hemi}`;
  };

  const completeness =
    typeof asset.data_completeness_score === "number"
      ? Math.round(
          asset.data_completeness_score * (asset.data_completeness_score <= 1 ? 100 : 1)
        )
      : null;

  const nearby = useMemo(
    () => computeNearby(asset, pool, 6),
    [asset, pool]
  );
  const related = useMemo(
    () => computeRelated(asset, pool, 6),
    [asset, pool]
  );

  return (
    <motion.div
      ref={panelRef}
      role="complementary"
      aria-label="Asset profile"
      initial={sheet ? { y: "100%" } : { x: "100%" }}
      animate={sheet ? { y: 0 } : { x: 0 }}
      exit={sheet ? { y: "105%" } : { x: "100%" }}
      transition={{ type: "tween", duration: 0.32, ease: [0.59, 0.01, 0.28, 1] }}
      className={cn(
        "map-chrome flex flex-col bg-white font-sans",
        sheet
          ? "fixed inset-x-0 bottom-0 z-[1300] max-h-[82vh] min-h-[46vh] border-t border-hairline"
          : "absolute inset-y-0 right-0 z-[1002] w-full border-l border-hairline bg-white sm:w-[480px] lg:w-[560px]"
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-hairline px-5">
        <span className="f-body-2 text-ink-soft">Asset profile</span>
        <div className="flex items-center gap-1">
          {onZoomTo && (
            <button
              onClick={() => onZoomTo(asset)}
              aria-label="Centre on map"
              className="flex h-7 w-7 items-center justify-center text-ink-soft transition-colors duration-200 ease-house hover:text-ink"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
                <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </button>
          )}
          <button
            onClick={shareLink}
            aria-label="Copy link"
            className="text-ink-soft transition-colors duration-200 ease-house hover:text-ink"
          >
            <span className="f-body-2">Copy link</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="flex h-7 w-7 items-center justify-center text-ink-soft transition-colors duration-200 ease-house hover:text-ink"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {images.length > 0 && (
          <div className="px-5 pt-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-ground-deep">
              <img
                src={images[safeIndex]}
                alt={asset.name || ""}
                className="h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-hairline bg-white text-ink transition-colors duration-200 ease-house hover:text-brand"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border border-hairline bg-white text-ink transition-colors duration-200 ease-house hover:text-brand"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="f-number absolute right-3 top-3 border border-hairline bg-white px-2 py-1 tabular-nums text-ink">
                    {safeIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="px-5 pb-6 pt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {asset.asset_category && (
              <span className="inline-flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="1" y="1" width="22" height="22" fill="#1A1A1A" />
                  <rect x="2" y="2" width="20" height="20" fill="none" stroke={catColor} strokeWidth="1.5" />
                </svg>
                <span className="f-body-2 tracking-[0.02em]" style={{ color: catColor }}>
                  {asset.asset_category}
                </span>
              </span>
            )}
            {asset.district && (
              <span className="f-body-2 text-ink-soft">
                {asset.district}
                {asset.region ? `, ${asset.region}` : ""}
              </span>
            )}
          </div>

          <h2 className="f-heading-4 font-normal leading-tight text-ink">
            {asset.name || asset.alternative_name || "Untitled Asset"}
          </h2>

          <div className="mt-6">
            <SectionLabel>Key details</SectionLabel>
            <dl className="mt-1">
              <MetaRow label="Period" value={asset.period} />
              <MetaRow label="Condition" value={asset.condition} />
              <MetaRow label="Ownership" value={asset.ownership} />
              <MetaRow label="Material" value={asset.material} />
              <MetaRow label="Culture" value={asset.cultural_group} />
              <MetaRow label="UNESCO status" value={asset.conservation_status} />
              <MetaRow
                label="Era range"
                tabular
                value={
                  asset.period_start || asset.period_end
                    ? `${asset.period_start || "?"}${
                        asset.period_end ? ` \u2014 ${asset.period_end}` : ""
                      }`
                    : undefined
                }
              />
            </dl>
          </div>

          {(pointCoordinate || asset.geometry?.type) && (
            <div className="mt-6">
              <SectionLabel>Spatial record</SectionLabel>
              <dl className="mt-1">
                {pointCoordinate && (
                  <>
                    <MetaRow
                      label="Coordinates"
                      tabular
                      value={`${formatDMS(pointCoordinate.lat, true)} ${formatDMS(pointCoordinate.lng, false)}`}
                    />
                    <MetaRow
                      label="Decimal"
                      tabular
                      value={`${pointCoordinate.lat.toFixed(5)}, ${pointCoordinate.lng.toFixed(5)}`}
                    />
                  </>
                )}
                {!pointCoordinate && (
                  <MetaRow label="Geometry" value={String(asset.geometry?.type)} />
                )}
                {asset.gps_accuracy_m != null && (
                  <MetaRow label="GPS accuracy" tabular value={`\u00b1 ${asset.gps_accuracy_m} m`} />
                )}
                {asset.elevation_m != null && (
                  <MetaRow label="Elevation" tabular value={`${asset.elevation_m} m`} />
                )}
                {asset.data_source && (
                  <MetaRow label="Data source" value={String(asset.data_source)} />
                )}
              </dl>
              {completeness != null && (
                <div className="mt-3">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="f-body-2 text-ink-soft">Record completeness</span>
                    <span className="f-body-2 tabular-nums text-ink">{completeness}%</span>
                  </div>
                  <div className="h-[3px] w-full bg-white-line">
                    <div
                      className="h-full bg-ink"
                      style={{ width: `${Math.min(100, Math.max(0, completeness))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {asset.description && (
            <div className="mt-6 border-t border-hairline pt-5">
              <SectionLabel>Overview</SectionLabel>
              <p className="f-body-1 mt-2.5 leading-relaxed text-ink/85">
                {asset.description.length > 260
                  ? asset.description.slice(0, 260).trimEnd() + "\u2026"
                  : asset.description}
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-hairline pt-5">
            <SectionLabel>Nearby heritage</SectionLabel>
            {nearby.length === 0 ? (
              <p className="f-body-2 mt-2 text-ink-soft">
                No documented records within 50 km.
              </p>
            ) : (
              <ul className="mt-2 border-b border-hairline">
                {nearby.map(({ asset: rel, distanceKm }) => (
                  <li key={`near-${rel.id}`}>
                    <RelRow rel={rel} km={distanceKm} padded={false} onJumpTo={onJumpTo} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 border-t border-hairline pt-5">
            <SectionLabel>Related heritage</SectionLabel>
            <div className="mt-2 border border-hairline">
              {RELATION_LABELS.map(({ kind, label }) => {
                const count = related[kind].length;
                const isOpen = openRelation === kind;
                return (
                  <div key={kind} className="border-b border-hairline last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenRelation(isOpen ? null : kind)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-ground-deep"
                    >
                      <span className="f-body-2 text-ink">{label}</span>
                      <span className="flex items-center gap-2">
                        <span className="f-body-2 tabular-nums text-ink-soft">({count})</span>
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 8 8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.1"
                          aria-hidden="true"
                          className={cn(
                            "text-ink-soft transition-transform duration-250 ease-house",
                            isOpen && "rotate-180"
                          )}
                        >
                          <path d="M1 5.25L4 2.75L7 5.25" />
                        </svg>
                      </span>
                    </button>
                    {isOpen &&
                      (count === 0 ? (
                        <p className="f-body-2 px-4 pb-3 pt-1 text-ink-soft">
                          No linked records yet.
                        </p>
                      ) : (
                        <ul className="border-t border-hairline">
                          {related[kind].map(({ asset: rel, distanceKm }) => (
                            <li key={`rel-${kind}-${rel.id}`}>
                              <RelRow rel={rel} km={distanceKm} onJumpTo={onJumpTo} />
                            </li>
                          ))}
                        </ul>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-hairline px-5 py-4">
        <button
          onClick={() => navigate(detailRouteFor(asset))}
          className="group flex w-full items-center gap-2 text-left text-ink transition-colors duration-200 ease-house hover:text-ink-soft"
        >
          <span className="f-body-2">View more</span>
          <svg
            className="h-3 w-3 transition-transform duration-300 ease-house group-hover:translate-x-0.5"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <path d="M4 2l4 4-4 4" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export const Dossier: React.FC<DossierProps> = ({
  asset,
  ...rest
}) => (
  <AnimatePresence>
    {asset && (
      <DossierSheet
        key="asset-profile"
        asset={asset}
        {...rest}
      />
    )}
  </AnimatePresence>
);

Dossier.displayName = "Dossier";
