import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HeritageAsset } from "./HeritageLayer";
import { mediaUrl } from "../../../lib/api";

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
  return sorted.map((m) => mediaUrl(m.filePath));
}

const categoryColors: Record<string, string> = {
  Museum: "#E4002B",
  Fort: "#D35400",
  Castle: "#C0392B",
  Monument: "#8E44AD",
  Shrine: "#27AE60",
  Palace: "#F39C12",
  "Traditional Palace": "#E67E22",
  Artifact: "#2980B9",
  "Jewelry / Beadwork": "#1ABC9C",
  "Archaeological Site": "#7F8C8D",
  "Sacred Grove": "#2ECC71",
  "Historic Building": "#9B59B6",
  Festival: "#E74C3C",
  Textile: "#3498DB",
  "Textile (Kente, etc.)": "#2980B9",
  "Photograph / Digital Media": "#16A085",
  "Audio / Music": "#D4AC0D",
};

export const SidePanel: React.FC<SidePanelProps> = ({
  asset,
  onClose,
  onZoomTo,
  darkMode = false,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigate = useNavigate();

  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/10" : "border-black/10";
  const text = darkMode ? "text-white" : "text-gray-900";
  const muted = darkMode ? "text-white/40" : "text-gray-400";
  const bodyText = darkMode ? "text-white/65" : "text-gray-500";
  const sectionLabel = darkMode ? "text-white/30" : "text-gray-400";
  const cardBg = darkMode ? "bg-white/[0.04]" : "bg-gray-50";
  const hoverBg = darkMode ? "hover:bg-white/10" : "hover:bg-gray-100";

  const images = asset ? getImages(asset) : [];
  const catColor = asset
    ? categoryColors[asset.asset_category || ""] || (darkMode ? "#FF6B6B" : "#E4002B")
    : undefined;

  const handleViewMore = () => {
    if (!asset) return;
    navigate(`/case-studies/artifacts/${asset.id}`);
  };

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          className={`absolute top-0 right-0 bottom-0 z-[1002] ${bg} border-l ${border} shadow-2xl flex flex-col select-none`}
          style={{ width: 400, maxWidth: "90vw" }}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-5 py-3.5 border-b ${border} shrink-0`}
          >
            <span
              className={`text-[9px] uppercase font-mono tracking-[0.2em] ${sectionLabel}`}
            >
              Asset Dossier
            </span>
            <button
              onClick={onClose}
              className={`w-7 h-7 flex items-center justify-center border ${border} ${hoverBg} transition-colors`}
              title="Close"
            >
              <svg
                className={`w-3.5 h-3.5 ${muted}`}
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Carousel */}
            {images.length > 0 && (
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img
                  src={images[activeImageIndex]}
                  alt={asset.name || ""}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
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
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          aria-label={`Go to image ${i + 1}`}
                          className={`transition-all duration-200 ${
                            i === activeImageIndex
                              ? "w-5 h-1.5 bg-white"
                              : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Image count badge */}
                {images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5">
                    {activeImageIndex + 1}/{images.length}
                  </div>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="px-5 pt-5 pb-6">
              {/* Title & Category */}
              <div className="mb-4">
                <h2
                  className={`text-lg font-bold ${text} leading-snug mb-2`}
                >
                  {asset.name || asset.alternative_name || "Untitled Asset"}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {asset.asset_category && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5"
                      style={{
                        backgroundColor: catColor + "18",
                        color: catColor,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                      {asset.asset_category}
                    </span>
                  )}
                  {asset.district && (
                    <span
                      className={`text-[10px] font-mono ${muted}`}
                    >
                      {asset.district}
                      {asset.region ? `, ${asset.region}` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Fly To Button */}
              {onZoomTo && (
                <button
                  onClick={() => onZoomTo(asset)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 border ${border} ${cardBg} ${hoverBg} transition-colors mb-5`}
                >
                  <svg
                    className={`w-3.5 h-3.5 ${muted}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span
                    className={`text-[10px] uppercase font-mono font-bold tracking-wider ${muted}`}
                  >
                    Fly to on Map
                  </span>
                </button>
              )}

              {/* Key Details Grid */}
              <div className="mb-5">
                <p
                  className={`text-[9px] uppercase font-mono tracking-[0.2em] ${sectionLabel} mb-3`}
                >
                  Key Details
                </p>
                <div
                  className={`grid grid-cols-2 gap-px ${cardBg} border ${border} overflow-hidden`}
                >
                  {[
                    { label: "Period", value: asset.period },
                    { label: "Condition", value: asset.condition },
                    { label: "Ownership", value: asset.ownership },
                    { label: "Material", value: asset.material },
                    { label: "Culture", value: asset.cultural_group },
                    {
                      label: "UNESCO Status",
                      value: asset.conservation_status,
                    },
                    {
                      label: "Estimated Era",
                      value:
                        asset.period_start || asset.period_end
                          ? `${asset.period_start || "?"}${
                              asset.period_end
                                ? ` \u2014 ${asset.period_end}`
                                : ""
                            }`
                          : undefined,
                      mono: true,
                    },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div
                        key={item.label}
                        className={`px-3.5 py-3 ${
                          darkMode ? "bg-[#0d0d0d]" : "bg-white"
                        }`}
                      >
                        <p
                          className={`text-[9px] uppercase font-mono ${sectionLabel} mb-1`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-[11px] font-semibold ${
                            item.mono ? "font-mono" : ""
                          } ${text}`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Description */}
              {asset.description && (
                <div>
                  <p
                    className={`text-[9px] uppercase font-mono tracking-[0.2em] ${sectionLabel} mb-2.5`}
                  >
                    Overview & History
                  </p>
                  <p
                    className={`text-[12px] ${bodyText} leading-[1.7]`}
                  >
                    {asset.description.length > 220
                      ? asset.description.slice(0, 220) + "..."
                      : asset.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer — View More */}
          <div
            className={`shrink-0 border-t ${border} px-5 py-4`}
          >
            <button
              onClick={handleViewMore}
              className="w-full flex items-center justify-center gap-2 bg-[#E4002B] hover:bg-[#CC0026] text-white py-3 transition-colors"
            >
              <span className="text-[11px] uppercase font-mono font-bold tracking-wider">
                View Full Details
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

SidePanel.displayName = "SidePanel";
