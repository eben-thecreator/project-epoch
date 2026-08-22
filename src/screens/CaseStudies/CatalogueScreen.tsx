import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "../../components/Header";
import { apiUrl, mediaUrl } from "../../lib/api";

type MediaItem = {
  id: string;
  mediaType: string;
  filePath: string;
  fileName?: string | null;
  caption?: string | null;
  isPrimary?: boolean;
};

export type CatalogueRecord = {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  description?: string;
  material?: string;
  period?: string;
  condition?: string;
  region?: string;
  district?: string;
  community?: string;
  current_location?: string;
  asset_category?: string;
  alternative_name?: string;
  media: MediaItem[];
};

export const getPreviewImage = (media: MediaItem[]): string => {
  const image =
    media.find((m) => m.isPrimary && m.mediaType === "image") ||
    media.find((m) => m.mediaType === "image") ||
    media.find((m) => m.isPrimary) ||
    media[0];
  return image ? mediaUrl(image.filePath) : "";
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

interface CatalogueScreenProps {
  /** Collection scope sent to the API */
  collectionKey: "textiles" | "documents";
  title: string;
  subtitle: string;
  loadingLabel: string;
  emptyLabel: string;
}

/**
 * Shared grid screen for the textile and photo/archive catalogues.
 * The two screens were previously ~200 duplicated lines; they differ only in
 * API scope and copy.
 */
export const CatalogueScreen = ({
  collectionKey,
  title,
  subtitle,
  loadingLabel,
  emptyLabel,
}: CatalogueScreenProps): JSX.Element => {
  const [records, setRecords] = useState<CatalogueRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(apiUrl(`/api/heritage-assets?collection=${collectionKey}`), {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const mapped: CatalogueRecord[] = list.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => ({
            id: item.id,
            name:
              item.name || item.alternative_name || "Untitled Record",
            location:
              [item.region, item.district, item.community]
                .filter(Boolean)
                .join(", ") || "Location not recorded",
            imageUrl: getPreviewImage(item.media || []),
            description: item.description || undefined,
            material: item.material || undefined,
            period: item.period || undefined,
            condition: item.condition || undefined,
            region: item.region || undefined,
            district: item.district || undefined,
            community: item.community || undefined,
            current_location: item.current_location || undefined,
            asset_category: item.asset_category || undefined,
            alternative_name: item.alternative_name || undefined,
            media: Array.isArray(item.media) ? item.media : [],
          })
        );
        setRecords(mapped);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [collectionKey]);

  const getMetadataTags = (item: CatalogueRecord): string[] => {
    return [
      item.asset_category,
      item.period,
      item.condition,
      item.material,
      item.location,
    ].filter(Boolean) as string[];
  };

  return (
    <div className="bg-white w-full min-h-screen pt-[80px] pb-[40px]">
      <Header />

      <div className="py-4 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">{title}</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">{subtitle}</p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-[11px] tracking-widest text-black/45 py-20 text-center">
            {loadingLabel}
          </div>
        ) : records.length === 0 ? (
          <div className="border border-dashed border-black/15 p-8 text-sm text-black/55 text-center mx-6">
            {emptyLabel}
          </div>
        ) : (
          /* 3-Column Grid */
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {records.map((record) => {
              const metadataTags = getMetadataTags(record);

              return (
                <motion.div
                  key={record.id}
                  variants={fadeUp}
                  className="group cursor-pointer"
                >
                  {/* Gray Card with Centered Image */}
                  <div className="bg-[#f5f5f5] p-6 flex items-center justify-center aspect-[4/3]">
                    {record.imageUrl ? (
                      <img
                        src={record.imageUrl}
                        alt={record.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-[10px] tracking-widest font-bold text-black/25">
                        No Media
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-black leading-tight">
                      {record.name}
                    </h3>
                    {record.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {record.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  {metadataTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {metadataTags.map((tag, index) => (
                        <span key={`${tag}-${index}`} className="text-[10px] uppercase tracking-wider text-black/50">
                          {tag}
                          {index < metadataTags.length - 1 && (
                            <span className="ml-2">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};
