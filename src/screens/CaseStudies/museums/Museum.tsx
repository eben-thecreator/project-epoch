import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../../../components/Header";
import { ModelViewer } from "../../../components/ModelViewer";
import { apiUrl, mediaUrl } from "../../../lib/api";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  fileName?: string | null;
  caption?: string | null;
  isPrimary?: boolean;
};

type Museum = {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  imageUrl: string;
  modelUrl: string;
  media: MediaItem[];
  year?: number | null;
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export const Museum = (): JSX.Element => {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl("/api/heritage-assets?collection=museums"));
        const data = await response.json();
        const mapped = data.map((item: any) => {
          const media: MediaItem[] = Array.isArray(item.media) ? item.media : [];
          return {
            id: item.id,
            title: item.name || item.alternative_name || item.id,
            location:
              item.current_location ||
              [item.region, item.district, item.community].filter(Boolean).join(", ") ||
              "Unknown",
            type: item.asset_category || item.asset_type || "Site",
            description: item.description || "No description recorded.",
            imageUrl: media.find((m: MediaItem) => m.mediaType === "image")?.filePath
              ? mediaUrl(media.find((m: MediaItem) => m.mediaType === "image")!.filePath)
              : "",
            modelUrl: media.find((m: MediaItem) => m.mediaType === "model")?.filePath
              ? mediaUrl(media.find((m: MediaItem) => m.mediaType === "model")!.filePath)
              : "",
            media,
            year: item.period_start ?? null,
          };
        });
        setMuseums(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      } catch (error) {
        console.error("Error fetching museums:", error);
      }
    };
    fetchData();
  }, []);

  const selected = museums.find((m) => m.id === selectedId) || null;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    detailsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const imageMedia = selected
    ? selected.media.filter((m) => m.mediaType === "image")
    : [];

  return (
    <div className="bg-white w-full h-screen pt-[80px] pb-[40px]">
      <Header />

      <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 px-4 sm:px-6 lg:px-8">
        {/* Left: Museum gallery grid */}
        <div className="col-span-1 md:col-span-7 h-full overflow-y-auto py-4 scrollbar-hide">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {museums.map((museum) => (
              <motion.div
                key={museum.id}
                variants={fadeUp}
                onClick={() => handleSelect(museum.id)}
                className={`group cursor-pointer ${selectedId === museum.id ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
              >
                {/* Image Container without grey background */}
                <div className="relative overflow-hidden">
                  <img
                    src={museum.imageUrl}
                    alt={museum.title}
                    className="w-full aspect-video object-cover"
                    onError={(e: any) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23ccc'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Title & Description */}
                <div className="mt-2.5">
                  <h3 className="text-sm font-bold text-black leading-tight">{museum.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{museum.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: Model viewer + details + media gallery */}
        <div
          ref={detailsRef}
          className="col-span-1 md:col-span-5 h-full overflow-y-auto py-4 space-y-5 scrollbar-hide"
        >
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* Model viewer */}
                <div className="w-full aspect-[2/1] bg-black/5 overflow-hidden border border-black/5">
                  {selected.modelUrl ? (
                    <ModelViewer
                      modelUrl={selected.modelUrl}
                      autoRotate={false}
                    />
                  ) : selected.imageUrl ? (
                    <img
                      src={selected.imageUrl}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-black/20">
                        No media
                      </span>
                    </div>
                  )}
                </div>

                {/* Museum details */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-lg font-black uppercase leading-tight text-black">
                      {selected.title}
                    </h1>
                    <p className="text-[10px] uppercase font-bold text-black/40 mt-1">
                      {[selected.location, selected.type]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-black/40 mb-0.5">
                        Location
                      </p>
                      <p className="text-xs font-bold text-black">
                        {selected.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-black/40 mb-0.5">
                        Type
                      </p>
                      <p className="text-xs font-bold text-black">
                        {selected.type}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase font-bold text-black/30 mb-2">
                      Description
                    </p>
                    <p className="text-xs text-black/60 leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                </div>

                {/* Scrollable media gallery -> Redesigned Cinematic Carousel */}
                {imageMedia.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-black/5">
                    <p className="text-[9px] uppercase font-bold text-black/40">
                      Media Gallery ({imageMedia.length})
                    </p>
                    <div className="relative aspect-[16/10] bg-black/5 overflow-hidden border border-black/5">
                      <AnimatePresence mode="wait">
                        {imageMedia[activeImageIndex] && (
                          <motion.img
                            key={imageMedia[activeImageIndex].id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            src={mediaUrl(imageMedia[activeImageIndex].filePath)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </AnimatePresence>

                      {/* Carousel Arrow Controls */}
                      {imageMedia.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev - 1 + imageMedia.length) % imageMedia.length);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/75 hover:bg-black text-white w-7 h-7 flex items-center justify-center transition-colors focus:outline-none"
                            aria-label="Previous image"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev + 1) % imageMedia.length);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/75 hover:bg-black text-white w-7 h-7 flex items-center justify-center transition-colors focus:outline-none"
                            aria-label="Next image"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {imageMedia.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                        {imageMedia.map((m, idx) => (
                          <button
                            key={m.id}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-14 h-9 flex-shrink-0 border bg-black/5 overflow-hidden transition-all duration-200 ${activeImageIndex === idx
                              ? "border-black opacity-100"
                              : "border-transparent opacity-50 hover:opacity-100"
                              }`}
                          >
                            <img
                              src={mediaUrl(m.filePath)}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <p className="text-[10px] uppercase font-bold text-black/30">
                  Select a museum
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
