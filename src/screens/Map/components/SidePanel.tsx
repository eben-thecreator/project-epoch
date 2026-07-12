import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HeritageAsset } from "./HeritageLayer";
import { apiUrl } from "../../../lib/api";

interface SidePanelProps {
  asset: HeritageAsset | null;
  onClose: () => void;
  darkMode?: boolean;
}

function getPrimaryImage(asset: HeritageAsset): string | null {
  if (!asset.media || asset.media.length === 0) return null;
  const primary = asset.media.find((m) => m.isPrimary && m.mediaType === "image")
    || asset.media.find((m) => m.mediaType === "image");
  if (primary) return apiUrl(primary.filePath);
  return null;
}

export const SidePanel: React.FC<SidePanelProps> = ({ asset, onClose, darkMode = false }) => {
  const navigate = useNavigate();
  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/10" : "border-black/10";
  const text = darkMode ? "text-white/90" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const bodyText = darkMode ? "text-white/70" : "text-black/70";

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          className={`absolute top-0 right-0 bottom-0 z-[1001] ${bg} border-l ${border} shadow-[-8px_0_24px_rgba(0,0,0,0.06)] overflow-y-auto`}
          style={{ width: 380, maxWidth: "90vw" }}
        >
          <div className="relative">
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 z-10 ${darkMode ? "bg-[#0d0d0d]/90" : "bg-white/90"} backdrop-blur-sm border ${border} w-8 h-8 flex items-center justify-center ${darkMode ? "hover:bg-white/10" : "hover:bg-black/[0.05]"} transition-colors`}
            >
              <svg className={`w-4 h-4 ${text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {getPrimaryImage(asset) && (
              <div className="w-full aspect-[4/3] bg-black/5 overflow-hidden">
                <img
                  src={getPrimaryImage(asset)!}
                  alt={asset.name || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5">
              <h2 className={`text-lg font-light ${text} leading-tight mb-1`}>
                {asset.name || asset.alternative_name || "Untitled"}
              </h2>
              <p className={`text-[10px] uppercase tracking-[0.2em] ${muted} mb-5`}>
                {[asset.asset_category, asset.district, asset.region].filter(Boolean).join(" · ")}
              </p>

              <div className="grid grid-cols-2 gap-y-4 mb-5">
                {asset.asset_category && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>Type</p>
                    <p className={`text-xs font-medium ${text}`}>{asset.asset_category}</p>
                  </div>
                )}
                {asset.period && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>Period</p>
                    <p className={`text-xs font-medium ${text}`}>{asset.period}</p>
                  </div>
                )}
                {asset.condition && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>Condition</p>
                    <p className={`text-xs font-medium ${text}`}>{asset.condition}</p>
                  </div>
                )}
                {asset.ownership && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>Ownership</p>
                    <p className={`text-xs font-medium ${text}`}>{asset.ownership}</p>
                  </div>
                )}
                {asset.material && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>Material</p>
                    <p className={`text-xs font-medium ${text}`}>{asset.material}</p>
                  </div>
                )}
                {asset.cultural_group && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>Culture</p>
                    <p className={`text-xs font-medium ${text}`}>{asset.cultural_group}</p>
                  </div>
                )}
                {asset.conservation_status && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>UNESCO</p>
                    <p className={`text-xs font-medium ${text}`}>{asset.conservation_status}</p>
                  </div>
                )}
                {asset.period_start && (
                  <div>
                    <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-0.5`}>Est. Date</p>
                    <p className={`text-xs font-medium ${text}`}>
                      {asset.period_start}{asset.period_end ? ` — ${asset.period_end}` : ""}
                    </p>
                  </div>
                )}
              </div>

              {asset.description && (
                <div className="mb-6">
                  <p className={`text-[9px] uppercase tracking-[0.15em] ${muted} mb-1.5`}>Description</p>
                  <p className={`text-xs ${bodyText} leading-relaxed line-clamp-6`}>{asset.description}</p>
                </div>
              )}

              <button
                onClick={() => {
                  const route = asset.asset_category === 'Museum' ? `/case-studies/museums/${asset.id}` : `/case-studies/${asset.id}`;
                  navigate(route, { state: { from: "map" } });
                }}
                className={`w-full py-2.5 ${darkMode ? "bg-white text-black hover:bg-white/80" : "bg-black text-white hover:bg-black/80"} text-[10px] uppercase tracking-[0.2em] font-bold transition-colors`}
              >
                View Full Details
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

SidePanel.displayName = "SidePanel";
