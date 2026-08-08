import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../../components/Header";
import { ModelViewer } from "../../components/ModelViewer";
import { PortfolioCard } from "../../components/PortfolioCard";
import { apiUrl, mediaUrl } from "../../lib/api";
import { Link } from "react-router-dom";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  caption?: string | null;
  isPrimary?: boolean;
};

type HeritageAsset = {
  id: string;
  name?: string | null;
  alternative_name?: string | null;
  description?: string | null;
  asset_type?: string | null;
  asset_category?: string | null;
  media?: MediaItem[];
};

type FlatMediaItem = {
  id: string;
  assetId: string;
  assetName: string;
  assetCategory: string;
  mediaType: string;
  filePath: string;
  caption: string;
  collectionType: "museums" | "artifacts" | "textiles" | "documents" | "other";
};

export const Gallery = (): JSX.Element => {
  const [mediaList, setMediaList] = useState<FlatMediaItem[]>([]);
  const [filteredList, setFilteredList] = useState<FlatMediaItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<string>("all");
  const [activeMedia, setActiveMedia] = useState<FlatMediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(apiUrl("/api/heritage-assets"));
        if (!response.ok) throw new Error("Failed to load gallery items.");
        const assets: HeritageAsset[] = await response.json();

        // Flatten assets to media items
        const list: FlatMediaItem[] = [];
        assets.forEach((asset) => {
          const name = asset.name || asset.alternative_name || asset.id;
          const category = asset.asset_category || asset.asset_type || "Unclassified";
          
          // Determine collection type based on category/type
          let colType: FlatMediaItem["collectionType"] = "other";
          const catLower = category.toLowerCase();
          const typeLower = (asset.asset_type || "").toLowerCase();
          
          if (catLower.includes("museum") || typeLower.includes("museum") || catLower.includes("site") || typeLower.includes("site") || catLower.includes("monument") || typeLower.includes("monument")) {
            colType = "museums";
          } else if (catLower.includes("artifact") || typeLower.includes("artifact") || catLower.includes("object") || typeLower.includes("object")) {
            colType = "artifacts";
          } else if (catLower.includes("textile") || typeLower.includes("textile") || catLower.includes("material") || typeLower.includes("material")) {
            colType = "textiles";
          } else if (catLower.includes("document") || typeLower.includes("document") || catLower.includes("photograph") || typeLower.includes("photograph") || catLower.includes("archive") || typeLower.includes("archive")) {
            colType = "documents";
          }

          if (asset.media && asset.media.length > 0) {
            asset.media.forEach((m) => {
              list.push({
                id: m.id,
                assetId: asset.id,
                assetName: name,
                assetCategory: category,
                mediaType: m.mediaType,
                filePath: m.filePath,
                caption: m.caption || name,
                collectionType: colType,
              });
            });
          }
        });
        setMediaList(list);
        setFilteredList(list);
      } catch (err) {
        console.error("Gallery fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAssets();
  }, []);

  useEffect(() => {
    let result = mediaList;

    if (selectedFilter !== "all") {
      result = result.filter((m) => m.collectionType === selectedFilter);
    }

    if (selectedMediaType !== "all") {
      result = result.filter((m) => m.mediaType === selectedMediaType);
    }

    setFilteredList(result);
  }, [selectedFilter, selectedMediaType, mediaList]);

  return (
    <div className="bg-[#0b0b0b] text-white w-full min-h-screen relative flex flex-col font-sans">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex flex-col">
        {/* Header section */}
        <div className="max-w-2xl mb-10 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Cinematic Media</p>
          <h1 className="text-4xl font-black tracking-tight uppercase leading-none text-white">Digital Gallery</h1>
          <p className="text-sm font-medium leading-relaxed text-white/70">
            Explore high-resolution digitized photography, detailed historical archives, and interactive 3D structures from across all catalogued collections.
          </p>
        </div>

        {/* Filters control bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          {/* Collection Filter */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Collections" },
              { id: "museums", label: "Heritage Sites" },
              { id: "artifacts", label: "Objects / Artefacts" },
              { id: "textiles", label: "Textiles / Materials" },
              { id: "documents", label: "Archives" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold border transition-colors ${
                  selectedFilter === f.id
                    ? "bg-white text-black border-white"
                    : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Media Type Filter */}
          <div className="flex gap-1.5">
            {[
              { id: "all", label: "All Media" },
              { id: "image", label: "Images" },
              { id: "model", label: "3D Models" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedMediaType(t.id)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold border transition-colors ${
                  selectedMediaType === t.id
                    ? "bg-white text-black border-white"
                    : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40 animate-pulse">Loading gallery assets...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-white/10">
            <p className="text-sm text-white/40">No media assets match the selected filters.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredList.map((m) => (
                <PortfolioCard
                  key={m.id}
                  id={m.id}
                  title={m.caption || m.assetName}
                  description={m.assetCategory}
                  imageUrl={m.filePath}
                  mediaType={m.mediaType}
                  category={m.assetCategory}
                  onClick={() => setActiveMedia(m)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Immersive Modal View */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={() => setActiveMedia(null)}
          >
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-6 right-6 text-white/60 hover:text-white focus:outline-none"
              aria-label="Close viewer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#111] max-w-4xl w-full border border-white/10 grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Container */}
              <div className="col-span-1 md:col-span-8 aspect-[4/3] bg-black flex items-center justify-center relative">
                {activeMedia.mediaType === "image" ? (
                  <img
                    src={mediaUrl(activeMedia.filePath)}
                    alt={activeMedia.caption}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full">
                    <ModelViewer modelUrl={mediaUrl(activeMedia.filePath)} autoRotate={true} />
                  </div>
                )}
              </div>

              {/* Panel Info */}
              <div className="col-span-1 md:col-span-4 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-[#E4002B] font-bold">
                      {activeMedia.assetCategory}
                    </span>
                    <h2 className="text-base font-black uppercase text-white leading-tight">
                      {activeMedia.caption}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/40">Linked Asset</p>
                    <p className="text-xs text-white/80 font-semibold">{activeMedia.assetName}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  {activeMedia.collectionType !== "other" && (
                    <Link
                      to={`/case-studies/${activeMedia.collectionType}`}
                      className="block w-full py-2.5 text-center text-[9px] uppercase tracking-[0.2em] font-bold bg-white text-black hover:bg-white/90 transition-colors"
                    >
                      View Collection Page
                    </Link>
                  )}
                  <button
                    onClick={() => setActiveMedia(null)}
                    className="block w-full py-2.5 text-center text-[9px] uppercase tracking-[0.2em] font-bold border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};