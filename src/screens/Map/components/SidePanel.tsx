import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeritageAsset } from "./HeritageLayer";
import { apiUrl } from "../../../lib/api";

interface SidePanelProps {
  asset: HeritageAsset | null;
  onClose: () => void;
  onZoomTo?: (asset: HeritageAsset) => void;
  darkMode?: boolean;
}

function getImages(asset: HeritageAsset): string[] {
  if (!asset.media || asset.media.length === 0) return [];
  const images = asset.media.filter((m) => m.mediaType === "image");
  if (images.length === 0) return [];
  const primary = images.find((m) => m.isPrimary);
  const sorted = primary
    ? [primary, ...images.filter((m) => m.id !== primary.id)]
    : images;
  return sorted.map((m) => apiUrl(m.filePath));
}

export const SidePanel: React.FC<SidePanelProps> = ({
  asset,
  onClose,
  onZoomTo,
  darkMode = false,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/10" : "border-black/10";
  const text = darkMode ? "text-white/90" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const bodyText = darkMode ? "text-white/70" : "text-black/70";

  const images = asset ? getImages(asset) : [];

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{
            type: "tween",
            duration: 0.25,
            ease: "easeOut",
          }}
          className={`absolute top-0 right-0 bottom-0 z-[1001] ${bg} border-l ${border} shadow-[-8px_0_24px_rgba(0,0,0,0.06)] overflow-y-auto`}
          style={{ width: 380, maxWidth: "90vw", top: 48 }}
        >
          <div className="relative">
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 z-10 ${darkMode ? "bg-[#0d0d0d]/90" : "bg-white/90"} backdrop-blur-sm border ${border} w-8 h-8 flex items-center justify-center ${darkMode ? "hover:bg-white/10" : "hover:bg-black/[0.05]"} transition-colors`}
            >
              <svg
                className={`w-4 h-4 ${text}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {images.length > 0 && (
              <div className="relative w-full aspect-[4/3] bg-black/5 overflow-hidden">
                <img
                  src={images[activeImageIndex]}
                  alt={asset.name || ""}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0
                            ? images.length - 1
                            : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === images.length - 1
                            ? 0
                            : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            i === activeImageIndex
                              ? "bg-white"
                              : "bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2
                  className={`text-lg font-light ${text} leading-tight`}
                >
                  {asset.name || asset.alternative_name || "Untitled"}
                </h2>
                {onZoomTo && (
                  <button
                    onClick={() => onZoomTo(asset)}
                    className={`shrink-0 mt-0.5 ${darkMode ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70"} transition-colors`}
                    title="Zoom to this asset"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p
                className={`text-[10px] uppercase ${muted} mb-5`}
              >
                {[
                  asset.asset_category,
                  asset.district,
                  asset.region,
                ]
                  .filter(Boolean)
                  .join(" \u00B7 ")}
              </p>

              <div className="grid grid-cols-2 gap-y-4 mb-5">
                {asset.asset_category && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      Type
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.asset_category}
                    </p>
                  </div>
                )}
                {asset.period && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      Period
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.period}
                    </p>
                  </div>
                )}
                {asset.condition && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      Condition
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.condition}
                    </p>
                  </div>
                )}
                {asset.ownership && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      Ownership
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.ownership}
                    </p>
                  </div>
                )}
                {asset.material && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      Material
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.material}
                    </p>
                  </div>
                )}
                {asset.cultural_group && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      Culture
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.cultural_group}
                    </p>
                  </div>
                )}
                {asset.conservation_status && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      UNESCO
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.conservation_status}
                    </p>
                  </div>
                )}
                {asset.period_start && (
                  <div>
                    <p
                      className={`text-[9px] uppercase ${muted} mb-0.5`}
                    >
                      Est. Date
                    </p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.period_start}
                      {asset.period_end
                        ? ` \u2014 ${asset.period_end}`
                        : ""}
                    </p>
                  </div>
                )}
              </div>

              {asset.description && (
                <div className="mb-6">
                  <p
                    className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-1.5`}
                  >
                    Description
                  </p>
                  <p
                    className={`text-xs ${bodyText} leading-relaxed line-clamp-6`}
                  >
                    {asset.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

SidePanel.displayName = "SidePanel";
