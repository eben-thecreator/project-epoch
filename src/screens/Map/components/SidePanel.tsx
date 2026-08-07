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
  const border = darkMode ? "border-white/15" : "border-black/15";
  const text = darkMode ? "text-white" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const bodyText = darkMode ? "text-white/70" : "text-black/70";
  const divider = darkMode ? "border-white/10" : "border-black/10";

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
          className={`absolute top-0 right-0 bottom-0 z-[1002] ${bg} border-l ${border} shadow-2xl overflow-y-auto select-none`}
          style={{ width: 400, maxWidth: "90vw" }}
        >
          <div className="relative">
            {/* Top Close Button & Header Bar */}
            <div className={`p-4 border-b ${divider} flex items-center justify-between`}>
              <span className={`text-[9px] uppercase font-mono tracking-widest ${muted}`}>
                ASSET DOSSIER
              </span>
              <button
                onClick={onClose}
                className={`w-7 h-7 flex items-center justify-center border ${border} ${darkMode ? "hover:bg-white/10" : "hover:bg-black/5"} transition-colors`}
                title="Close dossier"
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
            </div>

            {/* Media Gallery Carousel */}
            {images.length > 0 && (
              <div className="relative w-full aspect-[4/3] bg-black/10 overflow-hidden border-b border-white/10">
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
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/70 text-white flex items-center justify-center transition-colors"
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
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/70 text-white flex items-center justify-center transition-colors"
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
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-2 py-1">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-1.5 h-1.5 transition-colors ${i === activeImageIndex
                              ? "bg-[#E4002B]"
                              : "bg-white/40 hover:bg-white/70"
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Asset Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className={`text-xl font-bold ${text} leading-tight`}>
                  {asset.name || asset.alternative_name || "Untitled"}
                </h2>
                {onZoomTo && (
                  <button
                    onClick={() => onZoomTo(asset)}
                    className="shrink-0 px-2 py-1 bg-[#E4002B] text-white text-[9px] uppercase font-mono font-bold tracking-wider hover:bg-[#FF4D4D] transition-colors flex items-center gap-1"
                    title="Zoom map view to this asset"
                  >
                    <span>FLY TO</span>
                    <span>↗</span>
                  </button>
                )}
              </div>

              <p className={`text-[10px] uppercase font-mono tracking-wider ${muted} mb-6 border-b ${divider} pb-3`}>
                {[asset.asset_category, asset.district, asset.region]
                  .filter(Boolean)
                  .join(" \u00B7 ")}
              </p>

              {/* Key Attributes Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
                {asset.asset_category && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      CATEGORY
                    </p>
                    <p className={`text-xs font-semibold ${text}`}>
                      {asset.asset_category}
                    </p>
                  </div>
                )}
                {asset.period && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      PERIOD
                    </p>
                    <p className={`text-xs font-semibold ${text}`}>
                      {asset.period}
                    </p>
                  </div>
                )}
                {asset.condition && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      CONDITION
                    </p>
                    <p className={`text-xs font-semibold ${text}`}>
                      {asset.condition}
                    </p>
                  </div>
                )}
                {asset.ownership && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      OWNERSHIP
                    </p>
                    <p className={`text-xs font-semibold ${text}`}>
                      {asset.ownership}
                    </p>
                  </div>
                )}
                {asset.material && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      MATERIAL
                    </p>
                    <p className={`text-xs font-semibold ${text}`}>
                      {asset.material}
                    </p>
                  </div>
                )}
                {asset.cultural_group && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      CULTURE
                    </p>
                    <p className={`text-xs font-semibold ${text}`}>
                      {asset.cultural_group}
                    </p>
                  </div>
                )}
                {asset.conservation_status && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      UNESCO STATUS
                    </p>
                    <p className={`text-xs font-semibold ${text}`}>
                      {asset.conservation_status}
                    </p>
                  </div>
                )}
                {asset.period_start && (
                  <div>
                    <p className={`text-[9px] uppercase font-mono ${muted} mb-0.5`}>
                      ESTIMATED ERA
                    </p>
                    <p className={`text-xs font-mono font-semibold ${text}`}>
                      {asset.period_start}
                      {asset.period_end ? ` \u2014 ${asset.period_end}` : ""}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {asset.description && (
                <div className="border-t border-white/10 pt-4 mb-6">
                  <p className={`text-[9px] uppercase font-mono tracking-widest ${muted} mb-2`}>
                    OVERVIEW & HISTORY
                  </p>
                  <p className={`text-xs ${bodyText} leading-relaxed`}>
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
