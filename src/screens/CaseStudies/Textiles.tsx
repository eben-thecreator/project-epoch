import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../../components/Header";
import { apiUrl } from "../../lib/api";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  fileName?: string | null;
  caption?: string | null;
  isPrimary?: boolean;
};

type TextileRecord = {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  description?: string;
  material?: string;
  period?: string;
  condition?: string;
  weight_kg?: number;
  height_m?: number;
  region?: string;
  district?: string;
  community?: string;
  current_location?: string;
  asset_category?: string;
  alternative_name?: string;
  media: MediaItem[];
};

const getPreviewImage = (media: MediaItem[]): string => {
  const image =
    media.find((m) => m.isPrimary && m.mediaType === "image") ||
    media.find((m) => m.mediaType === "image") ||
    media.find((m) => m.isPrimary) ||
    media[0];
  return image ? apiUrl(image.filePath) : "";
};

// Single shared fade used for both open AND close — guarantees symmetry
const FADE = { duration: 0.22, ease: "easeInOut" } as const;

export const Textiles = (): JSX.Element => {
  const [textiles, setTextiles] = useState<TextileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          apiUrl("/api/heritage-assets?collection=textiles")
        );
        const data = await response.json();
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.name || item.alternative_name || "Untitled Textile",
          location:
            [item.region, item.district, item.community]
              .filter(Boolean)
              .join(", ") || "Location not recorded",
          imageUrl: getPreviewImage(item.media || []),
          description: item.description || undefined,
          material: item.material || undefined,
          period: item.period || undefined,
          condition: item.condition || undefined,
          weight_kg: item.weight_kg || undefined,
          height_m: item.height_m || undefined,
          region: item.region || undefined,
          district: item.district || undefined,
          community: item.community || undefined,
          current_location: item.current_location || undefined,
          asset_category: item.asset_category || undefined,
          alternative_name: item.alternative_name || undefined,
          media: Array.isArray(item.media) ? item.media : [],
        }));
        setTextiles(mapped);
      } catch (error) {
        console.error("Error fetching textiles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  // Reset horizontal scroll position each time a new item opens
  useEffect(() => {
    if (selectedId && scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ left: 0, behavior: "auto" });
        }
      });
    }
  }, [selectedId]);

  // Center the selected article in the usable viewport below the fixed header
  useEffect(() => {
    if (!selectedId) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = articleRefs.current.get(selectedId);
        if (!el) return;
        const headerH = 128; // matches pt-32 (8rem = 128px)
        const rect = el.getBoundingClientRect();
        const elCenterFromDoc = rect.top + window.scrollY + rect.height / 2;
        const visualCenter = headerH + (window.innerHeight - headerH) / 2;
        window.scrollTo({
          top: Math.max(0, elCenterFromDoc - visualCenter),
          behavior: "smooth",
        });
      });
    });
  }, [selectedId]);

  // Dismiss on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectedId &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setSelectedId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedId]);

  const getDetailFields = (item: TextileRecord) => {
    const fields: { label: string; value: string }[] = [];
    if (item.period) fields.push({ label: "Period", value: item.period });
    if (item.material) fields.push({ label: "Material", value: item.material });
    if (item.condition) fields.push({ label: "Condition", value: item.condition });
    if (item.current_location) fields.push({ label: "Current Location", value: item.current_location });
    if (item.asset_category) fields.push({ label: "Category", value: item.asset_category });
    if (item.weight_kg) fields.push({ label: "Weight", value: `${item.weight_kg} kg` });
    if (item.height_m) fields.push({ label: "Height", value: `${item.height_m} m` });
    return fields;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    const withinBounds =
      (e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart);
    if (e.shiftKey && withinBounds) {
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += e.deltaY;
    } else if (Math.abs(e.deltaX) > 0 && withinBounds) {
      el.scrollLeft += e.deltaX;
    }
  };

  return (
    <div className="bg-white w-full min-h-screen">
      <Header />

      <main className="pt-32 md:pt-36 pb-16">
        {isLoading ? (
          <div className="text-[11px] tracking-widest text-black/45 py-20 text-center">
            Loading textiles collection...
          </div>
        ) : textiles.length === 0 ? (
          <div className="border border-dashed border-black/15 p-8 text-sm text-black/55 text-center mx-6">
            No textiles currently recorded in the collection.
          </div>
        ) : (
          <div ref={listRef} className="flex flex-col gap-8">
            {textiles.map((textile) => {
              const isSelected = selectedId === textile.id;
              const fields = isSelected ? getDetailFields(textile) : [];
              const extraMedia = isSelected
                ? textile.media.filter(
                    (m) =>
                      m.mediaType === "image" &&
                      apiUrl(m.filePath) !== textile.imageUrl
                  )
                : [];

              return (
                <article
                  key={textile.id}
                  ref={(el) => {
                    if (el) articleRefs.current.set(textile.id, el);
                    else articleRefs.current.delete(textile.id);
                  }}
                >
                  {/*
                   * AnimatePresence mode="popLayout":
                   *   - exiting element is pulled from layout flow immediately
                   *   - entering element never fights the exiting one
                   *   - open & close use the exact same FADE constant = perfectly symmetric
                   */}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isSelected ? (
                      /* --- EXPANDED --- */
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={FADE}
                        className="w-full"
                      >
                        <div
                          ref={scrollRef}
                          className="overflow-x-auto"
                          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
                          onWheel={handleWheel}
                        >
                          <div className="flex items-center min-w-max">
                            {/* Left gutter */}
                            <div className="shrink-0 w-[6vw]" />

                            {/* Metadata column */}
                            <motion.div
                              initial={{ opacity: 0, x: -14 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -14 }}
                              transition={{ duration: 0.3, delay: 0.12 }}
                              className="shrink-0 w-[180px] text-right pr-8 self-start pt-2"
                            >
                              <h2 className="text-[15px] font-normal text-black leading-snug">
                                {textile.name}
                              </h2>
                              <p className="text-[10px] text-black/40 mt-0.5">
                                {textile.location}
                              </p>

                              {fields.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.28 }}
                                  className="mt-5 space-y-3"
                                >
                                  {fields.map((field) => (
                                    <div key={field.label}>
                                      <p className="text-[9px] uppercase tracking-wider text-black/50">
                                        {field.label}
                                      </p>
                                      <p className="text-[12px] text-black mt-0.5">
                                        {field.value}
                                      </p>
                                    </div>
                                  ))}
                                </motion.div>
                              )}

                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.38 }}
                                onClick={() => setSelectedId(null)}
                                className="mt-6 text-[9px] tracking-widest uppercase text-black/30 hover:text-black/70 transition-colors cursor-pointer"
                              >
                                Close
                              </motion.button>
                            </motion.div>

                            {/* Primary image */}
                            <div
                              className="shrink-0 overflow-hidden cursor-pointer"
                              style={{ width: "clamp(360px, 44vw, 680px)" }}
                              onClick={() => handleSelect(textile.id)}
                            >
                              {textile.imageUrl ? (
                                <img
                                  src={textile.imageUrl}
                                  alt={textile.name}
                                  className="w-full aspect-[4/3] object-cover block"
                                />
                              ) : (
                                <div className="w-full aspect-[4/3] bg-black/5 flex items-center justify-center">
                                  <div className="text-[10px] tracking-widest font-bold text-black/25">
                                    No Media
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {textile.description && (
                              <motion.p
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                transition={{ duration: 0.3, delay: 0.18 }}
                                className="text-[12px] text-black leading-relaxed shrink-0 w-[200px] px-8 self-start pt-2"
                              >
                                {textile.description}
                              </motion.p>
                            )}

                            {/* Extra media images */}
                            {extraMedia.map((m, i) => (
                              <motion.div
                                key={m.id}
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 24 }}
                                transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                                className="shrink-0 ml-4"
                                style={{ width: "clamp(360px, 44vw, 680px)" }}
                              >
                                <img
                                  src={apiUrl(m.filePath)}
                                  alt=""
                                  className="w-full aspect-[4/3] object-cover block"
                                />
                              </motion.div>
                            ))}

                            {/* Right gutter */}
                            <div className="shrink-0 w-[6vw]" />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* --- COLLAPSED --- */
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={FADE}
                        className="flex items-start gap-6 px-6 sm:px-10 lg:px-16 max-w-[700px] mx-auto cursor-pointer"
                        onClick={() => handleSelect(textile.id)}
                      >
                        <div className="pt-0.5 text-right shrink-0">
                          <h2 className="text-[14px] font-normal text-black leading-snug">
                            {textile.name}
                          </h2>
                          <p className="text-[10px] text-black/40">
                            {textile.location}
                          </p>
                        </div>

                        <div className="w-[280px] shrink-0 bg-black/5 overflow-hidden">
                          {textile.imageUrl ? (
                            <img
                              src={textile.imageUrl}
                              alt={textile.name}
                              className="w-full aspect-[4/3] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[4/3] flex items-center justify-center">
                              <div className="text-[10px] tracking-widest font-bold text-black/25">
                                No Media
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
