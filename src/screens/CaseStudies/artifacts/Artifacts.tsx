import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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

type Artifact = {
  id: string;
  title: string;
  location?: string;
  currentLocation?: string;
  type?: string;
  description: string;
  imageUrl: string;
  modelUrl: string;
  media: MediaItem[];
  year?: number | null;
  date?: string;
  material?: string;
  condition?: string;
  weight?: string;
  height?: string;
};

/* The house ease, captured from the reference build CSS */
const HOUSE: [number, number, number, number] = [0.59, 0.01, 0.28, 1];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: HOUSE } },
};

export const Artifacts = (): JSX.Element => {
  const { id: urlParamId } = useParams<{ id?: string }>();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl("/api/heritage-assets?collection=artifacts"));
        const data = await response.json();
        const mapped = data.map((item: any) => {
          const media: MediaItem[] = Array.isArray(item.media) ? item.media : [];
          return {
            id: item.id,
            title: item.name || item.alternative_name || item.id,
            location:
              [item.region, item.district, item.community]
                .filter(Boolean)
                .join(", ") || undefined,
            currentLocation: item.current_location || undefined,
            type: item.asset_category || item.asset_type || undefined,
            description: item.description || "No description recorded.",
            imageUrl: media.find((m: MediaItem) => m.mediaType === "image")?.filePath
              ? mediaUrl(media.find((m: MediaItem) => m.mediaType === "image")!.filePath)
              : "",
            modelUrl: media.find((m: MediaItem) => m.mediaType === "model")?.filePath
              ? mediaUrl(media.find((m: MediaItem) => m.mediaType === "model")!.filePath)
              : "",
            media,
            year: item.period_start ?? null,
            date: item.period || item.estimated_age || undefined,
            material: item.material || undefined,
            condition: item.condition || undefined,
            weight: item.weight_kg ? `${item.weight_kg} kg` : undefined,
            height: item.height_m ? `${item.height_m} m` : undefined,
          };
        });
        setArtifacts(mapped);
        if (mapped.length > 0) {
          if (urlParamId && mapped.some((a: Artifact) => a.id === urlParamId)) {
            setSelectedId(urlParamId);
          } else {
            setSelectedId(mapped[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching artifacts:", error);
      }
    };
    fetchData();
  }, [urlParamId]);

  const selected = artifacts.find((a) => a.id === selectedId) || null;
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

  /** Credits-rail row: gray caption over an ink value */
  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="f-caption text-ink-soft">{label}</p>
      <p className="f-body-2 text-ink mt-1">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white pt-[var(--header-h)]">
      <Header />

      <div className="shell grid grid-cols-1 md:grid-cols-12 gap-x-3 xl:gap-x-4 md:min-h-[calc(100vh-var(--header-h))]">
        {/* Left: Object gallery grid */}
        <div className="md:col-span-7 py-6 md:py-8 md:max-h-[calc(100vh-var(--header-h))] md:overflow-y-auto scrollbar-hide md:pr-3 xl:pr-4">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-12 xl:gap-x-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {artifacts.map((artifact) => (
              <motion.button
                key={artifact.id}
                variants={fadeUp}
                onClick={() => handleSelect(artifact.id)}
                className="group block cursor-pointer text-left"
              >
                {/* Picture well */}
                <div className="relative overflow-hidden bg-hairline">
                  <img
                    src={artifact.imageUrl}
                    alt={artifact.title}
                    loading="lazy"
                    className="w-full aspect-[3/2] object-cover transition-opacity duration-300"
                    onError={(e: any) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23E3E4E5'/%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Title & standfirst — work-card anatomy */}
                <div className="pt-2">
                  <h3 className="f-body-1 text-ink">{artifact.title}</h3>
                  <p className="f-body-1 text-ink-soft line-clamp-2">
                    {artifact.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Right: Model viewer + details + media gallery */}
        <div
          ref={detailsRef}
          className="md:col-span-5 py-6 md:py-8 md:max-h-[calc(100vh-var(--header-h))] md:overflow-y-auto space-y-8 scrollbar-hide md:border-l border-hairline md:pl-6 lg:pl-8"
        >
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: HOUSE }}
                className="space-y-8"
              >
                {/* Model viewer */}
                <div className="w-full aspect-[2/1] bg-paper-deep overflow-hidden border border-hairline">
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
                      <span className="f-caption text-ink-soft">No media</span>
                    </div>
                  )}
                </div>

                {/* Object details */}
                <div className="space-y-6">
                  <div>
                    <h1 className="f-heading-3 text-ink">{selected.title}</h1>
                    <p className="f-body-2 text-ink-soft mt-2">
                      {[selected.location, selected.type, selected.date]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                    {(
                      [
                        ["Location", selected.location],
                        ["Type / Category", selected.type],
                        ["Current Location", selected.currentLocation],
                        ["Period", selected.date],
                        ["Material", selected.material],
                        ["Condition", selected.condition],
                        ["Weight", selected.weight],
                        ["Height", selected.height],
                      ] as [string, string | undefined][]
                    )
                      .filter(([, value]) => Boolean(value && value !== "—" && value !== "Unknown"))
                      .map(([label, value]) => (
                        <DetailRow key={label} label={label} value={value!} />
                      ))}
                  </div>

                  <div>
                    <p className="f-caption text-ink-soft">Description</p>
                    <p className="f-body-2 text-ink mt-2">{selected.description}</p>
                  </div>
                </div>

                {/* Media gallery */}
                {imageMedia.length > 0 && (
                  <div className="space-y-3 pt-8 border-t border-hairline">
                    <p className="f-caption text-ink-soft">
                      Media Gallery ({imageMedia.length})
                    </p>
                    <div className="relative aspect-[16/10] bg-paper-deep overflow-hidden border border-hairline">
                      <AnimatePresence mode="wait">
                        {imageMedia[activeImageIndex] && (
                          <motion.img
                            key={imageMedia[activeImageIndex].id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: HOUSE }}
                            src={mediaUrl(imageMedia[activeImageIndex].filePath)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </AnimatePresence>

                      {/* Carousel arrow controls */}
                      {imageMedia.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev - 1 + imageMedia.length) % imageMedia.length);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-ink/80 hover:bg-ink text-white w-7 h-7 flex items-center justify-center transition-colors duration-200 focus:outline-none"
                            aria-label="Previous image"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev + 1) % imageMedia.length);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-ink/80 hover:bg-ink text-white w-7 h-7 flex items-center justify-center transition-colors duration-200 focus:outline-none"
                            aria-label="Next image"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {imageMedia.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                        {imageMedia.map((m, idx) => (
                          <button
                            key={m.id}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-14 h-9 flex-shrink-0 border overflow-hidden transition-all duration-200 ${
                              activeImageIndex === idx
                                ? "border-ink opacity-100"
                                : "border-hairline opacity-50 hover:opacity-100"
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
                transition={{ duration: 0.35, ease: HOUSE }}
                className="h-full flex items-center justify-center"
              >
                <p className="f-body-1 text-ink-soft">Select an object</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
