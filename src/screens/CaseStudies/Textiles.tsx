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
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export const Textiles = (): JSX.Element => {
  const [textiles, setTextiles] = useState<TextileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getMetadataTags = (item: TextileRecord): string[] => {
    const tags: string[] = [];
    if (item.asset_category) tags.push(item.asset_category);
    if (item.period) tags.push(item.period);
    if (item.material) tags.push(item.material);
    if (item.condition) tags.push(item.condition);
    if (item.current_location) tags.push(item.current_location);
    if (item.weight_kg) tags.push(`${item.weight_kg} kg`);
    if (item.height_m) tags.push(`${item.height_m} m`);
    return tags;
  };

  return (
    <div className="bg-white w-full h-screen pt-[80px] pb-[40px]">
      <Header />

      <div className="h-full overflow-y-auto py-4 px-4 sm:px-6 lg:px-8 scrollbar-hide">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Material/Texture catalogue</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Fabrics and textile-based heritage grouped into one place for easier cataloguing.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-[11px] tracking-widest text-black/45 py-20 text-center">
            Loading materials collection...
          </div>
        ) : textiles.length === 0 ? (
          <div className="border border-dashed border-black/15 p-8 text-sm text-black/55 text-center mx-6">
            No materials currently recorded in the collection.
          </div>
        ) : (
          /* 3-Column Grid */
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {textiles.map((textile) => {
              const metadataTags = getMetadataTags(textile);

              return (
                <motion.div
                  key={textile.id}
                  variants={fadeUp}
                  className="group cursor-pointer"
                >
                  {/* Gray Card with Centered Image */}
                  <div className="bg-[#f5f5f5] p-6 flex items-center justify-center aspect-[4/3]">
                    {textile.imageUrl ? (
                      <img
                        src={textile.imageUrl}
                        alt={textile.name}
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
                      {textile.name}
                    </h3>
                    {textile.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {textile.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  {metadataTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {metadataTags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-[10px] uppercase tracking-wider text-black/50"
                        >
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
